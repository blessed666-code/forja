import { randomBytes } from 'node:crypto'
import { NextResponse } from 'next/server'
import { verifyCsrfRequest } from '@/lib/security/csrf'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { maskEmail, sanitizePlainText, validateCourtesyCode } from '@/lib/security/validation'
import { createSupabaseAdminClient, getAuthenticatedAccount } from '@/lib/supabase/server'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

function generateSecureCode(): string {
  const partA = randomBytes(2).toString('hex').toUpperCase()
  const partB = randomBytes(2).toString('hex').toUpperCase()
  return `FORJA-${partA}-${partB}`
}

export async function GET(req: Request) {
  const rl = checkRateLimit(req, 'admin:read', 40, 5 * 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Límite de consultas alcanzado.' }, { status: 429, headers: NO_STORE_HEADERS })
  }

  const account = await getAuthenticatedAccount({ allowRefresh: true })
  if (!account || account.role !== 'admin') {
    return NextResponse.json({ error: 'Acceso restringido a administradores.' }, { status: 403, headers: NO_STORE_HEADERS })
  }

  const adminClient = createSupabaseAdminClient()

  const [{ data: codes, error: codesErr }, { data: members, error: membersErr }] = await Promise.all([
    adminClient
      .from('courtesy_codes')
      .select('id, code, label, max_uses, uses_count, is_active, expires_at, created_at')
      .order('created_at', { ascending: false })
      .limit(100),
    adminClient
      .from('profiles')
      .select('id, email, role, is_active, courtesy_code_used, onboarding_completed, profile_data, created_at')
      .order('created_at', { ascending: false })
      .limit(200),
  ])

  if (codesErr || membersErr) {
    return NextResponse.json(
      { error: 'No se pudo cargar el panel administrativo desde Supabase.' },
      { status: 500, headers: NO_STORE_HEADERS },
    )
  }

  const safeMembers = (members ?? []).map((m) => {
    const pData = (m.profile_data ?? {}) as Record<string, unknown>
    return {
      id: String(m.id),
      maskedEmail: maskEmail(String(m.email)),
      name: typeof pData.name === 'string' && pData.name ? pData.name : 'Sin completar Quiz',
      clusterId: typeof pData.cluster_id === 'string' ? pData.cluster_id : 'Pendiente',
      role: m.role === 'admin' ? 'admin' : 'member',
      isActive: Boolean(m.is_active),
      courtesyCodeUsed: m.courtesy_code_used ? String(m.courtesy_code_used) : null,
      onboardingCompleted: Boolean(m.onboarding_completed),
      createdAt: String(m.created_at),
    }
  })

  return NextResponse.json(
    {
      codes: codes ?? [],
      members: safeMembers,
    },
    { headers: NO_STORE_HEADERS },
  )
}

export async function POST(req: Request) {
  const rl = checkRateLimit(req, 'admin:write', 20, 5 * 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Límite de creación alcanzado.' }, { status: 429, headers: NO_STORE_HEADERS })
  }

  if (!(await verifyCsrfRequest(req))) {
    return NextResponse.json({ error: 'Solicitud bloqueada por protección CSRF.' }, { status: 403, headers: NO_STORE_HEADERS })
  }

  const account = await getAuthenticatedAccount({ allowRefresh: true })
  if (!account || account.role !== 'admin') {
    return NextResponse.json({ error: 'Acceso restringido a administradores.' }, { status: 403, headers: NO_STORE_HEADERS })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const rawCustomCode = sanitizePlainText(body.customCode, 32)
    let finalCode = generateSecureCode()

    if (rawCustomCode) {
      const checked = validateCourtesyCode(rawCustomCode)
      if (!checked.ok) {
        return NextResponse.json({ error: checked.error }, { status: 400, headers: NO_STORE_HEADERS })
      }
      finalCode = checked.code
    }

    const label = sanitizePlainText(body.label, 80) || 'Cortesía Exclusiva FORJA'
    const rawMax = typeof body.maxUses === 'number' && Number.isFinite(body.maxUses) ? Math.round(body.maxUses) : 1
    const maxUses = Math.min(500, Math.max(1, rawMax))

    let expiresAt: string | null = null
    if (typeof body.expiresInDays === 'number' && Number.isFinite(body.expiresInDays) && body.expiresInDays > 0) {
      const days = Math.min(365, Math.max(1, Math.round(body.expiresInDays)))
      expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString()
    }

    const adminClient = createSupabaseAdminClient()
    const { data, error } = await adminClient
      .from('courtesy_codes')
      .insert({
        code: finalCode,
        label,
        max_uses: maxUses,
        is_active: true,
        expires_at: expiresAt,
        created_by: account.userId,
      })
      .select('id, code, label, max_uses, uses_count, is_active, expires_at, created_at')
      .single()

    if (error) {
      if (error.message.toLowerCase().includes('duplicate') || error.code === '23505') {
        return NextResponse.json({ error: 'Ese código ya existe. Elige otro nombre.' }, { status: 409, headers: NO_STORE_HEADERS })
      }
      return NextResponse.json({ error: 'No fue posible crear el código.' }, { status: 500, headers: NO_STORE_HEADERS })
    }

    return NextResponse.json({ ok: true, code: data }, { headers: NO_STORE_HEADERS })
  } catch {
    return NextResponse.json({ error: 'Error creando código de cortesía.' }, { status: 500, headers: NO_STORE_HEADERS })
  }
}

export async function PATCH(req: Request) {
  if (!(await verifyCsrfRequest(req))) {
    return NextResponse.json({ error: 'Solicitud bloqueada por protección CSRF.' }, { status: 403, headers: NO_STORE_HEADERS })
  }

  const account = await getAuthenticatedAccount({ allowRefresh: true })
  if (!account || account.role !== 'admin') {
    return NextResponse.json({ error: 'Acceso restringido a administradores.' }, { status: 403, headers: NO_STORE_HEADERS })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const id = sanitizePlainText(body.id, 64)
    const isActive = Boolean(body.isActive)

    if (!/^[0-9a-f-]{36}$/i.test(id)) {
      return NextResponse.json({ error: 'Identificador inválido.' }, { status: 400, headers: NO_STORE_HEADERS })
    }

    const adminClient = createSupabaseAdminClient()
    const { error } = await adminClient
      .from('courtesy_codes')
      .update({ is_active: isActive })
      .eq('id', id)

    if (error) {
      return NextResponse.json({ error: 'No se pudo actualizar el código.' }, { status: 500, headers: NO_STORE_HEADERS })
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS })
  } catch {
    return NextResponse.json({ error: 'Error actualizando código.' }, { status: 500, headers: NO_STORE_HEADERS })
  }
}
