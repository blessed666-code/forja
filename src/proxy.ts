import { NextResponse, type NextRequest } from 'next/server'

const ALLOWED_METHODS = new Set(['GET', 'HEAD', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'])

const PUBLIC_EXACT = new Set([
  '/acceso',
  '/robots.txt',
  '/sitemap.xml',
  '/manifest.webmanifest',
  '/llms.txt',
  '/sw.js',
  '/favicon.ico',
])

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_EXACT.has(pathname)) return true
  if (pathname.startsWith('/api/auth/')) return true
  if (pathname.startsWith('/og/')) return true
  if (pathname.startsWith('/icons/')) return true
  return false
}

function hasSupabaseEnv(): boolean {
  const url = (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL ?? '').trim()
  const anon = (process.env.SUPABASE_ANON_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '').trim()
  const service = (process.env.SUPABASE_SERVICE_ROLE_KEY ?? '').trim()
  return Boolean(url && anon && service)
}

function buildCspHeader(nonce: string): string {
  const isDev = process.env.NODE_ENV === 'development'
  // Nota de seguridad: style-src requiere 'unsafe-inline' únicamente para atributos style dinámicos de Framer Motion;
  // script-src está bloqueado estrictamente mediante nonce criptográfico por petición sin 'unsafe-inline' en producción.
  const scriptSrc = isDev
    ? `'self' 'nonce-${nonce}' 'strict-dynamic' 'unsafe-eval'`
    : `'self' 'nonce-${nonce}' 'strict-dynamic'`

  return [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob: https://cdn.jsdelivr.net",
    "font-src 'self' data:",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join('; ')
}

function attachSecurityHeaders(res: NextResponse, csp: string, isPrivateRoute: boolean): NextResponse {
  res.headers.set('Content-Security-Policy', csp)
  res.headers.set('X-Content-Type-Options', 'nosniff')
  res.headers.set('X-Frame-Options', 'DENY')
  res.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  res.headers.set('Permissions-Policy', 'camera=(self), microphone=(), geolocation=(), payment=(), usb=()')

  if (process.env.NODE_ENV === 'production') {
    res.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload')
  }

  if (isPrivateRoute) {
    res.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0')
  }

  return res
}

export function proxy(req: NextRequest) {
  if (!ALLOWED_METHODS.has(req.method)) {
    return new NextResponse('Method Not Allowed', { status: 405 })
  }

  const nonce = Buffer.from(crypto.randomUUID()).toString('base64')
  const csp = buildCspHeader(nonce)
  const { pathname } = req.nextUrl

  const configured = hasSupabaseEnv()
  const enforced = process.env.NODE_ENV === 'production' || configured
  const publicRoute = isPublicPath(pathname)

  if (enforced && !publicRoute) {
    // Política Fail-Close: en producción jamás se abre la app si faltan credenciales de Supabase
    if (!configured) {
      if (pathname.startsWith('/api/')) {
        return attachSecurityHeaders(
          NextResponse.json({ error: 'Servicio bloqueado hasta configurar variables seguras de entorno.' }, { status: 503 }),
          csp,
          true,
        )
      }
      const loginUrl = new URL('/acceso?estado=configuracion', req.url)
      return attachSecurityHeaders(NextResponse.redirect(loginUrl), csp, true)
    }

    const hasSessionCookie = Boolean(
      req.cookies.get('__Host-forja_at')?.value ||
        req.cookies.get('__Host-forja_rt')?.value ||
        req.cookies.get('forja_at')?.value ||
        req.cookies.get('forja_rt')?.value,
    )

    if (!hasSessionCookie) {
      if (pathname.startsWith('/api/')) {
        return attachSecurityHeaders(
          NextResponse.json({ error: 'Acceso no autorizado. Inicia sesión.' }, { status: 401 }),
          csp,
          true,
        )
      }
      const loginUrl = new URL('/acceso', req.url)
      return attachSecurityHeaders(NextResponse.redirect(loginUrl), csp, true)
    }
  }

  const requestHeaders = new Headers(req.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', csp)

  const res = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  })

  return attachSecurityHeaders(res, csp, !publicRoute)
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
