// Five Star Conveyancing — repository layer
// Translates between the snake_case database rows (db/schema.ts) and the
// camelCase domain types the calculation engine works with (../types.ts).
// Filtering by approval_status and effective/expiry dates is deliberately
// left to the calculation engine (it already does this per rule), so the
// repository's job is simply: fetch everything currently on file for a firm
// and transaction type, and hand it over.

import type { Kysely, Selectable } from 'kysely';
import type { Database } from './schema.js';
import type {
  ClientAnswers,
  DisbursementRule,
  FeeRule,
  FeeValueBand,
  Firm,
  FirmRestriction,
  FirmRuleSet,
  FirmTransactionType,
  QuoteResult,
  TransactionType,
} from '../types.js';

function toDateOnlyString(value: Date | string): string {
  return typeof value === 'string' ? value : value.toISOString().slice(0, 10);
}

function toDateOnlyStringOrNull(value: Date | string | null): string | null {
  return value === null ? null : toDateOnlyString(value);
}

export async function loadFirmRuleSet(
  db: Kysely<Database>,
  firmId: string,
  transactionType: TransactionType
): Promise<FirmRuleSet | null> {
  const firmRow = await db.selectFrom('firms').selectAll().where('firm_id', '=', firmId).executeTakeFirst();
  if (!firmRow) return null;

  const [transactionTypeRows, restrictionRows, bandRows, feeRuleRows, disbursementRows] = await Promise.all([
    db.selectFrom('firm_transaction_types').selectAll().where('firm_id', '=', firmId).execute(),
    db
      .selectFrom('firm_restrictions')
      .selectAll()
      .where('firm_id', '=', firmId)
      .where('transaction_type', '=', transactionType)
      .execute(),
    db
      .selectFrom('fee_value_bands')
      .selectAll()
      .where('firm_id', '=', firmId)
      .where('transaction_type', '=', transactionType)
      .execute(),
    db
      .selectFrom('fee_rules')
      .selectAll()
      .where('firm_id', '=', firmId)
      .where('transaction_type', '=', transactionType)
      .execute(),
    db
      .selectFrom('disbursement_rules')
      .selectAll()
      .where('firm_id', '=', firmId)
      .where('transaction_type', '=', transactionType)
      .execute(),
  ]);

  return {
    firm: mapFirm(firmRow),
    transactionTypes: transactionTypeRows.map(mapFirmTransactionType),
    restrictions: restrictionRows.map(mapFirmRestriction),
    feeValueBands: bandRows.map(mapFeeValueBand),
    feeRules: feeRuleRows.map(mapFeeRule),
    disbursementRules: disbursementRows.map(mapDisbursementRule),
  };
}

/**
 * Loads rule sets for every active firm that accepts the given transaction
 * type — the query behind "generate a full comparison result set".
 */
export async function loadActiveFirmRuleSets(
  db: Kysely<Database>,
  transactionType: TransactionType
): Promise<FirmRuleSet[]> {
  const eligibleFirmRows = await db
    .selectFrom('firms')
    .innerJoin('firm_transaction_types', 'firm_transaction_types.firm_id', 'firms.firm_id')
    .selectAll('firms')
    .where('firms.status', '=', 'active')
    .where('firm_transaction_types.transaction_type', '=', transactionType)
    .where('firm_transaction_types.accepted', '=', true)
    .execute();

  const firmIds = eligibleFirmRows.map((f) => f.firm_id);
  if (firmIds.length === 0) return [];

  const [transactionTypeRows, restrictionRows, bandRows, feeRuleRows, disbursementRows] = await Promise.all([
    db.selectFrom('firm_transaction_types').selectAll().where('firm_id', 'in', firmIds).execute(),
    db
      .selectFrom('firm_restrictions')
      .selectAll()
      .where('firm_id', 'in', firmIds)
      .where('transaction_type', '=', transactionType)
      .execute(),
    db
      .selectFrom('fee_value_bands')
      .selectAll()
      .where('firm_id', 'in', firmIds)
      .where('transaction_type', '=', transactionType)
      .execute(),
    db
      .selectFrom('fee_rules')
      .selectAll()
      .where('firm_id', 'in', firmIds)
      .where('transaction_type', '=', transactionType)
      .execute(),
    db
      .selectFrom('disbursement_rules')
      .selectAll()
      .where('firm_id', 'in', firmIds)
      .where('transaction_type', '=', transactionType)
      .execute(),
  ]);

  return eligibleFirmRows.map((firmRow) => ({
    firm: mapFirm(firmRow),
    transactionTypes: transactionTypeRows.filter((r) => r.firm_id === firmRow.firm_id).map(mapFirmTransactionType),
    restrictions: restrictionRows.filter((r) => r.firm_id === firmRow.firm_id).map(mapFirmRestriction),
    feeValueBands: bandRows.filter((r) => r.firm_id === firmRow.firm_id).map(mapFeeValueBand),
    feeRules: feeRuleRows.filter((r) => r.firm_id === firmRow.firm_id).map(mapFeeRule),
    disbursementRules: disbursementRows.filter((r) => r.firm_id === firmRow.firm_id).map(mapDisbursementRule),
  }));
}

export async function saveQuote(
  db: Kysely<Database>,
  params: { quoteReference: string; transactionType: TransactionType; clientAnswers: ClientAnswers; expiryAt: Date }
): Promise<string> {
  const row = await db
    .insertInto('quotes')
    .values({
      quote_reference: params.quoteReference,
      transaction_type: params.transactionType,
      client_answers: JSON.stringify(params.clientAnswers),
      expiry_at: params.expiryAt,
      status: 'active',
    })
    .returning('quote_id')
    .executeTakeFirstOrThrow();
  return row.quote_id;
}

