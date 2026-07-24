// Five Star Conveyancing — admin account provisioning and MFA enrollment
// No self-service signup — admin accounts are created deliberately (by a
// super_admin, or right now by a script), matching the Stage 2 role model.

import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AdminRole, AdminUser } from '../types.js';
import { hashPassword } from './password.js';
import { buildTotpUri, generateMfaSecret, verifyTotpCode } from './totp.js';
import { InvalidCredentialsError } from './login.js';
import { ForbiddenError } from '../admin/roles.js';
import { recordAuditEntry } from '../admin/auditLog.js';

export interface ProvisionAdminUserInput {
  name: string;
  email: string;
  role: AdminRole;
  firmId?: string;
  password: string;
}

export async function provisionAdminUser(db: Kysely<Database>, input: ProvisionAdminUserInput): Promise<AdminUser> {
  const passwordHash = await hashPassword(input.password);
  const row = await db
    .insertInto('admin_users')
    .values({
      name: input.name,
      email: input.email.trim().toLowerCase(),
      role: input.role,
      firm_id: input.firmId ?? null,
      password_hash: passwordHash,
    })
    .returning(['user_id', 'name', 'email', 'role'])
    .executeTakeFirstOrThrow();

  return { userId: row.user_id, name: row.name, email: row.email, role: row.role };
}

export interface MfaEnrollment {
  secret: string;
  otpauthUri: string;
}

/** Step 1 of enrollment — generates and stores a secret, not yet active until confirmed with a real code. */
export async function beginMfaEnrollment(db: Kysely<Database>, userId: string): Promise<MfaEnrollment> {
  const user = await db.selectFrom('admin_users').selectAll().where('user_id', '=', userId).executeTakeFirstOrThrow();
  const secret = generateMfaSecret();
  await db.updateTable('admin_users').set({ mfa_secret: secret, mfa_enabled: false }).where('user_id', '=', userId).execute();
  return { secret, otpauthUri: buildTotpUri(secret, user.email) };
}

/** Step 2 — proves the user's authenticator app actually has the secret before MFA is switched on. */
export async function confirmMfaEnrollment(db: Kysely<Database>, userId: string, code: string): Promise<void> {
  const user = await db.selectFrom('admin_users').selectAll().where('user_id', '=', userId).executeTakeFirstOrThrow();
  if (!user.mfa_secret) {
    throw new Error('No MFA enrollment in progress for this account — call beginMfaEnrollment first.');
  }
  if (!verifyTotpCode(user.mfa_secret, code)) {
    throw new InvalidCredentialsError('Incorrect verification code.');
  }
  await db.updateTable('admin_users').set({ mfa_enabled: true }).where('user_id', '=', userId).execute();
}

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
export async function forceMfaReset(db: Kysely<Database>, actingUser: AdminUser, targetUserId: string, reason: string): Promise<void> {
  if (actingUser.role !== 'super_admin') {
    throw new ForbiddenError('Only a super_admin can force an MFA reset on another account.');
  }
  if (actingUser.userId === targetUserId) {
    throw new Error('Use the normal MFA enrollment flow to change your own MFA — forceMfaReset is only for other accounts.');
  }
  if (!reason || reason.trim().length === 0) {
    throw new Error('A reason is required to force an MFA reset — this is a security-sensitive action and must be justified in the audit trail.');
  }

  const before = await db.selectFrom('admin_users').selectAll().where('user_id', '=', targetUserId).executeTakeFirst();
  if (!before) {
    throw new Error(`Admin user ${targetUserId} does not exist.`);
  }

  await db.updateTable('admin_users').set({ mfa_secret: null, mfa_enabled: false }).where('user_id', '=', targetUserId).execute();

  await recordAuditEntry(db, {
    actorUserId: actingUser.userId,
    entityType: 'admin_user',
    entityId: targetUserId,
    action: 'update',
    beforeValue: { mfaEnabled: before.mfa_enabled },
    afterValue: { mfaEnabled: false },
    reason,
  });
}
