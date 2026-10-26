import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyCsrfRequest } from '@/lib/security/csrf'
import { checkRateLimit } from '@/lib/security/rateLimit'
import { sanitizePlainText } from '@/lib/security/validation'
import { devAddHistory, isLocalDevAuthEnabled } from '@/lib/supabase/devAuthStore'
import {
  createSupabaseUserServerClient,
  getAuthenticatedAccount,
  getSessionCookieNames,
  isSupabaseConfigured,
} from '@/lib/supabase/server'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

export async function POST(req: Request) {
  const rl = checkRateLimit(req, 'user:history', 25, 5 * 60_000)
  if (!rl.allowed) {
    return NextResponse.json({ error: 'Demasiadas peticiones.' }, { status: 429, headers: NO_STORE_HEADERS })
  }

  if (!(await verifyCsrfRequest(req))) {
    return NextResponse.json({ error: 'Solicitud bloqueada por protección CSRF.' }, { status: 403, headers: NO_STORE_HEADERS })
  }

  if (!isSupabaseConfigured()) {
    if (isLocalDevAuthEnabled()) {
      try {
        const body = (await req.json()) as Record<string, unknown>
        const sessionId = sanitizePlainText(body.sessionId, 80)
        const sessionName = sanitizePlainText(body.sessionName, 160)
        const rawSets = typeof body.setsDone === 'number' && Number.isFinite(body.setsDone) ? Math.round(body.setsDone) : 0
        const setsDone = Math.min(200, Math.max(0, rawSets))
        if (!sessionId || !sessionName) {
          return NextResponse.json({ error: 'Datos de sesión incompletos.' }, { status: 400, headers: NO_STORE_HEADERS })
        }
        const store = await cookies()
        const names = getSessionCookieNames()
        const token = store.get(names.access)?.value ?? ''
        if (token) {
          devAddHistory(token, { sessionId, sessionName, setsDone })
        }
        return NextResponse.json({ ok: true, localDevAuth: true }, { headers: NO_STORE_HEADERS })
      } catch {
        return NextResponse.json({ error: 'Error guardando historial.' }, { status: 500, headers: NO_STORE_HEADERS })
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
    const sessionId = sanitizePlainText(body.sessionId, 80)
    const sessionName = sanitizePlainText(body.sessionName, 160)
    const rawSets = typeof body.setsDone === 'number' && Number.isFinite(body.setsDone) ? Math.round(body.setsDone) : 0
    const setsDone = Math.min(200, Math.max(0, rawSets))

    if (!sessionId || !sessionName) {
      return NextResponse.json({ error: 'Datos de sesión incompletos.' }, { status: 400, headers: NO_STORE_HEADERS })
    }

    const userClient = createSupabaseUserServerClient(account.accessToken)
    const { error } = await userClient.from('workout_history').insert({
      user_id: account.userId,
      session_id: sessionId,
      session_name: sessionName,
      sets_done: setsDone,
    })

    if (error) {
      return NextResponse.json({ error: 'No se pudo guardar la sesión.' }, { status: 500, headers: NO_STORE_HEADERS })
    }

    return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS })
  } catch {
    return NextResponse.json({ error: 'Error guardando historial.' }, { status: 500, headers: NO_STORE_HEADERS })
  }
}
