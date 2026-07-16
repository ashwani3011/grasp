export type RateLimitDecision =
  | { allowed: true; limit: number; remaining: number }
  | {
      allowed: false;
      limit: number;
      remaining: 0;
      retryAfterSeconds: number;
    };

type Bucket = {
  tokens: number;
  refilledAt: number;
  lastSeenAt: number;
};

type TokenBucketOptions = {
  capacity: number;
  refillIntervalMs: number;
  idleTtlMs?: number;
  maxBuckets?: number;
};

/**
 * Best-effort, per-process token bucket for serverless abuse resistance.
 * State is intentionally bounded and may reset when an instance is recycled.
 */
export class TokenBucketRateLimiter {
  private readonly buckets = new Map<string, Bucket>();
  private checksSincePrune = 0;
  private readonly capacity: number;
  private readonly refillIntervalMs: number;
  private readonly idleTtlMs: number;
  private readonly maxBuckets: number;

  constructor({
    capacity,
    refillIntervalMs,
    idleTtlMs = 10 * 60_000,
    maxBuckets = 5_000,
  }: TokenBucketOptions) {
    if (!Number.isInteger(capacity) || capacity < 1)
      throw new Error("capacity must be a positive integer");
    if (!Number.isFinite(refillIntervalMs) || refillIntervalMs <= 0)
      throw new Error("refillIntervalMs must be positive");
    if (!Number.isFinite(idleTtlMs) || idleTtlMs <= 0)
      throw new Error("idleTtlMs must be positive");
    if (!Number.isInteger(maxBuckets) || maxBuckets < 1)
      throw new Error("maxBuckets must be a positive integer");

    this.capacity = capacity;
    this.refillIntervalMs = refillIntervalMs;
    this.idleTtlMs = idleTtlMs;
    this.maxBuckets = maxBuckets;
  }

  check(key: string, now = Date.now()): RateLimitDecision {
    this.pruneIfNeeded(now);

    const existing = this.buckets.get(key);
    const elapsed = existing ? Math.max(0, now - existing.refilledAt) : 0;
    const tokens = existing
      ? Math.min(
          this.capacity,
          existing.tokens + elapsed / this.refillIntervalMs,
        )
      : this.capacity;
    const allowed = tokens >= 1;
    const nextTokens = allowed ? tokens - 1 : tokens;

    this.buckets.set(key, {
      tokens: nextTokens,
      refilledAt: now,
      lastSeenAt: now,
    });

    if (allowed)
      return {
        allowed: true,
        limit: this.capacity,
        remaining: Math.floor(nextTokens),
      };

    return {
      allowed: false,
      limit: this.capacity,
      remaining: 0,
      retryAfterSeconds: Math.max(
        1,
        Math.ceil(((1 - nextTokens) * this.refillIntervalMs) / 1_000),
      ),
    };
  }

  private pruneIfNeeded(now: number) {
    this.checksSincePrune += 1;
    if (this.checksSincePrune < 100 && this.buckets.size < this.maxBuckets)
      return;

    this.checksSincePrune = 0;
    const staleBefore = now - this.idleTtlMs;
    for (const [key, bucket] of this.buckets)
      if (bucket.lastSeenAt < staleBefore) this.buckets.delete(key);

    while (this.buckets.size >= this.maxBuckets) {
      const oldestKey = this.buckets.keys().next().value as string | undefined;
      if (!oldestKey) break;
      this.buckets.delete(oldestKey);
    }
  }
}

/** Limits expensive work in flight on one server instance. */
export class ConcurrencyLimiter {
  private active = 0;

  constructor(private readonly limit: number) {
    if (!Number.isInteger(limit) || limit < 1)
      throw new Error("limit must be a positive integer");
  }

  tryAcquire(): (() => void) | undefined {
    if (this.active >= this.limit) return undefined;
    this.active += 1;
    let released = false;

    return () => {
      if (released) return;
      released = true;
      this.active -= 1;
    };
  }
}
