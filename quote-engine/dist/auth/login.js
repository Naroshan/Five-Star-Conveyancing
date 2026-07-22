// Five Star Conveyancing — login orchestration
// Ties together password verification, account lockout, and MFA into one
// flow. Deliberately throws distinct error types so the UI can respond
// appropriately (e.g. prompt for an MFA code) without the underlying
// checks being skippable by calling the wrong function.
import { DUMMY_HASH_FOR_TIMING_SAFETY, verifyPassword } from './password.js';
import { verifyTotpCode } from './totp.js';
import { createSession } from './session.js';
const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
export class InvalidCredentialsError extends Error {
    constructor(message = 'Incorrect email or password.') {
        super(message);
        this.name = 'InvalidCredentialsError';
    }
}
export class AccountLockedError extends Error {
    constructor(message = 'Too many failed attempts. Try again in a few minutes.') {
        super(message);
        this.name = 'AccountLockedError';
    }
}
/** Thrown when the password is correct but this account requires an MFA code that wasn't supplied. */
export class MfaRequiredError extends Error {
    constructor() {
        super('A verification code from your authenticator app is required.');
        this.name = 'MfaRequiredError';
    }
}
export async function login(db, email, password, totpCode, userAgent) {
    const normalizedEmail = email.trim().toLowerCase();
    const row = await db.selectFrom('admin_users').selectAll().where('email', '=', normalizedEmail).executeTakeFirst();
    // Always run a bcrypt.compare, even for a nonexistent account, against a
    // real (dummy) hash — so "no such account" and "wrong password" take
    // roughly the same amount of time and don't leak which case occurred.
    const passwordOk = await verifyPassword(password, row?.password_hash ?? DUMMY_HASH_FOR_TIMING_SAFETY);
    if (!row || row.account_status !== 'active') {
        throw new InvalidCredentialsError();
    }
    if (row.locked_until && row.locked_until.getTime() > Date.now()) {
        throw new AccountLockedError();
    }
    if (!passwordOk) {
        const attempts = row.failed_login_attempts + 1;
        const lockedUntil = attempts >= MAX_FAILED_ATTEMPTS ? new Date(Date.now() + LOCKOUT_DURATION_MS) : null;
        await db
            .updateTable('admin_users')
            .set({ failed_login_attempts: attempts, locked_until: lockedUntil })
            .where('user_id', '=', row.user_id)
            .execute();
        throw lockedUntil ? new AccountLockedError() : new InvalidCredentialsError();
    }
    if (row.failed_login_attempts > 0 || row.locked_until) {
        await db.updateTable('admin_users').set({ failed_login_attempts: 0, locked_until: null }).where('user_id', '=', row.user_id).execute();
    }
    if (row.mfa_enabled) {
        if (!totpCode)
            throw new MfaRequiredError();
        if (!row.mfa_secret || !verifyTotpCode(row.mfa_secret, totpCode)) {
            throw new InvalidCredentialsError('Incorrect verification code.');
        }
    }
    const session = await createSession(db, row.user_id, userAgent);
    return { ...session, user: { userId: row.user_id, name: row.name, email: row.email, role: row.role } };
}
