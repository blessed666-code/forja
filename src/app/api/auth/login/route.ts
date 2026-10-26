import { NextResponse } from 'next/server'
import { verifyCsrfRequest } from '@/lib/security/csrf'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { validateEmail } from '@/lib/security/validation'
import { devLoginUser, isLocalDevAuthEnabled } from '@/lib/supabase/devAuthStore'
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
  const rl = checkRateLimit(req, 'auth:login', 8, 15 * 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: `Demasiados intentos de acceso. Espera ${rl.retryAfterSec} segundos.` },
      { status: 429, headers: { ...NO_STORE_HEADERS, 'Retry-After': String(rl.retryAfterSec) } },
    )
  }

  if (!(await verifyCsrfRequest(req))) {
    return NextResponse.json(
      { error: 'Solicitud bloqueada por protección CSRF. Recarga la página e intenta nuevamente.' },
      { status: 403, headers: NO_STORE_HEADERS },
    )
  }

  if (!isSupabaseConfigured()) {
    if (!isLocalDevAuthEnabled()) {
      return NextResponse.json(
        { error: 'La base de datos Supabase aún no está configurada en las variables de entorno.' },
        { status: 503, headers: NO_STORE_HEADERS },
      )
    }

    try {
      const body = (await req.json()) as Record<string, unknown>
      const emailCheck = validateEmail(body.email)
      const password = typeof body.password === 'string' ? body.password : ''

      if (!emailCheck.ok || !password || password.length > 128) {
        return NextResponse.json(
          { error: 'Credenciales inválidas. Verifica tu correo y contraseña.' },
          { status: 401, headers: NO_STORE_HEADERS },
        )
      }

      const devRes = devLoginUser({ email: emailCheck.email, password })
      if (!devRes.ok) {
        return NextResponse.json(
          { error: devRes.error },
          { status: devRes.status, headers: NO_STORE_HEADERS },
        )
      }

      await setAuthSessionCookies(devRes.accessToken, devRes.refreshToken, 60 * 60 * 24)
      return NextResponse.json(
        {
          ok: true,
          role: devRes.role,
          onboardingCompleted: devRes.onboardingCompleted,
          profile: devRes.profile,
        },
        { headers: NO_STORE_HEADERS },
      )
    } catch {
      return NextResponse.json(
        { error: 'Error procesando el inicio de sesión local.' },
        { status: 500, headers: NO_STORE_HEADERS },
      )
    }
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const emailCheck = validateEmail(body.email)
    const password = typeof body.password === 'string' ? body.password : ''

    if (!emailCheck.ok || !password || password.length > 128) {
      return NextResponse.json(
        { error: 'Credenciales inválidas. Verifica tu correo y contraseña.' },
        { status: 401, headers: NO_STORE_HEADERS },
      )
    }

    const anonClient = createSupabaseAnonServerClient()
    const { data, error } = await anonClient.auth.signInWithPassword({
      email: emailCheck.email,
      password,
    })

    // Nunca se registran contraseñas ni tokens en consola aunque falle el inicio de sesión
    if (error || !data.session || !data.user) {
      return NextResponse.json(
        { error: 'Correo o contraseña incorrectos.' },
        { status: 401, headers: NO_STORE_HEADERS },
      )
    }

    const adminClient = createSupabaseAdminClient()
    const { data: profileRow } = await adminClient
      .from('profiles')
      .select('id, role, is_active, onboarding_completed, profile_data')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!profileRow || !profileRow.is_active) {
      await adminClient.auth.admin.signOut(data.user.id, 'global')
      return NextResponse.json(
        { error: 'Tu acceso se encuentra desactivado o sin membresía de cortesía activa.' },
        { status: 403, headers: NO_STORE_HEADERS },
      )
    }

    let role: 'member' | 'admin' = profileRow.role === 'admin' ? 'admin' : 'member'
    if (role !== 'admin' && isConfiguredAdminEmail(emailCheck.email)) {
      role = 'admin'
      await adminClient.from('profiles').update({ role: 'admin' }).eq('id', data.user.id)
    }

    await setAuthSessionCookies(
      data.session.access_token,
      data.session.refresh_token,
      data.session.expires_in,
    )

    return NextResponse.json(
      {
        ok: true,
        role,
        onboardingCompleted: Boolean(profileRow.onboarding_completed),
        profile: profileRow.profile_data ?? null,
      },
      { headers: NO_STORE_HEADERS },
    )
  } catch {
    return NextResponse.json(
      { error: 'Error procesando el inicio de sesión.' },
      { status: 500, headers: NO_STORE_HEADERS },
    )
  }
}
