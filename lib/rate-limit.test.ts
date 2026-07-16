import { describe, expect, it } from "vitest";
import { ConcurrencyLimiter, TokenBucketRateLimiter } from "@/lib/rate-limit";

describe("TokenBucketRateLimiter", () => {
  it("allows a burst, rejects excess work, and reports the refill wait", () => {
    const limiter = new TokenBucketRateLimiter({
      capacity: 2,
      refillIntervalMs: 10_000,
    });

    expect(limiter.check("client", 0)).toEqual({
      allowed: true,
      limit: 2,
      remaining: 1,
    });
    expect(limiter.check("client", 0)).toEqual({
      allowed: true,
      limit: 2,
      remaining: 0,
    });
    expect(limiter.check("client", 4_000)).toEqual({
      allowed: false,
      limit: 2,
      remaining: 0,
      retryAfterSeconds: 6,
    });
    expect(limiter.check("client", 10_000).allowed).toBe(true);
  });

  it("isolates clients and never refills beyond capacity", () => {
    const limiter = new TokenBucketRateLimiter({
      capacity: 1,
      refillIntervalMs: 1_000,
    });

    expect(limiter.check("first", 0).allowed).toBe(true);
    expect(limiter.check("first", 0).allowed).toBe(false);
    expect(limiter.check("second", 0).allowed).toBe(true);
    expect(limiter.check("first", 100_000)).toEqual({
      allowed: true,
      limit: 1,
      remaining: 0,
    });
  });

  it("bounds stored client buckets", () => {
    const limiter = new TokenBucketRateLimiter({
      capacity: 1,
      refillIntervalMs: 1_000,
      maxBuckets: 2,
    });

    expect(limiter.check("first", 0).allowed).toBe(true);
    expect(limiter.check("second", 0).allowed).toBe(true);
    expect(limiter.check("third", 0).allowed).toBe(true);
    expect(limiter.check("first", 0).allowed).toBe(true);
  });
});

describe("ConcurrencyLimiter", () => {
  it("admits only the configured concurrency and releases once", () => {
    const limiter = new ConcurrencyLimiter(1);
    const release = limiter.tryAcquire();

    expect(release).toBeTypeOf("function");
    expect(limiter.tryAcquire()).toBeUndefined();
    release?.();
    release?.();
    expect(limiter.tryAcquire()).toBeTypeOf("function");
  });
});
