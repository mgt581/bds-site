// Simple in-memory IP based rate limiter. Suitable for a single-instance deployment.
// For multi-instance production deployments, replace with a shared store (e.g. Redis).

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

const WINDOW_MS = 60 * 60 * 1000 // 1 hour
const MAX_REQUESTS = 5

export function checkRateLimit(identifier: string): {
  allowed: boolean
  remaining: number
  resetAt: number
} {
  const now = Date.now()
  const existing = buckets.get(identifier)

  if (!existing || existing.resetAt <= now) {
    const resetAt = now + WINDOW_MS
    buckets.set(identifier, { count: 1, resetAt })
    return { allowed: true, remaining: MAX_REQUESTS - 1, resetAt }
  }

  if (existing.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0, resetAt: existing.resetAt }
  }

  existing.count += 1
  return { allowed: true, remaining: MAX_REQUESTS - existing.count, resetAt: existing.resetAt }
}

// Periodically clean up expired buckets to avoid unbounded memory growth.
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now()
    for (const [key, bucket] of buckets.entries()) {
      if (bucket.resetAt <= now) buckets.delete(key)
    }
  }, WINDOW_MS).unref?.()
}
