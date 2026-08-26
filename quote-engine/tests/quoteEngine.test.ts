// Five Star Conveyancing — Quote engine tests
//
// All firm names, fee figures, and thresholds below are FICTIONAL TEST FIXTURES
// invented purely to exercise the calculation logic. They do not represent any
// real participating firm and must never be used as production data.

import { describe, it, expect } from 'vitest';
import { calculateQuoteForFirm } from '../src/quoteEngine.js';
import { PLACEHOLDER_TEST_RATES } from '../src/sdltModule.js';
import type { ClientAnswers, FirmRuleSet, FeeValueBand, FeeRule } from '../src/types.js';

function makeTestFirm(overrides: Partial<FirmRuleSet> = {}): FirmRuleSet {
  return {
    firm: {
      firmId: 'test-firm-a',
      legalEntityName: 'Test Firm A (fictional fixture)',
      tradingName: null,
      sraNumber: null,
      status: 'active',
      quoteValidityDays: 30,
      logoUrl: null,
      address: null,
    },
    transactionTypes: [{ firmId: 'test-firm-a', transactionType: 'purchase', accepted: true }],
    restrictions: [],
    feeValueBands: [
      {
        bandId: 'band-1',
        firmId: 'test-firm-a',
        transactionType: 'purchase',
        valueMin: 0,
        valueMax: 250_000,
        boundaryRule: 'inclusive_upper',
        baseFee: 800,
        effectiveDate: '2020-01-01',
        expiryDate: null,
        approvalStatus: 'approved',
        createdBy: null,
        lastModifiedBy: null,
        supersedesBandId: null,
      },
      {
        bandId: 'band-2',
        firmId: 'test-firm-a',
        transactionType: 'purchase',
        valueMin: 250_000,
        valueMax: null,
        boundaryRule: 'inclusive_upper',
        baseFee: 1_000,
        effectiveDate: '2020-01-01',
        expiryDate: null,
        approvalStatus: 'approved',
        createdBy: null,
        lastModifiedBy: null,
        supersedesBandId: null,
      },
    ],
    feeRules: [
      {
        feeRuleId: 'rule-base',
        firmId: 'test-firm-a',
        transactionType: 'purchase',
        chargeName: 'Legal fee',
        chargeType: 'base_fee',
        triggerKey: null,
        calculationType: 'fixed',
        amount: null,
        minAmount: null,
        maxAmount: null,
        formulaExpression: null,
        vatTreatment: 'standard',
        isGuaranteed: true,
        isEstimated: false,
        effectiveDate: '2020-01-01',
        expiryDate: null,
        approvalStatus: 'approved',
        displayOrder: 1,
        clientFacingExplanation: 'Base conveyancing fee.',
        createdBy: null,
        lastModifiedBy: null,
        supersedesFeeRuleId: null,
      },
      {
        feeRuleId: 'rule-leasehold',
        firmId: 'test-firm-a',
        transactionType: 'purchase',
        chargeName: 'Leasehold supplement',
        chargeType: 'supplement',
        triggerKey: 'leasehold',
        calculationType: 'fixed',
        amount: 150,
        minAmount: null,
        maxAmount: null,
        formulaExpression: null,
        vatTreatment: 'standard',
        isGuaranteed: true,
        isEstimated: false,
        effectiveDate: '2020-01-01',
        expiryDate: null,
        approvalStatus: 'approved',
        displayOrder: 2,
        clientFacingExplanation: 'Additional work reviewing lease terms and service charge accounts.',
        createdBy: null,
        lastModifiedBy: null,
        supersedesFeeRuleId: null,
      },
    ],
    disbursementRules: [
      {
        disbursementId: 'disb-searches',
        firmId: 'test-firm-a',
        transactionType: 'purchase',
        chargeName: 'Search pack',
        category: 'search',
        amountType: 'fixed',
        amount: 300,
        minAmount: null,
        maxAmount: null,
        vatTreatment: 'exempt',
        conditionalTriggerExpression: null,
        effectiveDate: '2020-01-01',
        expiryDate: null,
        approvalStatus: 'approved',
        displayOrder: 1,
        clientFacingExplanation: 'Local authority, water and environmental searches.',
        createdBy: null,
        lastModifiedBy: null,
        supersedesDisbursementId: null,
      },
    ],
    ...overrides,
  };
}

