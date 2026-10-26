import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { ensureCsrfToken } from '@/lib/security/csrf'
import { maskEmail } from '@/lib/security/validation'
import { devGetAccountByToken, isLocalDevAuthEnabled } from '@/lib/supabase/devAuthStore'
import {
  fetchUserHistory,
  getAuthenticatedAccount,
  getSessionCookieNames,
  isGatekeeperEnforced,
  isSupabaseConfigured,
} from '@/lib/supabase/server'

const NO_STORE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
}

export async function GET() {
  const csrfToken = await ensureCsrfToken()
  const configured = isSupabaseConfigured()
  const enforced = isGatekeeperEnforced()

  if (!configured) {
    if (isLocalDevAuthEnabled()) {
      const store = await cookies()
      const names = getSessionCookieNames()
      const token = store.get(names.access)?.value ?? ''
      const devAccount = devGetAccountByToken(token)
      if (devAccount) {
        return NextResponse.json(
          {
            csrfToken,
            configured: false,
            localDevAuth: true,
            enforced,
            authenticated: true,
            account: {
              maskedEmail: maskEmail(devAccount.email),
              role: devAccount.role,
              onboardingCompleted: devAccount.onboardingCompleted,
              courtesyCodeUsed: devAccount.courtesyCodeUsed,
            },
            profile: devAccount.profileData,
            history: devAccount.history,
          },
          { headers: NO_STORE_HEADERS },
        )
      }
    }

    return NextResponse.json(
      {
        csrfToken,
        configured: false,
        localDevAuth: isLocalDevAuthEnabled(),
        enforced,
        authenticated: false,
        account: null,
        profile: null,
        history: [],
      },
      { headers: NO_STORE_HEADERS },
    )
  }

  const account = await getAuthenticatedAccount({ allowRefresh: true })
  if (!account) {
    return NextResponse.json(
      {
        csrfToken,
        configured: true,
        enforced,
        authenticated: false,
        account: null,
        profile: null,
        history: [],
      },
      { headers: NO_STORE_HEADERS },
    )
  }

  const history = await fetchUserHistory(account.accessToken, account.userId)

  return NextResponse.json(
    {
      csrfToken,
      configured: true,
      enforced,
      authenticated: true,
      account: {
        maskedEmail: maskEmail(account.email),
        role: account.role,
        onboardingCompleted: account.onboardingCompleted,
        courtesyCodeUsed: account.courtesyCodeUsed,
      },
      profile: account.profileData,
      history,
    },
    { headers: NO_STORE_HEADERS },
  )
}
