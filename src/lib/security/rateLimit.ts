/**
 * Control de tasa de peticiones (Rate Limiting) en servidor por IP y ruta.
 * TODO(security): En despliegues serverless multi-región de alto tráfico, respaldar estos contadores con Redis / Upstash.
 */

interface BucketEntry {
  timestamps: number[]
}

const buckets = new Map<string, BucketEntry>()
let lastCleanup = Date.now()

function cleanupStale(now: number, maxWindowMs: number): void {
  if (now - lastCleanup < 60_000) return
  lastCleanup = now
  for (const [key, entry] of buckets.entries()) {
    const valid = entry.timestamps.filter((t) => now - t < maxWindowMs)
    if (valid.length === 0) {
      buckets.delete(key)
    } else {
      entry.timestamps = valid
    }
  }
}

export function getClientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  if (forwarded) {
    const first = forwarded.split(',')[0]?.trim()
    if (first) return first.slice(0, 64)
  }
  const realIp = req.headers.get('x-real-ip')?.trim()
  if (realIp) return realIp.slice(0, 64)
  return '127.0.0.1'
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  retryAfterSec: number
}

export function checkRateLimit(
  req: Request,
  namespace: string,
  maxRequests: number,
  windowMs: number,
): RateLimitResult {
  const now = Date.now()
  cleanupStale(now, Math.max(windowMs, 15 * 60_000))

  const ip = getClientIp(req)
  const key = `${namespace}:${ip}`
  const existing = buckets.get(key) ?? { timestamps: [] }
  const active = existing.timestamps.filter((t) => now - t < windowMs)

  if (active.length >= maxRequests) {
    const oldest = active[0] ?? now
    const retryAfterSec = Math.max(1, Math.ceil((windowMs - (now - oldest)) / 1000))
    buckets.set(key, { timestamps: active })
    return { allowed: false, remaining: 0, retryAfterSec }
  }

  active.push(now)
  buckets.set(key, { timestamps: active })
  return {
    allowed: true,
    remaining: Math.max(0, maxRequests - active.length),
    retryAfterSec: 0,
  }
}
