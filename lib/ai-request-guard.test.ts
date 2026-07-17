import { afterEach, describe, expect, it, vi } from "vitest";
import {
  beginAiRequest,
  clientIdentifier,
  createAiRequestGuard,
} from "@/lib/ai-request-guard";
import { ConcurrencyLimiter, TokenBucketRateLimiter } from "@/lib/rate-limit";

function request(headers: HeadersInit = {}) {
  return new Request("http://localhost/api/generate", { headers });
}

describe("AI request guard", () => {
  afterEach(() => vi.unstubAllEnvs());

  it("uses the first proxy-provided client address", () => {
    expect(
      clientIdentifier(request({ "x-forwarded-for": "203.0.113.8, 10.0.0.1" })),
    ).toBe("203.0.113.8");
    expect(clientIdentifier(request({ "x-real-ip": "198.51.100.4" }))).toBe(
      "198.51.100.4",
    );
  });

  it("returns 429 metadata and releases concurrency when rate-limited", () => {
    const begin = createAiRequestGuard({
      rateLimiter: new TokenBucketRateLimiter({
        capacity: 1,
        refillIntervalMs: 10_000,
      }),
      concurrencyLimiter: new ConcurrencyLimiter(1),
    });
    const first = begin(request(), 0);
    expect(first.allowed).toBe(true);
    if (first.allowed) first.release();

    const rejected = begin(request(), 0);
    expect(rejected).toMatchObject({
      allowed: false,
      status: 429,
      headers: { "Retry-After": "10" },
    });

    const refilled = begin(request(), 10_000);
    expect(refilled.allowed).toBe(true);
    if (refilled.allowed) refilled.release();
  });

  it("returns a short 503 retry when all concurrency leases are active", () => {
    const begin = createAiRequestGuard({
      rateLimiter: new TokenBucketRateLimiter({
        capacity: 2,
        refillIntervalMs: 10_000,
      }),
      concurrencyLimiter: new ConcurrencyLimiter(1),
    });
    const active = begin(request(), 0);
    expect(active.allowed).toBe(true);

    expect(begin(request(), 0)).toEqual({
      allowed: false,
      status: 503,
      message:
        "Live AI is handling several requests. Please try again in a few seconds.",
      headers: { "Retry-After": "3" },
    });
    if (active.allowed) active.release();
  });

  it("allows an explicit local test bypass", () => {
    vi.stubEnv("DISABLE_AI_GUARD", "1");
    vi.stubEnv("NODE_ENV", "development");

    const admission = beginAiRequest(request());
    expect(admission).toMatchObject({ allowed: true, headers: {} });
    if (admission.allowed) admission.release();
  });

  it("never honors the local bypass in production", () => {
    vi.stubEnv("DISABLE_AI_GUARD", "1");
    vi.stubEnv("NODE_ENV", "production");

    const admission = beginAiRequest(
      request({ "x-forwarded-for": "203.0.113.99" }),
    );
    expect(admission.allowed).toBe(true);
    if (admission.allowed) {
      expect(admission.headers["X-RateLimit-Limit"]).toBe("6");
      admission.release();
    }
  });
});
