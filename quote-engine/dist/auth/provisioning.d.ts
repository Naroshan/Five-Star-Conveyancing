import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AdminRole, AdminUser } from '../types.js';
export interface ProvisionAdminUserInput {
    name: string;
    email: string;
    role: AdminRole;
    firmId?: string;
    password: string;
}
export declare function provisionAdminUser(db: Kysely<Database>, input: ProvisionAdminUserInput): Promise<AdminUser>;
export interface MfaEnrollment {
    secret: string;
    otpauthUri: string;
}
/** Step 1 of enrollment — generates and stores a secret, not yet active until confirmed with a real code. */
export declare function beginMfaEnrollment(db: Kysely<Database>, userId: string): Promise<MfaEnrollment>;
/** Step 2 — proves the user's authenticator app actually has the secret before MFA is switched on. */
export declare function confirmMfaEnrollment(db: Kysely<Database>, userId: string, code: string): Promise<void>;
/**
 * Forces another account's MFA off and clears its secret — e.g. after a
 * suspected compromise, or a lost authenticator device. The target account
 * reverts to the same not-yet-enrolled state as a brand-new account: they
 * can log in with just their password, and beginMfaEnrollment/
 * confirmMfaEnrollment walks them through enrolling again from scratch.
 *
 * Only super_admin may do this, and only to a *different* account — a
 * security-sensitive action gets a permission check, a mandatory reason,
 * and a real audit_log entry, same as fee-data changes.
 */
export declare function forceMfaReset(db: Kysely<Database>, actingUser: AdminUser, targetUserId: string, reason: string): Promise<void>;
