import "server-only";

/**
 * In-process sliding-window rate limiter, keyed by IP + email.
 *
 * Scope note: this is per-instance memory. On a single long-lived Node server
 * it works as intended. On a serverless/multi-instance host each instance keeps
 * its own counters, so the effective limit is (limit x instances) — enough to
 * stop a naive script, not a distributed attack. Move to a shared store
 * (Upstash/Redis, or a Postgres table) if abuse becomes real.
 */
type Hit = { count: number; resetAt: number };

const buckets = new Map<string, Hit>();
const WINDOW_MS = 10 * 60 * 1000; // 10 minutes
const MAX_HITS = 5;

function sweep(now: number) {
  if (buckets.size < 5000) return;
  for (const [key, hit] of buckets) if (hit.resetAt <= now) buckets.delete(key);
}

export function checkRateLimit(
  parts: Array<string | null | undefined>,
  { limit = MAX_HITS, windowMs = WINDOW_MS } = {}
): { allowed: boolean; retryAfterSeconds: number } {
  const key = parts.filter(Boolean).join("|").toLowerCase();
  if (!key) return { allowed: true, retryAfterSeconds: 0 };

  const now = Date.now();
  sweep(now);

  const hit = buckets.get(key);
  if (!hit || hit.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfterSeconds: 0 };
  }

  hit.count += 1;
  if (hit.count > limit) {
    return {
      allowed: false,
      retryAfterSeconds: Math.max(1, Math.ceil((hit.resetAt - now) / 1000)),
    };
  }
  return { allowed: true, retryAfterSeconds: 0 };
}
