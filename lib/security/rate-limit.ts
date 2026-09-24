import "server-only";

/**
 * Fixed-window rate limiter held in process memory.
 *
 * Good enough for a single Node instance and for slowing down casual abuse.
 * On multi-instance/serverless deployments, swap `hit()` for a shared store
 * (e.g. Redis or a Postgres table) — the call sites don't change.
 */
interface Bucket {
  count: number;
  resetAt: number;
}

const globalKey = Symbol.for("vibegen.rateLimit");
const g = globalThis as unknown as Record<symbol, Map<string, Bucket> | undefined>;
const buckets: Map<string, Bucket> = (g[globalKey] ??= new Map());

export interface RateLimitResult {
  ok: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export const RATE_LIMITS = {
  form: { limit: 5, windowMs: 10 * 60_000 },
  login: { limit: 8, windowMs: 15 * 60_000 },
  track: { limit: 120, windowMs: 60_000 },
  api: { limit: 60, windowMs: 60_000 },
} as const;

export function rateLimit(key: string, { limit, windowMs }: { limit: number; windowMs: number }): RateLimitResult {
  const now = Date.now();

  if (buckets.size > 10_000) {
    for (const [k, b] of buckets) if (b.resetAt <= now) buckets.delete(k);
  }

  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { ok: true, remaining: limit - 1, retryAfterSeconds: 0 };
  }

  bucket.count += 1;
  const ok = bucket.count <= limit;
  return {
    ok,
    remaining: Math.max(0, limit - bucket.count),
    retryAfterSeconds: ok ? 0 : Math.ceil((bucket.resetAt - now) / 1000),
  };
}
