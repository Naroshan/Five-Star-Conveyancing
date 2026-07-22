// Shared rate limiter instance. In-memory — see the package's own
// rateLimiter.ts for why this needs to move to shared infrastructure
// (Redis/Upstash) before running more than one server instance.
import { RateLimiter } from "five-star-conveyancing-quote-engine/api/rateLimiter";

export const quoteRateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60_000 });
