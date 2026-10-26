import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { verifyCsrfRequest } from '@/lib/security/csrf'
import { devInvalidateSessionsForToken, isLocalDevAuthEnabled } from '@/lib/supabase/devAuthStore'
import {
  clearAuthSessionCookies,
  createSupabaseUserServerClient,
  getAuthenticatedAccount,
  getSessionCookieNames,
  isSupabaseConfigured,
} from '@/lib/supabase/server'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, max-age=0',
}

export async function POST(req: Request) {
  if (!(await verifyCsrfRequest(req))) {
    return NextResponse.json({ error: 'Solicitud inválida.' }, { status: 403, headers: NO_STORE_HEADERS })
  }

  try {
    if (isSupabaseConfigured()) {
      const account = await getAuthenticatedAccount({ allowRefresh: false })
      if (account?.accessToken) {
        const userClient = createSupabaseUserServerClient(account.accessToken)
        // Invalida todas las sesiones activas al cerrar sesión
        await userClient.auth.signOut({ scope: 'global' })
      }
    } else if (isLocalDevAuthEnabled()) {
      const store = await cookies()
      const names = getSessionCookieNames()
      const token = store.get(names.access)?.value ?? ''
      devInvalidateSessionsForToken(token)
    }
  } catch {
    // Continuar con limpieza obligatoria de cookies locales
  }

  await clearAuthSessionCookies()
  return NextResponse.json({ ok: true }, { headers: NO_STORE_HEADERS })
}
