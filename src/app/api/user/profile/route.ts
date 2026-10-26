import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyCsrfRequest } from '@/lib/security/csrf'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { validateProfilePayload } from '@/lib/security/validation'
import { devUpdateProfile, isLocalDevAuthEnabled } from '@/lib/supabase/devAuthStore'
import {
  createSupabaseUserServerClient,
  getAuthenticatedAccount,
  getSessionCookieNames,
  isSupabaseConfigured,
} from '@/lib/supabase/server'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

export async function PUT(req: Request) {
  const rl = checkRateLimit(req, 'user:profile', 30, 5 * 60_000)
  if (!rl.allowed) {
    return NextResponse.json(
      { error: 'Demasiadas actualizaciones seguidas. Intenta en unos segundos.' },
      { status: 429, headers: NO_STORE_HEADERS },
    )
  }

  if (!(await verifyCsrfRequest(req))) {
    return NextResponse.json({ error: 'Solicitud bloqueada por protección CSRF.' }, { status: 403, headers: NO_STORE_HEADERS })
  }

  if (!isSupabaseConfigured()) {
    if (isLocalDevAuthEnabled()) {
      try {
        const body = (await req.json()) as Record<string, unknown>
        const onboardingCompleted = Boolean(body.onboardingCompleted ?? true)
        const validated = validateProfilePayload(body.profile)
        if (!validated.ok) {
          return NextResponse.json({ error: validated.error }, { status: 400, headers: NO_STORE_HEADERS })
        }
        const store = await cookies()
        const names = getSessionCookieNames()
        const token = store.get(names.access)?.value ?? ''
        if (token) {
          devUpdateProfile(token, validated.profile, onboardingCompleted)
        }
        return NextResponse.json({ ok: true, localDevAuth: true }, { headers: NO_STORE_HEADERS })
      } catch {
        return NextResponse.json({ error: 'Error procesando el perfil.' }, { status: 500, headers: NO_STORE_HEADERS })
      }
    }
    return NextResponse.json({ ok: true, localOnly: true }, { headers: NO_STORE_HEADERS })
  }

  const account = await getAuthenticatedAccount({ allowRefresh: true })
  if (!account) {
    return NextResponse.json({ error: 'Sesión no autorizada.' }, { status: 401, headers: NO_STORE_HEADERS })
  }

  try {
    const body = (await req.json()) as Record<string, unknown>
    const onboardingCompleted = Boolean(body.onboardingCompleted ?? true)
    const validated = validateProfilePayload(body.profile)

    if (!validated.ok) {
      return NextResponse.json({ error: validated.error }, { status: 400, headers: NO_STORE_HEADERS })
    }

    const userClient = createSupabaseUserServerClient(account.accessToken)
    const { error } = await userClient
      .from('profiles')
      .update({
        profile_data: validated.profile,
        onboarding_completed: onboardingCompleted,
      })
      .eq('id', account.userId)

    if (error) {
      return NextResponse.json(
        { error: 'No fue posible guardar tu perfil en la base de datos.' },
        { status: 500, headers: NO_STORE_HEADERS },
      )
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS })
  } catch {
    return NextResponse.json({ error: 'Error procesando el perfil.' }, { status: 500, headers: NO_STORE_HEADERS })
  }
}
