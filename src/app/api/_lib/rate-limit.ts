/**
 * Minimal in-memory token-bucket rate limiter, keyed by an arbitrary string
 * (typically the caller's IP address).
 *
 * NOTE: state lives in process memory only. It resets on cold start/restart
 * and is NOT shared across multiple instances (serverless functions,
 * multi-replica deployments, etc). Good enough for a single small VM/instance;
 * for production at scale, move this to Upstash Redis or Vercel KV so limits
 * hold across instances.
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

const buckets = new Map<string, Bucket>();

/** Cheap guard against unbounded memory growth if this ever runs for a long time. */
const MAX_TRACKED_KEYS = 5000;

export interface RateLimitOptions {
  /** Max requests allowed per `windowMs`. */
  capacity: number;
  /** Window across which the bucket fully refills. */
  windowMs: number;
}

/** Returns `true` if the request should be rejected (rate limited). */
export function isRateLimited(key: string, { capacity, windowMs }: RateLimitOptions): boolean {
  const now = Date.now();

  if (buckets.size > MAX_TRACKED_KEYS) {
    for (const [k, b] of buckets) {
      if (now - b.lastRefill > windowMs * 4) buckets.delete(k);
    }
  }

  const bucket = buckets.get(key);
  if (!bucket) {
    buckets.set(key, { tokens: capacity - 1, lastRefill: now });
    return false;
  }

  const elapsed = now - bucket.lastRefill;
  const refillRate = capacity / windowMs; // tokens per ms
  const refilled = Math.min(capacity, bucket.tokens + elapsed * refillRate);

  if (refilled < 1) {
    bucket.tokens = refilled;
    bucket.lastRefill = now;
    return true;
  }

  bucket.tokens = refilled - 1;
  bucket.lastRefill = now;
  return false;
}

/** Best-effort client IP extraction behind a reverse proxy (nginx, Vercel, etc). */
export function getClientIp(request: Request): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const first = forwardedFor.split(',')[0]?.trim();
    if (first) return first;
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp;
  return 'unknown';
}
