// Five Star Conveyancing — TOTP-based MFA (authenticator apps: Google
// Authenticator, 1Password, Authy, etc.). Implements Stage 1's "MFA for
// every admin role" requirement — not a checkbox that does nothing.
import { Secret, TOTP } from 'otpauth';
const ISSUER = 'Five Star Conveyancing';
export function generateMfaSecret() {
    return new Secret({ size: 20 }).base32;
}
/** The otpauth:// URI an authenticator app scans (as a QR code) or accepts pasted in. */
export function buildTotpUri(secret, email) {
    const totp = new TOTP({
        issuer: ISSUER,
        label: email,
        secret: Secret.fromBase32(secret),
        algorithm: 'SHA1',
        digits: 6,
        period: 30,
    });
    return totp.toString();
}
/** Allows one 30s step of clock drift either side, per common authenticator-app practice. */
export function verifyTotpCode(secret, code) {
    if (!/^\d{6}$/.test(code))
        return false;
    const totp = new TOTP({ secret: Secret.fromBase32(secret), algorithm: 'SHA1', digits: 6, period: 30 });
    const delta = totp.validate({ token: code, window: 1 });
    return delta !== null;
}
