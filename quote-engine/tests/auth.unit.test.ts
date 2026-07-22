import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword, WeakPasswordError, MIN_PASSWORD_LENGTH, DUMMY_HASH_FOR_TIMING_SAFETY } from '../src/auth/password.js';
import { generateMfaSecret, buildTotpUri, verifyTotpCode } from '../src/auth/totp.js';
import { TOTP, Secret } from 'otpauth';

describe('password hashing', () => {
  it('hashes and verifies a valid password', async () => {
    const hash = await hashPassword('a-genuinely-long-password-123');
    expect(hash).not.toBe('a-genuinely-long-password-123');
    expect(await verifyPassword('a-genuinely-long-password-123', hash)).toBe(true);
  });

  it('rejects the wrong password', async () => {
    const hash = await hashPassword('correct-horse-battery-staple');
    expect(await verifyPassword('wrong-password-entirely', hash)).toBe(false);
  });

  it('rejects passwords shorter than the minimum length', async () => {
    expect('short'.length).toBeLessThan(MIN_PASSWORD_LENGTH);
    await expect(hashPassword('short')).rejects.toThrow(WeakPasswordError);
  });

  it('the timing-safety dummy hash is a real, verifiable bcrypt hash', async () => {
    expect(await verifyPassword('a-password-nobody-has-EJ4mP9qX', DUMMY_HASH_FOR_TIMING_SAFETY)).toBe(true);
    expect(await verifyPassword('anything-else', DUMMY_HASH_FOR_TIMING_SAFETY)).toBe(false);
  });

  it('produces a different hash each time for the same password (salted)', async () => {
    const a = await hashPassword('same-password-both-times-12345');
    const b = await hashPassword('same-password-both-times-12345');
    expect(a).not.toBe(b);
  });
});

describe('TOTP MFA', () => {
  it('generates a base32 secret', () => {
    const secret = generateMfaSecret();
    expect(secret).toMatch(/^[A-Z2-7]+$/); // base32 alphabet
    expect(secret.length).toBeGreaterThan(10);
  });

  it('builds a valid otpauth:// URI naming the issuer and account', () => {
    const uri = buildTotpUri(generateMfaSecret(), 'reviewer@example.test');
    expect(uri).toMatch(/^otpauth:\/\/totp\//);
    expect(uri).toContain('Five%20Star%20Conveyancing');
    expect(uri).toContain('reviewer%40example.test');
  });

  it('accepts a currently-valid code generated from the same secret', () => {
    const secret = generateMfaSecret();
    const totp = new TOTP({ secret: Secret.fromBase32(secret), algorithm: 'SHA1', digits: 6, period: 30 });
    const code = totp.generate();
    expect(verifyTotpCode(secret, code)).toBe(true);
  });

  it('rejects a code generated from a different secret', () => {
    const secretA = generateMfaSecret();
    const secretB = generateMfaSecret();
    const totpB = new TOTP({ secret: Secret.fromBase32(secretB), algorithm: 'SHA1', digits: 6, period: 30 });
    expect(verifyTotpCode(secretA, totpB.generate())).toBe(false);
  });

  it('rejects malformed input without throwing', () => {
    const secret = generateMfaSecret();
    expect(verifyTotpCode(secret, 'not-a-code')).toBe(false);
    expect(verifyTotpCode(secret, '12345')).toBe(false); // too short
    expect(verifyTotpCode(secret, '')).toBe(false);
  });
});
