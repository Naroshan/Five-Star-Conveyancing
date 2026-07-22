// Five Star Conveyancing — Quote calculation engine
// Implements the pipeline specified in Stage 2, Section 5:
// eligibility -> base fee (value band) -> supplements -> disbursements
// -> SDLT (optional, injected) -> VAT per line -> totals -> audit trail.
//
// All fee/disbursement figures are read from the FirmRuleSet passed in —
// nothing is hard-coded here, per the Stage 1/2/4 requirement.

import type {
  ClientAnswers,
  FirmRuleSet,
  FeeValueBand,
  LineItem,
  CalculationAuditEntry,
  QuoteResult,
  SdltBand,
} from './types.js';
import { checkEligibility } from './eligibility.js';
import { calculateIndicativeTax } from './sdltModule.js';

export interface CalculateQuoteOptions {
  sdltBands?: SdltBand[]; // omit to skip SDLT entirely (e.g. remortgage, lease extension)
  jurisdiction?: 'england' | 'wales';
  asOfDate?: string; // ISO date; defaults to today. Lets historical quotes be reproduced.
  vatRate?: number; // defaults to 0.20 (current UK standard rate) — override if this ever changes
}

export function calculateQuotesForFirms(
  ruleSets: FirmRuleSet[],
  answers: ClientAnswers,
  options: CalculateQuoteOptions = {}
): QuoteResult[] {
  return ruleSets.map((ruleSet) => calculateQuoteForFirm(ruleSet, answers, options));
}

export function calculateQuoteForFirm(
  ruleSet: FirmRuleSet,
  answers: ClientAnswers,
  options: CalculateQuoteOptions = {}
): QuoteResult {
  const asOfDate = options.asOfDate ?? new Date().toISOString().slice(0, 10);
  const vatRate = options.vatRate ?? 0.2;
  const audit: CalculationAuditEntry[] = [];

  const eligibility = checkEligibility(ruleSet, answers);
  audit.push({
    step: 'eligibility_check',
    detail: eligibility.eligible ? 'Firm is eligible.' : `Firm excluded: ${eligibility.reason}`,
  });

  if (!eligibility.eligible) {
    return {
      firmId: ruleSet.firm.firmId,
      eligibilityStatus: 'excluded_with_reason',
      exclusionReason: eligibility.reason,
      lineItems: [],
      legalFeeSubtotal: 0,
      vatTotal: 0,
      disbursementsTotal: 0,
      sdltEstimate: null,
      totalEstimate: null,
      calculationAudit: audit,
    };
  }

  const lineItems: LineItem[] = [];

  // 1. Base fee via value band, respecting the explicit inclusive boundary rule.
  const band = selectValueBand(ruleSet.feeValueBands, ruleSet.firm.firmId, answers, asOfDate);
  if (!band) {
    audit.push({
      step: 'base_fee_lookup',
      detail: 'No approved, in-date fee band matched this property value — treated as ineligible.',
    });
    return {
      firmId: ruleSet.firm.firmId,
      eligibilityStatus: 'excluded_with_reason',
      exclusionReason: 'This firm has no published fee for a property of this value.',
      lineItems: [],
      legalFeeSubtotal: 0,
      vatTotal: 0,
      disbursementsTotal: 0,
      sdltEstimate: null,
      totalEstimate: null,
      calculationAudit: audit,
    };
  }
  audit.push({
    step: 'base_fee_lookup',
    detail: `Matched value band £${band.valueMin}–${band.valueMax ?? '∞'} (${band.boundaryRule}).`,
    ruleId: band.bandId,
    effectiveDateUsed: band.effectiveDate,
  });

  const baseFeeRule = ruleSet.feeRules.find(
    (r) =>
      r.chargeType === 'base_fee' &&
      r.transactionType === answers.transactionType &&
      isInDate(r.effectiveDate, r.expiryDate, asOfDate) &&
      r.approvalStatus === 'approved'
  );
  lineItems.push(
    makeLineItem(
      baseFeeRule?.chargeName ?? 'Legal fee',
      'legal_fee',
      band.baseFee,
      baseFeeRule?.vatTreatment ?? 'standard',
      baseFeeRule?.isEstimated ?? false,
      baseFeeRule?.isGuaranteed ?? true,
      baseFeeRule?.clientFacingExplanation ?? 'Base conveyancing fee for this transaction type and property value.',
      vatRate
    )
  );

  // 2. Supplements — every approved, in-date rule whose trigger_key is true in answers.flags.
  const supplementRules = ruleSet.feeRules.filter(
    (r) =>
      r.chargeType === 'supplement' &&
      r.transactionType === answers.transactionType &&
      isInDate(r.effectiveDate, r.expiryDate, asOfDate) &&
      r.approvalStatus === 'approved' &&
      r.triggerKey !== null &&
      answers.flags[r.triggerKey] === true
  );
  for (const rule of supplementRules) {
    const amount = rule.amount ?? 0;
    lineItems.push(
      makeLineItem(
        rule.chargeName,
        'supplement',
        amount,
        rule.vatTreatment,
        rule.isEstimated,
        rule.isGuaranteed,
        rule.clientFacingExplanation,
        vatRate
      )
    );
    audit.push({
      step: 'supplement_applied',
      detail: `${rule.chargeName} applied (trigger: ${rule.triggerKey}).`,
      ruleId: rule.feeRuleId,
      effectiveDateUsed: rule.effectiveDate,
    });
  }

  // 3. Disbursements — fixed or estimated-range; excluded ones are omitted entirely.
  const disbursementRules = ruleSet.disbursementRules.filter(
    (d) =>
      d.transactionType === answers.transactionType &&
      isInDate(d.effectiveDate, d.expiryDate, asOfDate) &&
      d.approvalStatus === 'approved' &&
      d.amountType !== 'excluded' &&
      (d.conditionalTriggerExpression === null || answers.flags[d.conditionalTriggerExpression] === true)
  );
  for (const rule of disbursementRules) {
    const amount = rule.amountType === 'fixed' ? rule.amount ?? 0 : (rule.minAmount ?? 0 + (rule.maxAmount ?? 0)) / 2;
    lineItems.push(
      makeLineItem(
        rule.chargeName,
        'disbursement',
        amount,
        rule.vatTreatment,
        rule.amountType === 'estimated_range',
        rule.amountType === 'fixed',
        rule.clientFacingExplanation,
        vatRate
      )
    );
    audit.push({
      step: 'disbursement_applied',
      detail: `${rule.chargeName} (${rule.amountType}).`,
      ruleId: rule.disbursementId,
      effectiveDateUsed: rule.effectiveDate,
    });
  }

  // 4. SDLT/LTT — optional, calculated separately, never merged silently into the fee total.
  let sdltEstimate: number | null = null;
  if (options.sdltBands && options.jurisdiction) {
    const result = calculateIndicativeTax(answers.propertyValue, options.jurisdiction, options.sdltBands, asOfDate);
    sdltEstimate = result.estimate;
    audit.push({
      step: 'sdlt_calculation',
      detail: `Indicative ${options.jurisdiction === 'england' ? 'SDLT' : 'LTT'} of £${sdltEstimate} using ${result.bandsApplied.length} band(s). Subject to confirmation by the instructed conveyancer.`,
    });
  }

  // 5. Totals.
  const legalFeeSubtotal = sum(lineItems.filter((l) => l.category === 'legal_fee' || l.category === 'supplement').map((l) => l.amountExVat));
  const disbursementsTotal = sum(lineItems.filter((l) => l.category === 'disbursement').map((l) => l.amountExVat));
  const vatTotal = sum(lineItems.map((l) => l.vatAmount));
  const totalEstimate = round2(legalFeeSubtotal + disbursementsTotal + vatTotal + (sdltEstimate ?? 0));

  audit.push({
    step: 'totals',
    detail: `Legal fees £${legalFeeSubtotal} + VAT £${vatTotal} + disbursements £${disbursementsTotal}` +
      (sdltEstimate !== null ? ` + SDLT/LTT £${sdltEstimate}` : '') +
      ` = £${totalEstimate}.`,
  });

  return {
    firmId: ruleSet.firm.firmId,
    eligibilityStatus: 'eligible',
    exclusionReason: null,
    lineItems,
    legalFeeSubtotal: round2(legalFeeSubtotal),
    vatTotal: round2(vatTotal),
    disbursementsTotal: round2(disbursementsTotal),
    sdltEstimate,
    totalEstimate,
    calculationAudit: audit,
  };
}

