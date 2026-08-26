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
  TransactionType,
  PropertyLeg,
} from './types.js';
import { checkEligibility } from './eligibility.js';
import { calculateIndicativeTax } from './sdltModule.js';
import { resolveTransactionTypeScopes } from './transactionTypeScopes.js';

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
  // sale_and_purchase has no scale of its own — no firm publishes a separate
  // "combined" scale, only Purchase and Sale — so the sale leg is priced off
  // the firm's own 'sale'-scoped bands/rules and the purchase leg off its
  // 'purchase'-scoped ones, and the two results are summed; every other
  // transaction type runs the lookup once, exactly as before.
  if (answers.transactionType === 'sale_and_purchase') {
    const saleResult = computeBaseFee(ruleSet, 'sale', answers.salePropertyValue!, asOfDate, vatRate, 'sale');
    const purchaseResult = computeBaseFee(ruleSet, 'purchase', answers.purchasePropertyValue!, asOfDate, vatRate, 'purchase');

    if (!saleResult || !purchaseResult) {
      const missingLeg = !saleResult && !purchaseResult ? 'sale and purchase' : !saleResult ? 'sale' : 'purchase';
      audit.push({
        step: 'base_fee_lookup',
        detail: `No approved, in-date fee band matched the ${missingLeg} value — treated as ineligible.`,
      });
      return {
        firmId: ruleSet.firm.firmId,
        eligibilityStatus: 'excluded_with_reason',
        exclusionReason: `This firm has no published fee for a ${missingLeg} of this value.`,
        lineItems: [],
        legalFeeSubtotal: 0,
        vatTotal: 0,
        disbursementsTotal: 0,
        sdltEstimate: null,
        totalEstimate: null,
        calculationAudit: audit,
      };
    }

    audit.push(saleResult.matchedAudit, purchaseResult.matchedAudit);
    lineItems.push(saleResult.lineItem, purchaseResult.lineItem);
  } else {
    const result = computeBaseFee(ruleSet, answers.transactionType, answers.propertyValue!, asOfDate, vatRate);
    if (!result) {
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
    audit.push(result.matchedAudit);
    lineItems.push(result.lineItem);
  }

  // 2. Supplements — every approved, in-date rule whose trigger_key is true in answers.flags.
  // For sale_and_purchase, rules from BOTH the firm's purchase-scoped and
  // sale-scoped rule sets are checked against the same shared answers.flags/
  // freeholdOrLeasehold — there's no per-leg version of those fields today.
  // Known limitation: if a firm defines a supplement on the same triggerKey
  // under both scopes (e.g. a "Leasehold Supplement" on both), setting that
  // flag once fires BOTH copies — correct if both legs share the trait,
  // an overcount if only one does. Splitting flags/freeholdOrLeasehold per
  // leg would fix this properly but is a real feature addition, not done here.
  const scopes = resolveTransactionTypeScopes(answers.transactionType);
  const supplementRules = ruleSet.feeRules.filter(
    (r) =>
      r.chargeType === 'supplement' &&
      scopes.includes(r.transactionType) &&
      isInDate(r.effectiveDate, r.expiryDate, asOfDate) &&
      r.approvalStatus === 'approved' &&
      r.triggerKey !== null &&
      answers.flags[r.triggerKey] === true
  );
  for (const rule of supplementRules) {
    const amount = rule.amount ?? 0;
    const leg = legForScope(answers.transactionType, rule.transactionType);
    const legSuffix = leg ? ` (${leg})` : '';
    const lineItem = makeLineItem(
      rule.chargeName + legSuffix,
      'supplement',
      amount,
      rule.vatTreatment,
      rule.isEstimated,
      rule.isGuaranteed,
      rule.clientFacingExplanation,
      vatRate
    );
    if (leg) lineItem.leg = leg;
    lineItems.push(lineItem);
    audit.push({
      step: 'supplement_applied',
      detail: `${rule.chargeName} applied (trigger: ${rule.triggerKey}).`,
      ruleId: rule.feeRuleId,
      effectiveDateUsed: rule.effectiveDate,
      ...(leg ? { leg } : {}),
    });
  }

  // 3. Disbursements — fixed or estimated-range; excluded ones are omitted entirely.
  const disbursementRules = ruleSet.disbursementRules.filter(
    (d) =>
      scopes.includes(d.transactionType) &&
      isInDate(d.effectiveDate, d.expiryDate, asOfDate) &&
      d.approvalStatus === 'approved' &&
      d.amountType !== 'excluded' &&
      (d.conditionalTriggerExpression === null || answers.flags[d.conditionalTriggerExpression] === true)
  );
  for (const rule of disbursementRules) {
    const amount = rule.amountType === 'fixed' ? rule.amount ?? 0 : (rule.minAmount ?? 0 + (rule.maxAmount ?? 0)) / 2;
    const leg = legForScope(answers.transactionType, rule.transactionType);
    const legSuffix = leg ? ` (${leg})` : '';
    const lineItem = makeLineItem(
      rule.chargeName + legSuffix,
      'disbursement',
      amount,
      rule.vatTreatment,
      rule.amountType === 'estimated_range',
      rule.amountType === 'fixed',
      rule.clientFacingExplanation,
      vatRate
    );
    if (leg) lineItem.leg = leg;
    lineItems.push(lineItem);
    audit.push({
      step: 'disbursement_applied',
      detail: `${rule.chargeName} (${rule.amountType}).`,
      ruleId: rule.disbursementId,
      effectiveDateUsed: rule.effectiveDate,
      ...(leg ? { leg } : {}),
    });
  }

  // 4. SDLT/LTT — optional, calculated separately, never merged silently into the fee total.
  let sdltEstimate: number | null = null;
  if (options.sdltBands && options.jurisdiction) {
    // SDLT/LTT is a tax on the property being acquired, so for sale_and_purchase
    // only the purchase leg is taxed — the sale leg never feeds this calculation.
    const sdltValue = answers.transactionType === 'sale_and_purchase' ? answers.purchasePropertyValue! : answers.propertyValue!;
    const result = calculateIndicativeTax(sdltValue, options.jurisdiction, options.sdltBands, asOfDate);
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
  transactionType: TransactionType,
  value: number,
  asOfDate: string
): FeeValueBand | null {
  const candidates = bands.filter(
    (b) =>
      b.firmId === firmId &&
      b.transactionType === transactionType &&
      b.approvalStatus === 'approved' &&
      isInDate(b.effectiveDate, b.expiryDate, asOfDate)
  );

  for (const band of candidates) {
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

// Matches a base-fee value band + fee rule for one value, building the
// resulting LineItem/audit entry — used once per (non sale_and_purchase)
// transaction, or once per leg for sale_and_purchase (see caller).
function computeBaseFee(
  ruleSet: FirmRuleSet,
  transactionType: TransactionType,
  value: number,
  asOfDate: string,
  vatRate: number,
  leg?: PropertyLeg
): { lineItem: LineItem; matchedAudit: CalculationAuditEntry } | null {
  const band = selectValueBand(ruleSet.feeValueBands, ruleSet.firm.firmId, transactionType, value, asOfDate);
  if (!band) return null;

  const baseFeeRule = ruleSet.feeRules.find(
    (r) =>
      r.chargeType === 'base_fee' &&
      r.transactionType === transactionType &&
      isInDate(r.effectiveDate, r.expiryDate, asOfDate) &&
      r.approvalStatus === 'approved'
  );

  const legSuffix = leg ? ` (${leg})` : '';
  const lineItem = makeLineItem(
    (baseFeeRule?.chargeName ?? 'Legal fee') + legSuffix,
    'legal_fee',
    band.baseFee,
    baseFeeRule?.vatTreatment ?? 'standard',
    baseFeeRule?.isEstimated ?? false,
    baseFeeRule?.isGuaranteed ?? true,
    baseFeeRule?.clientFacingExplanation ?? 'Base conveyancing fee for this transaction type and property value.',
    vatRate
  );
  if (leg) lineItem.leg = leg;

  const matchedAudit: CalculationAuditEntry = {
    step: 'base_fee_lookup',
    detail: `Matched value band £${band.valueMin}–${band.valueMax ?? '∞'} (${band.boundaryRule}).`,
    ruleId: band.bandId,
    effectiveDateUsed: band.effectiveDate,
  };
  if (leg) matchedAudit.leg = leg;

  return { lineItem, matchedAudit };
}

// Only meaningful for sale_and_purchase, where a rule's own transactionType
// (purchase-scoped or sale-scoped) tells us which leg it belongs to.
function legForScope(answersTransactionType: TransactionType, ruleTransactionType: TransactionType): PropertyLeg | undefined {
  if (answersTransactionType !== 'sale_and_purchase') return undefined;
  if (ruleTransactionType === 'sale') return 'sale';
  if (ruleTransactionType === 'purchase') return 'purchase';
  return undefined;
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
