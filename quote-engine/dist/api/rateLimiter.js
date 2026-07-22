// Five Star Conveyancing — rate limiter
//
// *** In-memory only — a starting point, not a production deployment. ***
// This works for a single Node process. As soon as the app runs on more than
// one instance (which it will, for any real deployment), state needs to move
// to a shared store (Redis/Upstash) or the platform's edge rate-limiting —
// otherwise each instance enforces its own separate limit. Kept here as a
// simple, dependency-free implementation so the *interface* (checkLimit) is
// stable regardless of what backs it later; swap the internals, not the
// call sites, when this moves to shared infrastructure.
export class RateLimiter {
    options;
    buckets = new Map();
    constructor(options) {
        this.options = options;
    }
    /** Returns true if the request is allowed, false if the caller is over the limit. */
    checkLimit(key, now = Date.now()) {
        const bucket = this.buckets.get(key) ?? { tokens: this.options.maxRequests, lastRefillAt: now };
        const elapsed = now - bucket.lastRefillAt;
        const refillRatio = elapsed / this.options.windowMs;
        const refilled = Math.min(this.options.maxRequests, bucket.tokens + refillRatio * this.options.maxRequests);
        if (refilled < 1) {
            this.buckets.set(key, { tokens: refilled, lastRefillAt: now });
            return false;
        }
        this.buckets.set(key, { tokens: refilled - 1, lastRefillAt: now });
        return true;
    }
    /** Periodic cleanup to stop the map growing unbounded — call from a timer in production. */
    evictStale(now = Date.now()) {
        for (const [key, bucket] of this.buckets) {
            if (now - bucket.lastRefillAt > this.options.windowMs * 10) {
                this.buckets.delete(key);
            }
        }
    }
}
