// Five Star Conveyancing — admin account provisioning and MFA enrollment
// No self-service signup — admin accounts are created deliberately (by a
// super_admin, or right now by a script), matching the Stage 2 role model.
import { hashPassword } from './password.js';
import { buildTotpUri, generateMfaSecret, verifyTotpCode } from './totp.js';
import { InvalidCredentialsError } from './login.js';
export async function provisionAdminUser(db, input) {
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
/** Step 1 of enrollment — generates and stores a secret, not yet active until confirmed with a real code. */
export async function beginMfaEnrollment(db, userId) {
    const user = await db.selectFrom('admin_users').selectAll().where('user_id', '=', userId).executeTakeFirstOrThrow();
    const secret = generateMfaSecret();
    await db.updateTable('admin_users').set({ mfa_secret: secret, mfa_enabled: false }).where('user_id', '=', userId).execute();
    return { secret, otpauthUri: buildTotpUri(secret, user.email) };
}
/** Step 2 — proves the user's authenticator app actually has the secret before MFA is switched on. */
export async function confirmMfaEnrollment(db, userId, code) {
    const user = await db.selectFrom('admin_users').selectAll().where('user_id', '=', userId).executeTakeFirstOrThrow();
    if (!user.mfa_secret) {
        throw new Error('No MFA enrollment in progress for this account — call beginMfaEnrollment first.');
    }
    if (!verifyTotpCode(user.mfa_secret, code)) {
        throw new InvalidCredentialsError('Incorrect verification code.');
    }
    await db.updateTable('admin_users').set({ mfa_enabled: true }).where('user_id', '=', userId).execute();
}
