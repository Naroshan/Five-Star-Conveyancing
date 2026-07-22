// Five Star Conveyancing — API handler integration tests
// Exercises createQuoteHandler and getQuoteHandler end to end against a real
// PostgreSQL database using real Fetch API Request objects — the same
// objects a Next.js route handler receives. Fictional fixture data only.

import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sql } from 'kysely';
import { createDb } from '../src/db/client.js';
import { createQuoteHandler } from '../src/api/createQuote.js';
import { getQuoteHandler } from '../src/api/getQuote.js';
import { RateLimiter } from '../src/api/rateLimiter.js';

const connectionString = process.env.DATABASE_URL;

if (connectionString) {
  describe('API handlers (integration, real Postgres)', () => {
    const db = createDb(connectionString);

    afterAll(async () => {
      await db.destroy();
    });

    beforeEach(async () => {
      await sql`truncate table quote_results, quotes, sdlt_ltt_rate_table, disbursement_rules, fee_rules, fee_value_bands, firm_restrictions, firm_transaction_types, firms restart identity cascade`.execute(
        db
      );

      await db
        .insertInto('firms')
        .values([{ firm_id: '11111111-1111-1111-1111-111111111111', legal_entity_name: 'Test Firm A (fixture)', status: 'active', quote_validity_days: 14 }])
        .execute();
      await db
        .insertInto('firm_transaction_types')
        .values([{ firm_id: '11111111-1111-1111-1111-111111111111', transaction_type: 'purchase', accepted: true }])
        .execute();
      await db
        .insertInto('fee_value_bands')
        .values([
          {
            firm_id: '11111111-1111-1111-1111-111111111111',
            transaction_type: 'purchase',
            value_min: 0,
            value_max: null,
            boundary_rule: 'inclusive_upper',
            base_fee: 900,
            effective_date: '2020-01-01',
            approval_status: 'approved',
          },
        ])
        .execute();
      await db
        .insertInto('fee_rules')
        .values([
          {
            firm_id: '11111111-1111-1111-1111-111111111111',
            transaction_type: 'purchase',
            charge_name: 'Legal fee',
            charge_type: 'base_fee',
            trigger_key: null,
            calculation_type: 'fixed',
            vat_treatment: 'standard',
            is_guaranteed: true,
            is_estimated: false,
            effective_date: '2020-01-01',
            approval_status: 'approved',
            display_order: 1,
            client_facing_explanation: 'Base conveyancing fee.',
          },
        ])
        .execute();
      await db
        .insertInto('sdlt_ltt_rate_table')
        .values([
          {
            jurisdiction: 'england',
            band_min: 0,
            band_max: null,
            rate_percentage: 1,
            relief_type: null,
            effective_date: '2020-01-01',
            source_reference: 'TEST FIXTURE — not a real rate',
          },
        ])
        .execute();
    });

    function postRequest(body: unknown, headers: Record<string, string> = {}): Request {
      return new Request('https://example.invalid/api/quotes', {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...headers },
        body: JSON.stringify(body),
      });
    }

    const validBody = {
      transactionType: 'purchase',
      postcode: 'SW1A 1AA',
      jurisdiction: 'england',
      propertyValue: 200_000,
      freeholdOrLeasehold: 'freehold',
      mortgageInvolved: true,
      flags: {},
    };

    it('creates a quote, persists it, and returns line-itemised results with SDLT', async () => {
      const response = await createQuoteHandler(postRequest(validBody), { db });
      expect(response.status).toBe(201);
      const body = await response.json();

      expect(body.quoteReference).toMatch(/^FSC-/);
      expect(body.results).toHaveLength(1);
      expect(body.results[0].eligibilityStatus).toBe('eligible');
      expect(body.results[0].firm.legalEntityName).toBe('Test Firm A (fixture)');
      expect(body.results[0].firm.firmId).toBe('11111111-1111-1111-1111-111111111111');
      expect(body.results[0].legalFeeSubtotal).toBe(900);
      expect(body.results[0].sdltEstimate).toBe(2_000); // 200,000 * 1% test rate
      expect(body.results[0].lineItems.length).toBeGreaterThan(0);
      expect(body.results[0].calculationAudit).toBeUndefined(); // stripped from the public response
    });

    it('rejects an invalid request with 400 and validation details', async () => {
      const response = await createQuoteHandler(postRequest({ ...validBody, propertyValue: -5 }), { db });
      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error.message).toBeDefined();
      expect(body.error.details).toBeDefined();
    });

    it('rejects malformed JSON with 400', async () => {
      const request = new Request('https://example.invalid/api/quotes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{not valid json',
      });
      const response = await createQuoteHandler(request, { db });
      expect(response.status).toBe(400);
    });

    it('enforces the rate limiter when one is supplied', async () => {
      const rateLimiter = new RateLimiter({ maxRequests: 2, windowMs: 60_000 });
      const headers = { 'x-forwarded-for': '203.0.113.7' };

      const first = await createQuoteHandler(postRequest(validBody, headers), { db, rateLimiter });
      const second = await createQuoteHandler(postRequest(validBody, headers), { db, rateLimiter });
      const third = await createQuoteHandler(postRequest(validBody, headers), { db, rateLimiter });

      expect(first.status).toBe(201);
      expect(second.status).toBe(201);
      expect(third.status).toBe(429);
    });

    it('retrieves a created quote by reference with full results', async () => {
      const createResponse = await createQuoteHandler(postRequest(validBody), { db });
      const created = await createResponse.json();

      const getResponse = await getQuoteHandler(created.quoteReference, db);
      expect(getResponse.status).toBe(200);
      const body = await getResponse.json();

      expect(body.status).toBe('active');
      expect(body.results[0].totalEstimate).toBe(created.results[0].totalEstimate);
      expect(body.results[0].firm.legalEntityName).toBe(created.results[0].firm.legalEntityName);
      // The fix for the "GET loses line items" gap — confirms the itemised
      // breakdown survives a save/reload round trip, not just a fresh POST.
      expect(body.results[0].lineItems.length).toBe(created.results[0].lineItems.length);
      expect(body.results[0].lineItems[0].chargeName).toBe(created.results[0].lineItems[0].chargeName);
    });

    it('returns 404 for an unknown reference', async () => {
      const response = await getQuoteHandler('FSC-DOES-NOT-EXIST', db);
      expect(response.status).toBe(404);
    });

    it('returns an expired state (not stale figures) for a lapsed quote, and flips status in the database', async () => {
      const createResponse = await createQuoteHandler(postRequest(validBody), { db });
      const created = await createResponse.json();

      // Force it into the past — firm's quote_validity_days was 14, so backdate expiry.
      await sql`update quotes set expiry_at = now() - interval '1 day' where quote_reference = ${created.quoteReference}`.execute(db);

      const getResponse = await getQuoteHandler(created.quoteReference, db);
      const body = await getResponse.json();
      expect(getResponse.status).toBe(200);
      expect(body.status).toBe('expired');
      expect(body.results).toBeUndefined();
      expect(body.message).toContain('expired');

      const row = await db.selectFrom('quotes').select('status').where('quote_reference', '=', created.quoteReference).executeTakeFirstOrThrow();
      expect(row.status).toBe('expired'); // lazy transition persisted
    });
  });
} else {
  describe.skip('API handlers (integration, real Postgres) — set DATABASE_URL to run', () => {
    it('skipped: no DATABASE_URL set', () => {});
  });
}
