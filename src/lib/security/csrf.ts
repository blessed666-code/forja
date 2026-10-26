import { randomBytes, timingSafeEqual } from 'node:crypto'
import { cookies } from 'next/headers'

function isHttpsEnv(): boolean {
  if (process.env.NODE_ENV === 'production') return true
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? ''
  return siteUrl.startsWith('https://')
}

export function getCsrfCookieName(): string {
  return isHttpsEnv() ? '__Host-forja_csrf' : 'forja_csrf'
}

export async function ensureCsrfToken(): Promise<string> {
  const store = await cookies()
  const name = getCsrfCookieName()
  const current = store.get(name)?.value
  if (current && /^[a-f0-9]{64}$/.test(current)) {
    return current
  }

  const fresh = randomBytes(32).toString('hex')
  store.set(name, fresh, {
    httpOnly: true,
    secure: isHttpsEnv(),
    sameSite: 'strict',
    path: '/',
    maxAge: 60 * 60 * 12, // 12 horas
  })
  return fresh
}

export function verifyOriginHeader(req: Request): boolean {
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (!origin || !host) return false

  try {
    const originUrl = new URL(origin)
    return originUrl.host.toLowerCase() === host.toLowerCase()
  } catch {
    return false
  }
}

export async function verifyCsrfRequest(req: Request): Promise<boolean> {
  if (!verifyOriginHeader(req)) {
    return false
  }

  const headerToken = req.headers.get('x-csrf-token')?.trim() ?? ''
  if (!/^[a-f0-9]{64}$/.test(headerToken)) {
    return false
  }

  const store = await cookies()
  const cookieToken = store.get(getCsrfCookieName())?.value ?? ''
  if (!/^[a-f0-9]{64}$/.test(cookieToken)) {
    return false
  }

  const a = Buffer.from(headerToken, 'utf8')
  const b = Buffer.from(cookieToken, 'utf8')
  if (a.length !== b.length) return false
  return timingSafeEqual(a, b)
}
