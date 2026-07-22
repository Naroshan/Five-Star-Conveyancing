export declare function generateMfaSecret(): string;
/** The otpauth:// URI an authenticator app scans (as a QR code) or accepts pasted in. */
export declare function buildTotpUri(secret: string, email: string): string;
/** Allows one 30s step of clock drift either side, per common authenticator-app practice. */
export declare function verifyTotpCode(secret: string, code: string): boolean;
