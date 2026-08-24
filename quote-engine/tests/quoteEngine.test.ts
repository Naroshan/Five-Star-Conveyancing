// Five Star Conveyancing — Quote engine tests
//
// All firm names, fee figures, and thresholds below are FICTIONAL TEST FIXTURES
// invented purely to exercise the calculation logic. They do not represent any
// real participating firm and must never be used as production data.

import { describe, it, expect } from 'vitest';
import { calculateQuoteForFirm } from '../src/quoteEngine.js';
import { PLACEHOLDER_TEST_RATES } from '../src/sdltModule.js';
import type { ClientAnswers, FirmRuleSet } from '../src/types.js';

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
  function makeSaleAndPurchaseFirm(overrides: Partial<FirmRuleSet> = {}): FirmRuleSet {
    const base = makeTestFirm();
    return makeTestFirm({
      transactionTypes: [{ firmId: 'test-firm-a', transactionType: 'sale_and_purchase', accepted: true }],
      feeValueBands: base.feeValueBands.map((b) => ({ ...b, transactionType: 'sale_and_purchase' })),
      feeRules: base.feeRules.map((r) => ({ ...r, transactionType: 'sale_and_purchase' })),
      disbursementRules: base.disbursementRules.map((d) => ({ ...d, transactionType: 'sale_and_purchase' })),
      ...overrides,
    });
  }

  // Deliberately distinct values landing in different fee bands (800 for
  // <=250k, 1000 for >250k) so a summed result of 1,800 can't be a
  // coincidence of symmetric fixture data.
  function saleAndPurchaseAnswers(overrides: Partial<ClientAnswers> = {}): ClientAnswers {
    return makeAnswers({
      transactionType: 'sale_and_purchase',
      propertyValue: undefined,
      salePropertyValue: 200_000, // lower band -> 800
      purchasePropertyValue: 350_000, // upper band -> 1,000
      ...overrides,
    });
  }

  it('sums two independent base-fee lookups (one per leg) into legalFeeSubtotal', () => {
    const result = calculateQuoteForFirm(makeSaleAndPurchaseFirm(), saleAndPurchaseAnswers());
    const baseFeeLines = result.lineItems.filter((l) => l.category === 'legal_fee');
    expect(baseFeeLines).toHaveLength(2);
    expect(baseFeeLines.find((l) => l.leg === 'sale')?.amountExVat).toBe(800);
    expect(baseFeeLines.find((l) => l.leg === 'purchase')?.amountExVat).toBe(1_000);
    expect(result.legalFeeSubtotal).toBe(1_800);
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
    // Bands only cover values >= 250,000; sale value (200,000) falls below
    // every band's minimum, purchase value (350,000) matches fine.
    const ruleSet = makeSaleAndPurchaseFirm({
      feeValueBands: [
        {
          bandId: 'band-high-only',
          firmId: 'test-firm-a',
          transactionType: 'sale_and_purchase',
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

  it('excludes the firm if a property_value restriction fails on either leg', () => {
    const ruleSet = makeSaleAndPurchaseFirm({
      restrictions: [
        {
          restrictionId: 'r-sp',
          firmId: 'test-firm-a',
          transactionType: 'sale_and_purchase',
          restrictionType: 'property_value',
          valueMax: 300_000,
        },
      ],
    });
    // Sale value (200,000) is within the restriction; purchase value
    // (350,000) exceeds it — the firm must still be excluded.
    const result = calculateQuoteForFirm(ruleSet, saleAndPurchaseAnswers());
    expect(result.eligibilityStatus).toBe('excluded_with_reason');
    expect(result.exclusionReason).toContain('£300,000');
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
