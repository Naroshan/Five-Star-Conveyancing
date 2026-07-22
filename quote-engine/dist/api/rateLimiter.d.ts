export interface RateLimiterOptions {
    maxRequests: number;
    windowMs: number;
}
export declare class RateLimiter {
    private options;
    private buckets;
    constructor(options: RateLimiterOptions);
    /** Returns true if the request is allowed, false if the caller is over the limit. */
    checkLimit(key: string, now?: number): boolean;
    /** Periodic cleanup to stop the map growing unbounded — call from a timer in production. */
    evictStale(now?: number): void;
}
