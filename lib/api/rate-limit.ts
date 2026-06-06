/** Simple in-memory rate limiter. Fine for a single-instance deployment.
 *  For multi-instance / serverless production, replace the store with Redis. */

interface Bucket {
  count: number
  resetAt: number
}

const store = new Map<string, Bucket>()

const WINDOW_MS = 10 * 60 * 1000 // 10 minutes
const MAX_REQUESTS = 20

/** Returns true if the key is within limits, false if it should be rejected. */
export function checkRateLimit(key: string): boolean {
  const now = Date.now()
  const bucket = store.get(key)

  if (!bucket || now >= bucket.resetAt) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS })
    return true
  }

  if (bucket.count >= MAX_REQUESTS) return false

  bucket.count++
  return true
}

/** Extract a best-effort client IP from Next.js request headers. */
export function clientIp(req: { headers: { get(name: string): string | null } }): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    req.headers.get('x-real-ip') ??
    'unknown'
  )
}