function makeAnswers(overrides: Partial<ClientAnswers> = {}): ClientAnswers {
  return {
    transactionType: 'purchase',
    postcode: 'TE1 1ST',
    jurisdiction: 'england',
    propertyValue: 200_000,
    freeholdOrLeasehold: 'freehold',
    mortgageInvolved: true,
    flags: {},
    ...overrides,
  };
}

describe('value band boundaries', () => {
  it('uses the lower band just below the threshold', () => {
    const result = calculateQuoteForFirm(makeTestFirm(), makeAnswers({ propertyValue: 249_999 }));
    expect(result.legalFeeSubtotal).toBe(800);
  });

  it('uses the lower band exactly at an inclusive_upper threshold', () => {
    const result = calculateQuoteForFirm(makeTestFirm(), makeAnswers({ propertyValue: 250_000 }));
    expect(result.legalFeeSubtotal).toBe(800);
  });

  it('uses the upper band just above the threshold', () => {
    const result = calculateQuoteForFirm(makeTestFirm(), makeAnswers({ propertyValue: 250_001 }));
    expect(result.legalFeeSubtotal).toBe(1_000);
  });
});

describe('supplements', () => {
  it('does not apply the leasehold supplement when the flag is absent', () => {
    const result = calculateQuoteForFirm(makeTestFirm(), makeAnswers());
    expect(result.lineItems.some((l) => l.chargeName === 'Leasehold supplement')).toBe(false);
  });

  it('applies the leasehold supplement when the flag is set', () => {
    const result = calculateQuoteForFirm(makeTestFirm(), makeAnswers({ flags: { leasehold: true } }));
    const supplement = result.lineItems.find((l) => l.chargeName === 'Leasehold supplement');
    expect(supplement?.amountExVat).toBe(150);
    expect(result.legalFeeSubtotal).toBe(950); // 800 base + 150 supplement
  });
});

describe('VAT treatment', () => {
  it('applies VAT to the standard-rated legal fee', () => {
    const result = calculateQuoteForFirm(makeTestFirm(), makeAnswers());
    const feeLine = result.lineItems.find((l) => l.category === 'legal_fee');
    expect(feeLine?.vatAmount).toBe(160); // 800 * 0.20
  });

  it('applies zero VAT to an exempt disbursement', () => {
    const result = calculateQuoteForFirm(makeTestFirm(), makeAnswers());
    const disbursementLine = result.lineItems.find((l) => l.category === 'disbursement');
    expect(disbursementLine?.vatAmount).toBe(0);
  });

  it('respects a custom VAT rate override', () => {
    const result = calculateQuoteForFirm(makeTestFirm(), makeAnswers(), { vatRate: 0.25 });
    const feeLine = result.lineItems.find((l) => l.category === 'legal_fee');
    expect(feeLine?.vatAmount).toBe(200); // 800 * 0.25
  });
});

describe('eligibility and exclusion', () => {
  it('excludes a firm outside its value restriction, with a client-facing reason', () => {
    const ruleSet = makeTestFirm({
      restrictions: [
        {
          restrictionId: 'r1',
          firmId: 'test-firm-a',
          transactionType: 'purchase',
          restrictionType: 'property_value',
          valueMax: 500_000,
        },
      ],
    });
    const result = calculateQuoteForFirm(ruleSet, makeAnswers({ propertyValue: 600_000 }));
    expect(result.eligibilityStatus).toBe('excluded_with_reason');
    expect(result.exclusionReason).toContain('£500,000');
    expect(result.totalEstimate).toBeNull();
  });

  it('excludes a firm that does not accept the transaction type', () => {
    const ruleSet = makeTestFirm({
      transactionTypes: [{ firmId: 'test-firm-a', transactionType: 'purchase', accepted: false }],
    });
    const result = calculateQuoteForFirm(ruleSet, makeAnswers());
    expect(result.eligibilityStatus).toBe('excluded_with_reason');
  });
});

