import { ConcurrencyLimiter, TokenBucketRateLimiter } from "@/lib/rate-limit";

const RATE_LIMIT_CAPACITY = 6;
const RATE_LIMIT_REFILL_MS = 20_000;
const CONCURRENCY_LIMIT = 4;

type AllowedAdmission = {
  allowed: true;
  headers: Record<string, string>;
  release: () => void;
};

type RejectedAdmission = {
  allowed: false;
  headers: Record<string, string>;
  message: string;
  status: 429 | 503;
};

export type AiRequestAdmission = AllowedAdmission | RejectedAdmission;

export function clientIdentifier(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0];
  const candidate = forwarded ?? request.headers.get("x-real-ip") ?? "unknown";
  return candidate.trim().slice(0, 128) || "unknown";
}

export function createAiRequestGuard({
  rateLimiter,
  concurrencyLimiter,
}: {
  rateLimiter: TokenBucketRateLimiter;
  concurrencyLimiter: ConcurrencyLimiter;
}) {
  return (request: Request, now = Date.now()): AiRequestAdmission => {
    const release = concurrencyLimiter.tryAcquire();
    if (!release)
      return {
        allowed: false,
        status: 503,
        message:
          "Live AI is handling several requests. Please try again in a few seconds.",
        headers: { "Retry-After": "3" },
      };

    const decision = rateLimiter.check(clientIdentifier(request), now);
    const headers = {
      "X-RateLimit-Limit": String(decision.limit),
      "X-RateLimit-Remaining": String(decision.remaining),
    };

    if (!decision.allowed) {
      release();
      return {
        allowed: false,
        status: 429,
        message: `You've reached the live AI limit. Try again in ${decision.retryAfterSeconds} seconds, or open an instant example.`,
        headers: {
          ...headers,
          "Retry-After": String(decision.retryAfterSeconds),
        },
      };
    }

    return { allowed: true, headers, release };
  };
}

const beginRequest = createAiRequestGuard({
  rateLimiter: new TokenBucketRateLimiter({
    capacity: RATE_LIMIT_CAPACITY,
    refillIntervalMs: RATE_LIMIT_REFILL_MS,
  }),
  concurrencyLimiter: new ConcurrencyLimiter(CONCURRENCY_LIMIT),
});

export function beginAiRequest(request: Request): AiRequestAdmission {
  if (
    process.env.DISABLE_AI_GUARD === "1" &&
    process.env.NODE_ENV !== "production"
  )
    return { allowed: true, headers: {}, release: () => {} };
  return beginRequest(request);
}
