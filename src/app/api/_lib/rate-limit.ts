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

/**
 * Client IP behind our reverse proxy.
 *
 * Order matters, and getting it wrong voids every rate limit on the site.
 *
 * `X-Real-IP` is set by nginx from `$remote_addr` (nginx.conf), which is the
 * TCP peer address — nginx overwrites whatever the client sent, so it cannot
 * be spoofed. It is therefore checked first.
 *
 * `X-Forwarded-For` is the opposite. nginx sets it with
 * `$proxy_add_x_forwarded_for`, which *appends* the real address to whatever
 * arrived in the request, producing `<whatever the client claimed>, <real ip>`.
 * Reading the FIRST element — as this function used to — hands the identity to
 * the caller: `curl -H 'X-Forwarded-For: anything'` earns a brand-new token
 * bucket on every request, so the limiter counts to one forever. That defeats
 * the limit on all five API routes, and since the honeypot field is optional,
 * nothing else stands between a script and the enquiry funnel. Once
 * BOOKING_TRANSPORT=smtp, that is an unmetered mail relay sending from our own
 * domain, which ends with the domain and the VPS IP on blocklists.
 *
 * Only the LAST element of XFF is written by a proxy we control, so that is
 * what the fallback reads. The header is kept as a fallback at all so this
 * still behaves on a platform that sets XFF but not X-Real-IP.
 */
export function getClientIp(request: Request): string {
  const realIp = request.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const parts = forwardedFor.split(',');
    const last = parts[parts.length - 1]?.trim();
    if (last) return last;
  }

  return 'unknown';
}
