import { describe, expect, it } from 'vitest';
import { generateQuoteReference } from '../src/api/reference.js';
import { RateLimiter } from '../src/api/rateLimiter.js';
import { validateClientAnswers } from '../src/api/schemas.js';

describe('generateQuoteReference', () => {
  it('produces a token in the expected format', () => {
    const ref = generateQuoteReference();
    expect(ref).toMatch(/^FSC-[23456789A-HJ-NP-Z]{4}(-[23456789A-HJ-NP-Z]{1,4}){3}$/);
  });

  it('never repeats across many calls', () => {
    const refs = new Set(Array.from({ length: 5_000 }, () => generateQuoteReference()));
    expect(refs.size).toBe(5_000);
  });

  it('excludes visually ambiguous characters (0, O, 1, I)', () => {
    for (let i = 0; i < 200; i++) {
      const ref = generateQuoteReference();
      expect(ref).not.toMatch(/[01OI]/);
    }
  });
});

describe('RateLimiter', () => {
  it('allows requests up to the limit within the window', () => {
    const limiter = new RateLimiter({ maxRequests: 3, windowMs: 1000 });
    const now = 1_000_000;
    expect(limiter.checkLimit('client-a', now)).toBe(true);
    expect(limiter.checkLimit('client-a', now)).toBe(true);
    expect(limiter.checkLimit('client-a', now)).toBe(true);
    expect(limiter.checkLimit('client-a', now)).toBe(false); // 4th request in the same instant
  });

  it('tracks separate keys independently', () => {
    const limiter = new RateLimiter({ maxRequests: 1, windowMs: 1000 });
    const now = 1_000_000;
    expect(limiter.checkLimit('client-a', now)).toBe(true);
    expect(limiter.checkLimit('client-b', now)).toBe(true); // different key, unaffected by client-a
    expect(limiter.checkLimit('client-a', now)).toBe(false);
  });

  it('refills over time', () => {
    const limiter = new RateLimiter({ maxRequests: 2, windowMs: 1000 });
    const t0 = 1_000_000;
    expect(limiter.checkLimit('client-a', t0)).toBe(true);
    expect(limiter.checkLimit('client-a', t0)).toBe(true);
    expect(limiter.checkLimit('client-a', t0)).toBe(false);
    expect(limiter.checkLimit('client-a', t0 + 1000)).toBe(true); // full window later, refilled
  });
});

describe('validateClientAnswers', () => {
  const validBody = {
    transactionType: 'purchase',
    postcode: 'SW1A 1AA',
    jurisdiction: 'england',
    propertyValue: 250_000,
    freeholdOrLeasehold: 'freehold',
    mortgageInvolved: true,
    flags: { newBuild: true },
  };

  it('accepts a well-formed request', () => {
    const result = validateClientAnswers(validBody);
    expect(result.success).toBe(true);
  });

  it('rejects an invalid postcode', () => {
    const result = validateClientAnswers({ ...validBody, postcode: 'not a postcode' });
    expect(result.success).toBe(false);
  });

  it('rejects a negative property value', () => {
    const result = validateClientAnswers({ ...validBody, propertyValue: -100 });
    expect(result.success).toBe(false);
  });

  it('rejects an unknown transaction type', () => {
    const result = validateClientAnswers({ ...validBody, transactionType: 'demolition' });
    expect(result.success).toBe(false);
  });

  it('rejects a non-boolean flag value', () => {
    const result = validateClientAnswers({ ...validBody, flags: { newBuild: 'yes' } });
    expect(result.success).toBe(false);
  });

  it('defaults flags to an empty object when omitted', () => {
    const { flags, ...withoutFlags } = validBody;
    const result = validateClientAnswers(withoutFlags);
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.flags).toEqual({});
  });
});
