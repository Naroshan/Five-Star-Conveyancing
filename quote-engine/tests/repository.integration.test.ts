// Five Star Conveyancing — repository integration tests
// Runs against a real PostgreSQL database (schema.sql applied) rather than
// mocks, so the SQL itself — joins, jsonb round-tripping, date handling —
// is actually exercised. All firm/fee data is fictional test fixtures.
//
// Requires DATABASE_URL to point at a disposable test database. Every test
// truncates and re-seeds the relevant tables, so this must never point at
// production.

import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sql } from 'kysely';
import { createDb } from '../src/db/client.js';
import { getQuoteByReference, loadActiveFirmRuleSets, loadFirmRuleSet, saveQuote, saveQuoteResults } from '../src/db/repository.js';
import { calculateQuoteForFirm } from '../src/quoteEngine.js';
import type { ClientAnswers } from '../src/types.js';

const connectionString = process.env.DATABASE_URL;

// If DATABASE_URL isn't set, this whole suite is skipped rather than
// attempting to construct a client with no connection string — `npm test`
// runs the fast unit suite everywhere; `npm run test:integration` runs this
// suite wherever a disposable Postgres instance is available.
if (connectionString) {
  describe('repository (integration, real Postgres)', () => {
    const db = createDb(connectionString);

  afterAll(async () => {
    await db.destroy();
  });

  beforeEach(async () => {
    await sql`truncate table quote_results, quotes, disbursement_rules, fee_rules, fee_value_bands, firm_restrictions, firm_transaction_types, firms restart identity cascade`.execute(
      db
    );

    await db
      .insertInto('firms')
      .values([
        { firm_id: '11111111-1111-1111-1111-111111111111', legal_entity_name: 'Test Firm A (fixture)', status: 'active', quote_validity_days: 30 },
        { firm_id: '22222222-2222-2222-2222-222222222222', legal_entity_name: 'Test Firm B (fixture)', status: 'suspended', quote_validity_days: 30 },
      ])
      .execute();

    await db
      .insertInto('firm_transaction_types')
      .values([
        { firm_id: '11111111-1111-1111-1111-111111111111', transaction_type: 'purchase', accepted: true },
        { firm_id: '22222222-2222-2222-2222-222222222222', transaction_type: 'purchase', accepted: true },
      ])
      .execute();

    await db
      .insertInto('firm_restrictions')
      .values([
        {
          firm_id: '11111111-1111-1111-1111-111111111111',
          transaction_type: 'purchase',
          restriction_type: 'property_value',
          value_max: 500_000,
          notes: null,
        },
      ])
      .execute();

    await db
      .insertInto('fee_value_bands')
      .values([
        {
          firm_id: '11111111-1111-1111-1111-111111111111',
          transaction_type: 'purchase',
          value_min: 0,
          value_max: 250_000,
          boundary_rule: 'inclusive_upper',
          base_fee: 800,
          effective_date: '2020-01-01',
          approval_status: 'approved',
        },
        {
          firm_id: '11111111-1111-1111-1111-111111111111',
          transaction_type: 'purchase',
          value_min: 250_000,
          value_max: null,
          boundary_rule: 'inclusive_upper',
          base_fee: 1_000,
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
      .insertInto('disbursement_rules')
      .values([
        {
          firm_id: '11111111-1111-1111-1111-111111111111',
          transaction_type: 'purchase',
          charge_name: 'Search pack',
          category: 'search',
          amount_type: 'fixed',
          amount: 300,
          vat_treatment: 'exempt',
          effective_date: '2020-01-01',
          approval_status: 'approved',
          display_order: 1,
          client_facing_explanation: 'Local authority, water and environmental searches.',
        },
      ])
      .execute();
  });

  it('loads a firm rule set with correctly typed dates and numbers', async () => {
    const ruleSet = await loadFirmRuleSet(db, '11111111-1111-1111-1111-111111111111', 'purchase');
    expect(ruleSet).not.toBeNull();
    expect(ruleSet!.firm.legalEntityName).toBe('Test Firm A (fixture)');
    expect(ruleSet!.feeValueBands).toHaveLength(2);
    expect(ruleSet!.feeValueBands[0].effectiveDate).toBe('2020-01-01'); // Date -> 'YYYY-MM-DD' string
    expect(typeof ruleSet!.feeValueBands[0].baseFee).toBe('number'); // numeric column parsed as number, not string
    expect(ruleSet!.restrictions[0].valueMax).toBe(500_000);
  });

  it('returns null for a firm that does not exist', async () => {
    const ruleSet = await loadFirmRuleSet(db, '99999999-9999-9999-9999-999999999999', 'purchase');
    expect(ruleSet).toBeNull();
  });

  it('loadActiveFirmRuleSets only returns active firms accepting the transaction type', async () => {
    const ruleSets = await loadActiveFirmRuleSets(db, 'purchase');
    expect(ruleSets).toHaveLength(1); // Firm B is 'suspended' and correctly excluded
    expect(ruleSets[0].firm.legalEntityName).toBe('Test Firm A (fixture)');
  });

  it('feeds a real database load straight into the calculation engine and gets a correct total', async () => {
    const ruleSet = await loadFirmRuleSet(db, '11111111-1111-1111-1111-111111111111', 'purchase');
    const answers: ClientAnswers = {
      transactionType: 'purchase',
      postcode: 'TE1 1ST',
      jurisdiction: 'england',
      propertyValue: 200_000,
      freeholdOrLeasehold: 'freehold',
      mortgageInvolved: true,
      flags: {},
    };
    const result = calculateQuoteForFirm(ruleSet!, answers);
    expect(result.eligibilityStatus).toBe('eligible');
    expect(result.legalFeeSubtotal).toBe(800);
    expect(result.totalEstimate).toBe(800 + 160 + 300); // fee + VAT + exempt disbursement
  });

  it('round-trips a full quote — save, then retrieve by reference — including the jsonb audit trail', async () => {
    const ruleSet = await loadFirmRuleSet(db, '11111111-1111-1111-1111-111111111111', 'purchase');
    const answers: ClientAnswers = {
      transactionType: 'purchase',
      postcode: 'TE1 1ST',
      jurisdiction: 'england',
      propertyValue: 200_000,
      freeholdOrLeasehold: 'freehold',
      mortgageInvolved: true,
      flags: {},
    };
    const result = calculateQuoteForFirm(ruleSet!, answers);

    const quoteId = await saveQuote(db, {
      quoteReference: 'TEST-QUOTE-REF-001',
      transactionType: 'purchase',
      clientAnswers: answers,
      expiryAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await saveQuoteResults(db, quoteId, [result]);

    const retrieved = await getQuoteByReference(db, 'TEST-QUOTE-REF-001');
    expect(retrieved).not.toBeNull();
    expect(retrieved!.clientAnswers.propertyValue).toBe(200_000);
    expect(retrieved!.results).toHaveLength(1);
    expect(retrieved!.results[0].totalEstimate).toBe(result.totalEstimate);
    expect(retrieved!.results[0].calculationAudit.length).toBeGreaterThan(0);
    expect(retrieved!.results[0].calculationAudit[0].step).toBe('eligibility_check');
  });

  it('persists an excluded_with_reason result with null totals', async () => {
    const excludedResult = {
      firmId: '11111111-1111-1111-1111-111111111111',
      eligibilityStatus: 'excluded_with_reason' as const,
      exclusionReason: "This firm's maximum property value for this transaction type is £500,000.",
      lineItems: [],
      legalFeeSubtotal: 0,
      vatTotal: 0,
      disbursementsTotal: 0,
      sdltEstimate: null,
      totalEstimate: null,
      calculationAudit: [{ step: 'eligibility_check', detail: 'Firm excluded: over value cap.' }],
    };
    const quoteId = await saveQuote(db, {
      quoteReference: 'TEST-QUOTE-REF-002',
      transactionType: 'purchase',
      clientAnswers: {
        transactionType: 'purchase',
        postcode: 'TE1 1ST',
        jurisdiction: 'england',
        propertyValue: 600_000,
        freeholdOrLeasehold: 'freehold',
        mortgageInvolved: false,
        flags: {},
      },
      expiryAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    });
    await saveQuoteResults(db, quoteId, [excludedResult]);

    const retrieved = await getQuoteByReference(db, 'TEST-QUOTE-REF-002');
    expect(retrieved!.results[0].eligibilityStatus).toBe('excluded_with_reason');
    expect(retrieved!.results[0].totalEstimate).toBeNull();
    expect(retrieved!.results[0].exclusionReason).toContain('£500,000');
  });
  });
} else {
  describe.skip('repository (integration, real Postgres) — set DATABASE_URL to run', () => {
    it('skipped: no DATABASE_URL set', () => {});
  });
}