describe('regression isolation', () => {
  it('changing one firm\'s fee does not change another firm\'s quote', () => {
    const firmA = makeTestFirm({ firm: { firmId: 'test-firm-a', legalEntityName: 'Firm A', tradingName: null, sraNumber: null, status: 'active', quoteValidityDays: 30, logoUrl: null, address: null } });
    const firmB = makeTestFirm({
      firm: { firmId: 'test-firm-b', legalEntityName: 'Firm B', tradingName: null, sraNumber: null, status: 'active', quoteValidityDays: 30, logoUrl: null, address: null },
      feeValueBands: makeTestFirm().feeValueBands.map((b) => ({ ...b, firmId: 'test-firm-b', baseFee: b.baseFee + 500 })),
      feeRules: makeTestFirm().feeRules.map((r) => ({ ...r, firmId: 'test-firm-b' })),
      disbursementRules: makeTestFirm().disbursementRules.map((d) => ({ ...d, firmId: 'test-firm-b' })),
    });

    const answers = makeAnswers();
    const resultA = calculateQuoteForFirm(firmA, answers);
    const resultB = calculateQuoteForFirm(firmB, answers);

    expect(resultA.legalFeeSubtotal).toBe(800);
    expect(resultB.legalFeeSubtotal).toBe(1_300); // 800 + 500, isolated to Firm B
  });
});

describe('SDLT integration', () => {
  it('calculates an indicative tax figure using injected placeholder bands, kept separate from the fee total', () => {
    const result = calculateQuoteForFirm(makeTestFirm(), makeAnswers({ propertyValue: 350_000 }), {
      sdltBands: PLACEHOLDER_TEST_RATES,
      jurisdiction: 'england',
    });
    // 0% on first 100k, 2% on next 200k (£4,000), 5% on final 50k (£2,500) = £6,500 using the fixture rates
    expect(result.sdltEstimate).toBe(6_500);
    expect(result.calculationAudit.some((a) => a.step === 'sdlt_calculation')).toBe(true);
  });

  it('omits SDLT entirely when no bands are supplied (e.g. remortgage)', () => {
    const result = calculateQuoteForFirm(makeTestFirm(), makeAnswers({ transactionType: 'purchase' }));
    expect(result.sdltEstimate).toBeNull();
  });
});

