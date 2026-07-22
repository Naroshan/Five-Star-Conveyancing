import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AdminUser } from '../types.js';
import { type CreatedSession } from './session.js';
export declare class InvalidCredentialsError extends Error {
    constructor(message?: string);
}
export declare class AccountLockedError extends Error {
    constructor(message?: string);
}
/** Thrown when the password is correct but this account requires an MFA code that wasn't supplied. */
export declare class MfaRequiredError extends Error {
    constructor();
}
export interface LoginResult extends CreatedSession {
    user: AdminUser;
}
export declare function login(db: Kysely<Database>, email: string, password: string, totpCode?: string, userAgent?: string): Promise<LoginResult>;
