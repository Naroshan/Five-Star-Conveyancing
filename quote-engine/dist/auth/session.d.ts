import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AdminUser } from '../types.js';
export interface CreatedSession {
    sessionId: string;
    expiresAt: Date;
}
export declare function createSession(db: Kysely<Database>, userId: string, userAgent?: string): Promise<CreatedSession>;
export declare function validateSession(db: Kysely<Database>, sessionId: string | undefined | null): Promise<AdminUser | null>;
export declare function destroySession(db: Kysely<Database>, sessionId: string): Promise<void>;
/** Signs out every session for a user — e.g. after a password change or a suspected compromise. */
export declare function destroyAllSessionsForUser(db: Kysely<Database>, userId: string): Promise<void>;