// Value-band selection with an explicit, testable boundary rule — this is the
// logic the Stage 8 boundary tests exercise at, just below, and just above
// every threshold.
function selectValueBand(
  bands: FeeValueBand[],
  firmId: string,
  answers: ClientAnswers,
  asOfDate: string
): FeeValueBand | null {
  const candidates = bands.filter(
    (b) =>
      b.firmId === firmId &&
      b.transactionType === answers.transactionType &&
      b.approvalStatus === 'approved' &&
      isInDate(b.effectiveDate, b.expiryDate, asOfDate)
  );

  for (const band of candidates) {
    const value = answers.propertyValue;
    const aboveMin = band.boundaryRule === 'inclusive_lower' ? value >= band.valueMin : value > band.valueMin;
    const belowMax =
      band.valueMax === null
        ? true
        : band.boundaryRule === 'inclusive_upper'
          ? value <= band.valueMax
          : value < band.valueMax;
    if (aboveMin && belowMax) return band;
  }
  return null;
}

function isInDate(effectiveDate: string, expiryDate: string | null, asOfDate: string): boolean {
  return effectiveDate <= asOfDate && (expiryDate === null || expiryDate > asOfDate);
}

function makeLineItem(
  chargeName: string,
  category: LineItem['category'],
  amountExVat: number,
  vatTreatment: LineItem['vatTreatment'],
  isEstimated: boolean,
  isGuaranteed: boolean,
  explanation: string,
  vatRate: number
): LineItem {
  const vatAmount = vatTreatment === 'standard' ? round2(amountExVat * vatRate) : 0;
  return {
    chargeName,
    category,
    amountExVat: round2(amountExVat),
    vatTreatment,
    vatAmount,
    isEstimated,
    isGuaranteed,
    explanation,
  };
}

function sum(values: number[]): number {
  return values.reduce((total, v) => total + v, 0);
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
