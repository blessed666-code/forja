import { NextResponse } from 'next/server'
import { CLEAN_DEFAULT_PROFILE } from '@/data/seed'
import { verifyCsrfRequest } from '@/lib/security/csrf'
import { checkRateLimit } from '@/lib/security/rateLimit'
import {
  sanitizePlainText,
  validateCourtesyCode,
  validateEmail,
  validatePassword,
} from '@/lib/security/validation'
import { devRegisterUser, isLocalDevAuthEnabled } from '@/lib/supabase/devAuthStore'
import {
  createSupabaseAdminClient,
  createSupabaseAnonServerClient,
  isConfiguredAdminEmail,
  isSupabaseConfigured,
  setAuthSessionCookies,
} from '@/lib/supabase/server'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

export async function POST(req: Request) {
  const rl = checkRateLimit(req, 'auth:register', 8, 15 * 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Demasiados intentos. Espera ${rl.retryAfterSec} segundos antes de volver a intentar.` },
      { status: 429, headers: { ...NO_STORE_HEADERS, 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  if (!(await verifyCsrfRequest(req))) {
    return NextResponse.json(
      { error: 'Solicitud bloqueada por protección de seguridad CSRF. Recarga la página e inténtalo de nuevo.' },
      { status: 403, headers: NO_STORE_HEADERS },
    )
  }

  if (!isSupabaseConfigured()) {
    if (!isLocalDevAuthEnabled()) {
      return NextResponse.json(
        {
          error:
            'La base de datos Supabase aún no está configurada en las variables de entorno (.env.local / Vercel).',
        },
        { status: 503, headers: NO_STORE_HEADERS },
      )
    }

    try {
      const body = (await req.json()) as Record<string, unknown>
      const codeCheck = validateCourtesyCode(body.courtesyCode)
      if (!codeCheck.ok) {
        return NextResponse.json({ error: codeCheck.error }, { status: 400, headers: NO_STORE_HEADERS })
      }
      const name = sanitizePlainText(body.name, 60)
      if (name.length < 2) {
        return NextResponse.json(
          { error: 'Ingresa tu nombre (mínimo 2 caracteres).' },
          { status: 400, headers: NO_STORE_HEADERS },
        )
      }
      const emailCheck = validateEmail(body.email)
      if (!emailCheck.ok) {
        return NextResponse.json({ error: emailCheck.error }, { status: 400, headers: NO_STORE_HEADERS })
      }
      const passCheck = validatePassword(body.password)
      if (!passCheck.ok) {
        return NextResponse.json({ error: passCheck.error }, { status: 400, headers: NO_STORE_HEADERS })
      }

      const devReg = devRegisterUser({
        courtesyCode: codeCheck.code,
        name,
        email: emailCheck.email,
        password: passCheck.password,
      })

      if (!devReg.ok) {
        return NextResponse.json({ error: devReg.error }, { status: devReg.status, headers: NO_STORE_HEADERS })
      }

      await setAuthSessionCookies(devReg.accessToken, devReg.refreshToken, 60 * 60 * 24)
      return NextResponse.json(
        {
          ok: true,
          role: devReg.role,
          onboardingCompleted: false,
          initialName: name,
        },
        { headers: NO_STORE_HEADERS },
      )
    } catch {
      return NextResponse.json(
        { error: 'Error procesando el registro local.' },
        { status: 500, headers: NO_STORE_HEADERS },
      )
    }
  }

  try {
    const body = (await req.json()) as Record<string, unknown>

    const codeCheck = validateCourtesyCode(body.courtesyCode)
    if (!codeCheck.ok) {
      return NextResponse.json({ error: codeCheck.error }, { status: 400, headers: NO_STORE_HEADERS })
    }

    const name = sanitizePlainText(body.name, 60)
    if (name.length < 2) {
      return NextResponse.json(
        { error: 'Ingresa tu nombre (mínimo 2 caracteres).' },
        { status: 400, headers: NO_STORE_HEADERS },
      )
    }

    const emailCheck = validateEmail(body.email)
    if (!emailCheck.ok) {
      return NextResponse.json({ error: emailCheck.error }, { status: 400, headers: NO_STORE_HEADERS })
    }

    const passCheck = validatePassword(body.password)
    if (!passCheck.ok) {
      return NextResponse.json({ error: passCheck.error }, { status: 400, headers: NO_STORE_HEADERS })
    }

    const adminClient = createSupabaseAdminClient()

    // 1. Pre-validación del código de cortesía antes de crear credenciales
    const { data: codeRow, error: codeLookupErr } = await adminClient
      .from('courtesy_codes')
      .select('id, code, max_uses, uses_count, is_active, expires_at')
      .eq('code', codeCheck.code)
      .maybeSingle()

    if (codeLookupErr) {
      return NextResponse.json(
        { error: 'No se pudo verificar el código de cortesía. Verifica que ejecutaste supabase/schema.sql.' },
        { status: 500, headers: NO_STORE_HEADERS },
      )
    }

    if (!codeRow || !codeRow.is_active) {
      return NextResponse.json(
        { error: 'Código de cortesía inválido o desactivado. Solicita tu invitación oficial.' },
        { status: 403, headers: NO_STORE_HEADERS },
      )
    }

    if (codeRow.expires_at && new Date(String(codeRow.expires_at)).getTime() <= Date.now()) {
      return NextResponse.json(
        { error: 'Este código de cortesía ha vencido.' },
        { status: 403, headers: NO_STORE_HEADERS },
      )
    }

    if (Number(codeRow.uses_count) >= Number(codeRow.max_uses)) {
      return NextResponse.json(
        { error: 'Este código de cortesía ya alcanzó su límite máximo de usos.' },
        { status: 403, headers: NO_STORE_HEADERS },
      )
    }

    // 2. Verificar si es el primer usuario del sistema para otorgar rol admin al fundador
    const { count: existingProfilesCount } = await adminClient
      .from('profiles')
      .select('id', { count: 'exact', head: true })

    // 3. Crear usuario en Supabase Auth con correo confirmado en servidor (evita cuello de botella SMTP)
    const { data: created, error: createErr } = await adminClient.auth.admin.createUser({
      email: emailCheck.email,
      password: passCheck.password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (createErr || !created.user) {
      const msg = (createErr?.message ?? '').toLowerCase()
      if (msg.includes('already') || msg.includes('registered') || msg.includes('exists')) {
        return NextResponse.json(
          { error: 'Este correo ya tiene una cuenta activa. Usa la pestaña Iniciar Sesión.' },
          { status: 409, headers: NO_STORE_HEADERS },
        )
      }
      return NextResponse.json(
        { error: 'No fue posible crear la cuenta en este momento.' },
        { status: 400, headers: NO_STORE_HEADERS },
      )
    }

    const userId = created.user.id

    // 4. Canje atómico con bloqueo FOR UPDATE en PostgreSQL
    const { data: rpcResult, error: rpcErr } = await adminClient.rpc('consume_courtesy_code', {
      p_code: codeCheck.code,
      p_user_id: userId,
    })

    const redeemedOk = Boolean(
      !rpcErr && rpcResult && typeof rpcResult === 'object' && (rpcResult as { ok?: boolean }).ok === true,
    )

    if (!redeemedOk) {
      await adminClient.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: 'El código de cortesía acaba de agotarse o no pudo canjearse.' },
        { status: 403, headers: NO_STORE_HEADERS },
      )
    }

    const role: 'admin' | 'member' =
      isConfiguredAdminEmail(emailCheck.email) || (existingProfilesCount ?? 0) === 0 ? 'admin' : 'member'

    const initialProfile = {
      ...CLEAN_DEFAULT_PROFILE,
      name,
    }

    const { error: insertProfileErr } = await adminClient.from('profiles').insert({
      id: userId,
      email: emailCheck.email,
      role,
      is_active: true,
      courtesy_code_used: codeCheck.code,
      onboarding_completed: false,
      profile_data: initialProfile,
    })

    if (insertProfileErr) {
      await adminClient.auth.admin.deleteUser(userId)
      return NextResponse.json(
        { error: 'Error registrando el perfil del atleta en la base de datos.' },
        { status: 500, headers: NO_STORE_HEADERS },
      )
    }

    // 5. Iniciar sesión segura en cookies HttpOnly
    const anonClient = createSupabaseAnonServerClient()
    const { data: signInData, error: signInErr } = await anonClient.auth.signInWithPassword({
      email: emailCheck.email,
      password: passCheck.password,
    })

    if (signInErr || !signInData.session) {
      return NextResponse.json(
        { ok: true, requiresManualLogin: true },
        { headers: NO_STORE_HEADERS },
      )
    }

    await setAuthSessionCookies(
      signInData.session.access_token,
      signInData.session.refresh_token,
      signInData.session.expires_in,
    )

    return NextResponse.json(
      {
        ok: true,
        role,
        onboardingCompleted: false,
        initialName: name,
      },
      { headers: NO_STORE_HEADERS },
    )
  } catch {
    return NextResponse.json(
      { error: 'Error procesando el registro exclusivo.' },
      { status: 500, headers: NO_STORE_HEADERS },
    )
  }
}
