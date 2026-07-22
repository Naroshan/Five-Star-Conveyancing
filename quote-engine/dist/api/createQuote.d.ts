import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { RateLimiter } from './rateLimiter.js';
export interface CreateQuoteDeps {
    db: Kysely<Database>;
    rateLimiter?: RateLimiter;
}
export declare function createQuoteHandler(request: Request, deps: CreateQuoteDeps): Promise<Response>;
