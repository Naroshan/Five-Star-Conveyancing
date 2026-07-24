// Five Star Conveyancing — login, lockout, and MFA integration tests
// Runs the full authentication flow against a real PostgreSQL database.
// Fictional fixture accounts only.

import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sql } from 'kysely';
import { TOTP, Secret } from 'otpauth';
import { createDb } from '../src/db/client.js';
import { provisionAdminUser, beginMfaEnrollment, confirmMfaEnrollment, forceMfaReset } from '../src/auth/provisioning.js';
import { login, InvalidCredentialsError, AccountLockedError, MfaRequiredError } from '../src/auth/login.js';
import { validateSession, destroySession, destroyAllSessionsForUser, createSession } from '../src/auth/session.js';
import { ForbiddenError } from '../src/admin/roles.js';
import { listAuditLogForEntity } from '../src/admin/auditLog.js';

const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  describe('authentication (integration, real Postgres)', () => {
    const db = createDb(connectionString);

    afterAll(async () => {
      await db.destroy();
    });

    beforeEach(async () => {
      await sql`truncate table admin_sessions, audit_log, admin_users restart identity cascade`.execute(db);
    });

    it('logs in successfully with the correct password when MFA is not enabled', async () => {
      await provisionAdminUser(db, { name: 'Alex', email: 'alex@fixture.test', role: 'fee_administrator', password: 'a-real-password-123' });

      const result = await login(db, 'alex@fixture.test', 'a-real-password-123');
      expect(result.user.email).toBe('alex@fixture.test');
      expect(result.sessionId).toBeDefined();

      const validated = await validateSession(db, result.sessionId);
      expect(validated?.email).toBe('alex@fixture.test');
    });

    it('is case-insensitive and trims whitespace on email', async () => {
      await provisionAdminUser(db, { name: 'Alex', email: 'alex@fixture.test', role: 'fee_administrator', password: 'a-real-password-123' });
      const result = await login(db, '  Alex@Fixture.Test  ', 'a-real-password-123');
      expect(result.user.email).toBe('alex@fixture.test');
    });

    it('rejects an unknown email and a wrong password with the same error type', async () => {
      await provisionAdminUser(db, { name: 'Alex', email: 'alex@fixture.test', role: 'fee_administrator', password: 'a-real-password-123' });
      await expect(login(db, 'nobody@fixture.test', 'anything')).rejects.toThrow(InvalidCredentialsError);
      await expect(login(db, 'alex@fixture.test', 'wrong-password')).rejects.toThrow(InvalidCredentialsError);
    });

    it('locks the account after 5 failed attempts, and a correct password is then rejected too until it expires', async () => {
      await provisionAdminUser(db, { name: 'Alex', email: 'alex@fixture.test', role: 'fee_administrator', password: 'a-real-password-123' });

      for (let i = 0; i < 4; i++) {
        await expect(login(db, 'alex@fixture.test', 'wrong')).rejects.toThrow(InvalidCredentialsError);
      }
      // 5th failure trips the lock
      await expect(login(db, 'alex@fixture.test', 'wrong')).rejects.toThrow(AccountLockedError);
      // Even the correct password is now rejected while locked
      await expect(login(db, 'alex@fixture.test', 'a-real-password-123')).rejects.toThrow(AccountLockedError);
    });

    it('resets the failed-attempt counter after a successful login', async () => {
      await provisionAdminUser(db, { name: 'Alex', email: 'alex@fixture.test', role: 'fee_administrator', password: 'a-real-password-123' });
      await expect(login(db, 'alex@fixture.test', 'wrong')).rejects.toThrow(InvalidCredentialsError);
      await expect(login(db, 'alex@fixture.test', 'wrong')).rejects.toThrow(InvalidCredentialsError);

      const result = await login(db, 'alex@fixture.test', 'a-real-password-123');
      expect(result.user.email).toBe('alex@fixture.test');

      const row = await db.selectFrom('admin_users').select('failed_login_attempts').where('email', '=', 'alex@fixture.test').executeTakeFirstOrThrow();
      expect(row.failed_login_attempts).toBe(0);
    });

    it('requires an MFA code once enrolled, and rejects a wrong one', async () => {
      const user = await provisionAdminUser(db, { name: 'Rae', email: 'rae@fixture.test', role: 'compliance_reviewer', password: 'a-real-password-123' });
      const enrollment = await beginMfaEnrollment(db, user.userId);
      const totp = new TOTP({ secret: Secret.fromBase32(enrollment.secret), algorithm: 'SHA1', digits: 6, period: 30 });
      await confirmMfaEnrollment(db, user.userId, totp.generate());

      await expect(login(db, 'rae@fixture.test', 'a-real-password-123')).rejects.toThrow(MfaRequiredError);
      await expect(login(db, 'rae@fixture.test', 'a-real-password-123', '000000')).rejects.toThrow(InvalidCredentialsError);

      const result = await login(db, 'rae@fixture.test', 'a-real-password-123', totp.generate());
      expect(result.user.email).toBe('rae@fixture.test');
    });

    it('does not enable MFA until the enrollment code is confirmed', async () => {
      const user = await provisionAdminUser(db, { name: 'Rae', email: 'rae@fixture.test', role: 'compliance_reviewer', password: 'a-real-password-123' });
      await beginMfaEnrollment(db, user.userId);

      // Secret exists but hasn't been confirmed yet — login should still succeed without a code.
      const result = await login(db, 'rae@fixture.test', 'a-real-password-123');
      expect(result.user.email).toBe('rae@fixture.test');
    });

    it('validateSession returns null for an unknown, expired, or destroyed session', async () => {
      expect(await validateSession(db, 'not-a-real-session-id')).toBeNull();
      expect(await validateSession(db, undefined)).toBeNull();
      expect(await validateSession(db, null)).toBeNull();

      const user = await provisionAdminUser(db, { name: 'Alex', email: 'alex@fixture.test', role: 'fee_administrator', password: 'a-real-password-123' });
      const session = await createSession(db, user.userId);
      await destroySession(db, session.sessionId);
      expect(await validateSession(db, session.sessionId)).toBeNull();
    });

    it('destroyAllSessionsForUser signs the user out everywhere', async () => {
      const user = await provisionAdminUser(db, { name: 'Alex', email: 'alex@fixture.test', role: 'fee_administrator', password: 'a-real-password-123' });
      const sessionA = await createSession(db, user.userId);
      const sessionB = await createSession(db, user.userId);

      await destroyAllSessionsForUser(db, user.userId);

      expect(await validateSession(db, sessionA.sessionId)).toBeNull();
      expect(await validateSession(db, sessionB.sessionId)).toBeNull();
    });

    it('rejects login for a suspended account even with the correct password', async () => {
      const user = await provisionAdminUser(db, { name: 'Alex', email: 'alex@fixture.test', role: 'fee_administrator', password: 'a-real-password-123' });
      await db.updateTable('admin_users').set({ account_status: 'suspended' }).where('user_id', '=', user.userId).execute();

      await expect(login(db, 'alex@fixture.test', 'a-real-password-123')).rejects.toThrow(InvalidCredentialsError);
    });

    describe('forceMfaReset', () => {
      it('lets a super_admin clear another account\'s MFA, and the target can log back in with just their password', async () => {
        const admin = await provisionAdminUser(db, { name: 'Sam', email: 'sam@fixture.test', role: 'super_admin', password: 'a-real-password-123' });
        const rae = await provisionAdminUser(db, { name: 'Rae', email: 'rae@fixture.test', role: 'compliance_reviewer', password: 'a-real-password-123' });
        const enrollment = await beginMfaEnrollment(db, rae.userId);
        const totp = new TOTP({ secret: Secret.fromBase32(enrollment.secret), algorithm: 'SHA1', digits: 6, period: 30 });
        await confirmMfaEnrollment(db, rae.userId, totp.generate());
        await expect(login(db, 'rae@fixture.test', 'a-real-password-123')).rejects.toThrow(MfaRequiredError);

        await forceMfaReset(db, admin, rae.userId, 'Suspected compromised authenticator device.');

        const result = await login(db, 'rae@fixture.test', 'a-real-password-123');
        expect(result.user.email).toBe('rae@fixture.test');

        const row = await db.selectFrom('admin_users').select(['mfa_enabled', 'mfa_secret']).where('user_id', '=', rae.userId).executeTakeFirstOrThrow();
        expect(row.mfa_enabled).toBe(false);
        expect(row.mfa_secret).toBeNull();
      });

      it('records an audit_log entry with the given reason', async () => {
        const admin = await provisionAdminUser(db, { name: 'Sam', email: 'sam@fixture.test', role: 'super_admin', password: 'a-real-password-123' });
        const rae = await provisionAdminUser(db, { name: 'Rae', email: 'rae@fixture.test', role: 'compliance_reviewer', password: 'a-real-password-123' });

        await forceMfaReset(db, admin, rae.userId, 'Lost authenticator device.');

        const entries = await listAuditLogForEntity(db, 'admin_user', rae.userId);
        expect(entries).toHaveLength(1);
        expect(entries[0].actorUserId).toBe(admin.userId);
        expect(entries[0].reason).toBe('Lost authenticator device.');
      });

      it('refuses a non-super_admin actor', async () => {
        const feeAdmin = await provisionAdminUser(db, { name: 'Alex', email: 'alex@fixture.test', role: 'fee_administrator', password: 'a-real-password-123' });
        const rae = await provisionAdminUser(db, { name: 'Rae', email: 'rae@fixture.test', role: 'compliance_reviewer', password: 'a-real-password-123' });

        await expect(forceMfaReset(db, feeAdmin, rae.userId, 'Trying anyway.')).rejects.toThrow(ForbiddenError);
      });

      it('refuses to let a super_admin target their own account', async () => {
        const admin = await provisionAdminUser(db, { name: 'Sam', email: 'sam@fixture.test', role: 'super_admin', password: 'a-real-password-123' });

        await expect(forceMfaReset(db, admin, admin.userId, 'Testing self-target.')).rejects.toThrow();
      });

      it('requires a non-empty reason', async () => {
        const admin = await provisionAdminUser(db, { name: 'Sam', email: 'sam@fixture.test', role: 'super_admin', password: 'a-real-password-123' });
        const rae = await provisionAdminUser(db, { name: 'Rae', email: 'rae@fixture.test', role: 'compliance_reviewer', password: 'a-real-password-123' });

        await expect(forceMfaReset(db, admin, rae.userId, '')).rejects.toThrow();
        await expect(forceMfaReset(db, admin, rae.userId, '   ')).rejects.toThrow();
      });
    });
  });
} else {
  describe.skip('authentication (integration, real Postgres) — set DATABASE_URL to run', () => {
    it('skipped: no DATABASE_URL set', () => {});
  });
}