describe('sale_and_purchase (two property values)', () => {
  // sale_and_purchase has no scale of its own — the sale leg prices off the
  // firm's own 'sale'-scoped bands/rules and the purchase leg off its
  // 'purchase'-scoped ones. Deliberately DIFFERENT fee amounts per scope
  // (sale: 700/900, purchase: 800/1000 — not just different property
  // values landing in the same shared bands) so a test that accidentally
  // reads the wrong scope's bands for a leg produces a visibly wrong number
  // instead of coincidentally matching.
  function makeSaleAndPurchaseFirm(overrides: Partial<FirmRuleSet> = {}): FirmRuleSet {
    const purchaseBase = makeTestFirm();
    const saleBands: FeeValueBand[] = purchaseBase.feeValueBands.map((b) => ({
      ...b,
      bandId: `${b.bandId}-sale`,
      transactionType: 'sale',
      baseFee: b.baseFee - 100,
    }));
    const saleBaseFeeRules: FeeRule[] = purchaseBase.feeRules
      .filter((r) => r.chargeType === 'base_fee')
      .map((r) => ({ ...r, feeRuleId: `${r.feeRuleId}-sale`, transactionType: 'sale' }));

    return makeTestFirm({
      transactionTypes: [
        { firmId: 'test-firm-a', transactionType: 'purchase', accepted: true },
        { firmId: 'test-firm-a', transactionType: 'sale', accepted: true },
      ],
      feeValueBands: [...purchaseBase.feeValueBands, ...saleBands],
      feeRules: [...purchaseBase.feeRules, ...saleBaseFeeRules],
      ...overrides,
    });
  }

  // Distinct values landing in different fee bands (sale: 700 for <=250k;
  // purchase: 1,000 for >250k) so a summed result can't be a coincidence.
  function saleAndPurchaseAnswers(overrides: Partial<ClientAnswers> = {}): ClientAnswers {
    return makeAnswers({
      transactionType: 'sale_and_purchase',
      propertyValue: undefined,
      salePropertyValue: 200_000, // sale's lower band -> 700
      purchasePropertyValue: 350_000, // purchase's upper band -> 1,000
      ...overrides,
    });
  }

  it('sums two independent base-fee lookups (one per leg, its own scope) into legalFeeSubtotal', () => {
    const result = calculateQuoteForFirm(makeSaleAndPurchaseFirm(), saleAndPurchaseAnswers());
    const baseFeeLines = result.lineItems.filter((l) => l.category === 'legal_fee');
    expect(baseFeeLines).toHaveLength(2);
    expect(baseFeeLines.find((l) => l.leg === 'sale')?.amountExVat).toBe(700);
    expect(baseFeeLines.find((l) => l.leg === 'purchase')?.amountExVat).toBe(1_000);
    expect(result.legalFeeSubtotal).toBe(1_700);
  });

  it('tags the matching audit entries with their leg', () => {
    const result = calculateQuoteForFirm(makeSaleAndPurchaseFirm(), saleAndPurchaseAnswers());
    const auditEntries = result.calculationAudit.filter((a) => a.step === 'base_fee_lookup');
    expect(auditEntries).toHaveLength(2);
    expect(auditEntries.map((a) => a.leg).sort()).toEqual(['purchase', 'sale']);
  });

  it('calculates SDLT against the purchase value only, never the sale value', () => {
    const result = calculateQuoteForFirm(makeSaleAndPurchaseFirm(), saleAndPurchaseAnswers(), {
      sdltBands: PLACEHOLDER_TEST_RATES,
      jurisdiction: 'england',
    });
    // Purchase value 350,000 => £6,500 (same fixture math as the single-value
    // SDLT test above). Sale value 200,000 would instead give £2,000 — if
    // this ever regresses to reading the sale value, this assertion fails.
    expect(result.sdltEstimate).toBe(6_500);
  });

  it('excludes the firm if no band matches EITHER leg alone', () => {
    // Only a purchase-scoped band exists (covering >= 250,000) — there's no
    // sale-scoped band at all, so the sale leg (200,000) can't match
    // anything while the purchase leg (350,000) matches fine.
    const ruleSet = makeSaleAndPurchaseFirm({
      feeValueBands: [
        {
          bandId: 'band-purchase-only',
          firmId: 'test-firm-a',
          transactionType: 'purchase',
          valueMin: 250_000,
          valueMax: null,
          boundaryRule: 'inclusive_lower',
          baseFee: 1_000,
          effectiveDate: '2020-01-01',
          expiryDate: null,
          approvalStatus: 'approved',
          createdBy: null,
          lastModifiedBy: null,
          supersedesBandId: null,
        },
      ],
    });
    const result = calculateQuoteForFirm(ruleSet, saleAndPurchaseAnswers());
    expect(result.eligibilityStatus).toBe('excluded_with_reason');
    expect(result.exclusionReason).toContain('sale');
    expect(result.totalEstimate).toBeNull();
  });

  it('excludes the firm if a property_value restriction fails on its own leg', () => {
    const ruleSet = makeSaleAndPurchaseFirm({
      restrictions: [
        {
          restrictionId: 'r-purchase',
          firmId: 'test-firm-a',
          transactionType: 'purchase',
          restrictionType: 'property_value',
          valueMax: 300_000,
        },
      ],
    });
    // Purchase value (350,000) exceeds this purchase-scoped restriction's max.
    const result = calculateQuoteForFirm(ruleSet, saleAndPurchaseAnswers());
    expect(result.eligibilityStatus).toBe('excluded_with_reason');
    expect(result.exclusionReason).toContain('£300,000');
  });

  it('does not exclude when a scoped restriction would only fail the OTHER leg\'s value', () => {
    const ruleSet = makeSaleAndPurchaseFirm({
      restrictions: [
        {
          restrictionId: 'r-sale',
          firmId: 'test-firm-a',
          transactionType: 'sale',
          restrictionType: 'property_value',
          valueMax: 300_000,
        },
      ],
    });
    // This restriction is sale-scoped, so only the sale value (200,000,
    // within the £300,000 max) is checked — the purchase value (350,000,
    // which WOULD exceed it) is irrelevant to a sale-scoped restriction.
    // Proves restrictions are scope-precise, not "any leg's value against
    // any matching restriction" (the old, less precise behavior).
    const result = calculateQuoteForFirm(ruleSet, saleAndPurchaseAnswers());
    expect(result.eligibilityStatus).toBe('eligible');
  });

  it('fires supplements from both scopes independently when the same flag triggers both', () => {
    // Documented limitation: answers.flags is shared across both legs, so a
    // triggerKey defined as a supplement under BOTH the purchase and sale
    // scope fires twice when that flag is set once — correct if both legs
    // genuinely share the trait, an overcount if only one does. This test
    // pins down that this is the intended (if imperfect) behavior, not an
    // accidental regression.
    const ruleSet = makeSaleAndPurchaseFirm({
      feeRules: [
        ...makeTestFirm().feeRules,
        {
          feeRuleId: 'rule-leasehold-sale',
          firmId: 'test-firm-a',
          transactionType: 'sale',
          chargeName: 'Leasehold supplement',
          chargeType: 'supplement',
          triggerKey: 'leasehold',
          calculationType: 'fixed',
          amount: 150,
          minAmount: null,
          maxAmount: null,
          formulaExpression: null,
          vatTreatment: 'standard',
          isGuaranteed: true,
          isEstimated: false,
          effectiveDate: '2020-01-01',
          expiryDate: null,
          approvalStatus: 'approved',
          displayOrder: 2,
          clientFacingExplanation: 'Additional work reviewing lease terms and service charge accounts.',
          createdBy: null,
          lastModifiedBy: null,
          supersedesFeeRuleId: null,
        },
        ...makeTestFirm().feeRules
          .filter((r) => r.chargeType === 'base_fee')
          .map((r) => ({ ...r, feeRuleId: `${r.feeRuleId}-sale`, transactionType: 'sale' as const })),
      ],
    });
    const result = calculateQuoteForFirm(ruleSet, saleAndPurchaseAnswers({ flags: { leasehold: true } }));
    const supplementLines = result.lineItems.filter((l) => l.category === 'supplement');
    expect(supplementLines).toHaveLength(2);
    expect(supplementLines.map((l) => l.leg).sort()).toEqual(['purchase', 'sale']);
  });
});

describe('audit trail', () => {
  it('records the rule id and effective date used for every applied rule', () => {
    const result = calculateQuoteForFirm(makeTestFirm(), makeAnswers({ flags: { leasehold: true } }));
    const baseFeeEntry = result.calculationAudit.find((a) => a.step === 'base_fee_lookup');
    const supplementEntry = result.calculationAudit.find((a) => a.step === 'supplement_applied');
    expect(baseFeeEntry?.ruleId).toBeDefined();
    expect(supplementEntry?.ruleId).toBe('rule-leasehold');
    expect(supplementEntry?.effectiveDateUsed).toBe('2020-01-01');
  });
});