export async function saveQuoteResults(db: Kysely<Database>, quoteId: string, results: QuoteResult[]): Promise<void> {
  if (results.length === 0) return;
  await db
    .insertInto('quote_results')
    .values(
      results.map((r) => ({
        quote_id: quoteId,
        firm_id: r.firmId,
        eligibility_status: r.eligibilityStatus,
        exclusion_reason: r.exclusionReason,
        legal_fee_subtotal: r.eligibilityStatus === 'eligible' ? r.legalFeeSubtotal : null,
        vat_amount: r.eligibilityStatus === 'eligible' ? r.vatTotal : null,
        disbursements_total: r.eligibilityStatus === 'eligible' ? r.disbursementsTotal : null,
        sdlt_estimate: r.sdltEstimate,
        total_estimate: r.totalEstimate,
        calculation_audit: JSON.stringify(r.calculationAudit),
      }))
    )
    .execute();
}

export async function getQuoteByReference(
  db: Kysely<Database>,
  quoteReference: string
): Promise<{ quoteId: string; transactionType: TransactionType; clientAnswers: ClientAnswers; results: QuoteResult[] } | null> {
  const quoteRow = await db
    .selectFrom('quotes')
    .selectAll()
    .where('quote_reference', '=', quoteReference)
    .executeTakeFirst();
  if (!quoteRow) return null;

  const resultRows = await db.selectFrom('quote_results').selectAll().where('quote_id', '=', quoteRow.quote_id).execute();

  return {
    quoteId: quoteRow.quote_id,
    transactionType: quoteRow.transaction_type as TransactionType,
    clientAnswers: parseJsonColumn<ClientAnswers>(quoteRow.client_answers),
    results: resultRows.map((r) => ({
      firmId: r.firm_id,
      eligibilityStatus: r.eligibility_status,
      exclusionReason: r.exclusion_reason,
      lineItems: [], // line items aren't persisted individually in this schema — only totals + audit
      legalFeeSubtotal: r.legal_fee_subtotal ?? 0,
      vatTotal: r.vat_amount ?? 0,
      disbursementsTotal: r.disbursements_total ?? 0,
      sdltEstimate: r.sdlt_estimate,
      totalEstimate: r.total_estimate,
      calculationAudit: parseJsonColumn(r.calculation_audit),
    })),
  };
}

function parseJsonColumn<T>(value: unknown): T {
  return typeof value === 'string' ? (JSON.parse(value) as T) : (value as T);
}

// --- row -> domain mappers ---

function mapFirm(row: Selectable<Database['firms']>): Firm {
  return {
    firmId: row.firm_id,
    legalEntityName: row.legal_entity_name,
    status: row.status,
    quoteValidityDays: row.quote_validity_days,
  };
}

function mapFirmTransactionType(row: Selectable<Database['firm_transaction_types']>): FirmTransactionType {
  return {
    firmId: row.firm_id,
    transactionType: row.transaction_type as TransactionType,
    accepted: row.accepted,
  };
}

function mapFirmRestriction(row: Selectable<Database['firm_restrictions']>): FirmRestriction {
  return {
    restrictionId: row.restriction_id,
    firmId: row.firm_id,
    transactionType: row.transaction_type as TransactionType,
    restrictionType: row.restriction_type,
    valueMin: row.value_min ?? undefined,
    valueMax: row.value_max ?? undefined,
    notes: row.notes ?? undefined,
  };
}

function mapFeeValueBand(row: Selectable<Database['fee_value_bands']>): FeeValueBand {
  return {
    bandId: row.band_id,
    firmId: row.firm_id,
    transactionType: row.transaction_type as TransactionType,
    valueMin: row.value_min,
    valueMax: row.value_max,
    boundaryRule: row.boundary_rule,
    baseFee: row.base_fee,
    effectiveDate: toDateOnlyString(row.effective_date),
    expiryDate: toDateOnlyStringOrNull(row.expiry_date),
    approvalStatus: row.approval_status,
  };
}

function mapFeeRule(row: Selectable<Database['fee_rules']>): FeeRule {
  return {
    feeRuleId: row.fee_rule_id,
    firmId: row.firm_id,
    transactionType: row.transaction_type as TransactionType,
    chargeName: row.charge_name,
    chargeType: row.charge_type,
    triggerKey: row.trigger_key,
    calculationType: row.calculation_type,
    amount: row.amount,
    minAmount: row.min_amount,
    maxAmount: row.max_amount,
    formulaExpression: row.formula_expression,
    vatTreatment: row.vat_treatment,
    isGuaranteed: row.is_guaranteed,
    isEstimated: row.is_estimated,
    effectiveDate: toDateOnlyString(row.effective_date),
    expiryDate: toDateOnlyStringOrNull(row.expiry_date),
    approvalStatus: row.approval_status,
    displayOrder: row.display_order,
    clientFacingExplanation: row.client_facing_explanation,
  };
}

function mapDisbursementRule(row: Selectable<Database['disbursement_rules']>): DisbursementRule {
  return {
    disbursementId: row.disbursement_id,
    firmId: row.firm_id,
    transactionType: row.transaction_type as TransactionType,
    chargeName: row.charge_name,
    category: row.category,
    amountType: row.amount_type,
    amount: row.amount,
    minAmount: row.min_amount,
    maxAmount: row.max_amount,
    vatTreatment: row.vat_treatment,
    conditionalTriggerExpression: row.conditional_trigger_expression,
    effectiveDate: toDateOnlyString(row.effective_date),
    expiryDate: toDateOnlyStringOrNull(row.expiry_date),
    approvalStatus: row.approval_status,
    displayOrder: row.display_order,
    clientFacingExplanation: row.client_facing_explanation,
  };
}
