// Five Star Conveyancing — real-data import: Ackroyd Legal (SUPERSEDED)
//
// SUPERSEDED 2026-08-26 by scripts/import-5star-fee-scale.ts, which loads
// a newer, banded Purchase/Sale/Remortgage scale for this firm (confirmed
// with the client) and deletes the flat rows this script creates. Do not
// run this script again — kept only for history.
//
// Source: Fee_Scale_Perfect_Portal_Style.xlsx, supplied by the client
// 2026-07-28. This REPLACES the earlier banded Ackroyd Legal import (a
// different, more complex spreadsheet with per-property-value bands and
// several unresolved VAT/scope questions) — that data was never approved
// and never went live, so there is nothing to supersede in the database,
// only in git history. Confirmed with the client before writing this:
//   - This flat fee scale applies to all six transaction types.
//   - The four "Additional Fees" are conditional supplements: Leasehold
//     Supplement (leasehold properties only), Mortgage Administration Fee
//     (mortgage involved only), Building Safety Act Fee (that flag only),
//     Shared Ownership Supplement (that flag only).
//   - All nine disbursements apply to every transaction type.
//
// VAT treatment is stated explicitly per line in the source (Net / VAT /
// Total columns) — no assumption needed this time. Disbursements with £0
// VAT in the source are loaded as 'outside_scope' (genuine third-party
// pass-throughs — Land Registry, search providers, bank transfer); items
// with VAT charged are loaded as 'standard'. That standard/outside_scope
// split is Five Star's categorisation of what the source numbers imply,
// not a figure invented outside the source.
//
// Everything this script creates lands in 'draft' status. Nothing here is
// usable by the quote engine (which only reads approval_status = 'approved')
// until a compliance reviewer — a different person from whoever runs this
// import — reviews and approves it through the normal workflow.
//
// NOT IDEMPOTENT: the firm and admin-user setup steps check for an existing
// row first, but every fee_rules/fee_value_bands/disbursement_rules create
// below does not. Running this script twice against the same database will
// create a second full set of duplicate draft rows, not update the first.

import { createDb } from '../src/db/client.js';
import { provisionAdminUser } from '../src/auth/provisioning.js';
import { randomBytes } from 'node:crypto';
import { createFeeValueBandDraft } from '../src/admin/feeValueBandAdmin.js';
import { createFeeRuleDraft } from '../src/admin/feeRuleAdmin.js';
import { createDisbursementRuleDraft } from '../src/admin/disbursementRuleAdmin.js';
import type { AdminUser, TransactionType, VatTreatment } from '../src/types.js';

const TRANSACTION_TYPES: TransactionType[] = [
  'purchase',
  'sale',
  'sale_and_purchase',
  'remortgage',
  'transfer_of_equity',
  'lease_extension',
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('Set DATABASE_URL to the target database before running this import.');
  }
  const db = createDb(connectionString);

  // --- Firm record (directly confirmed data, not subject to the draft workflow) ---
  const existingFirm = await db.selectFrom('firms').selectAll().where('sra_number', '=', '554585').executeTakeFirst();
  const firmId =
    existingFirm?.firm_id ??
    (
      await db
        .insertInto('firms')
        .values({ legal_entity_name: 'Ackroyd Legal', sra_number: '554585', status: 'active', quote_validity_days: 30 })
        .returning('firm_id')
        .executeTakeFirstOrThrow()
    ).firm_id;

  for (const t of TRANSACTION_TYPES) {
    const exists = await db
      .selectFrom('firm_transaction_types')
      .selectAll()
      .where('firm_id', '=', firmId)
      .where('transaction_type', '=', t)
      .executeTakeFirst();
    if (!exists) {
      await db.insertInto('firm_transaction_types').values({ firm_id: firmId, transaction_type: t, accepted: true }).execute();
    }
  }

  // --- Import user (fee_administrator — cannot also approve; see roles.ts) ---
  // A system-only account: provisioned with a random password nobody is
  // given, since this script uses it via direct service-layer calls, never
  // the web login.
  const existingUser = await db.selectFrom('admin_users').selectAll().where('email', '=', 'data-import@fivestarconveyancing.co.uk').executeTakeFirst();
  const importUserId =
    existingUser?.user_id ??
    (
      await provisionAdminUser(db, {
        name: 'Data Import',
        email: 'data-import@fivestarconveyancing.co.uk',
        role: 'fee_administrator',
        password: randomBytes(24).toString('base64url'),
      })
    ).userId;
  const importUser: AdminUser = { userId: importUserId, name: 'Data Import', email: 'data-import@fivestarconveyancing.co.uk', role: 'fee_administrator' };

  const EFFECTIVE_DATE = '2026-07-28';
  let created = 0;

  async function importFlatBaseFee(transactionType: TransactionType) {
    await createFeeRuleDraft(db, importUser, {
      firmId,
      transactionType,
      chargeName: 'Legal Fee',
      chargeType: 'base_fee',
      triggerKey: null,
      calculationType: 'fixed',
      amount: 1000,
      minAmount: null,
      maxAmount: null,
      formulaExpression: null,
      vatTreatment: 'standard',
      isGuaranteed: true,
      isEstimated: false,
      effectiveDate: EFFECTIVE_DATE,
      expiryDate: null,
      displayOrder: 1,
      clientFacingExplanation: 'Flat legal fee, as published in Ackroyd Legal’s fee scale — does not vary by property value.',
    });
    created++;

    // Flat fee, no bands — still requires one open-ended band row, since
    // the calculation engine reads the base fee amount from the matched
    // fee_value_bands row, not from the fee_rules row above (which only
    // supplies display/VAT/explanation metadata).
    await createFeeValueBandDraft(db, importUser, {
      firmId,
      transactionType,
      valueMin: 0,
      valueMax: null,
      boundaryRule: 'inclusive_lower',
      baseFee: 1000,
      effectiveDate: EFFECTIVE_DATE,
      expiryDate: null,
    });
    created++;
  }

  async function importSupplement(transactionType: TransactionType, chargeName: string, triggerKey: string, amount: number, explanation: string) {
    await createFeeRuleDraft(db, importUser, {
      firmId,
      transactionType,
      chargeName,
      chargeType: 'supplement',
      triggerKey,
      calculationType: 'fixed',
      amount,
      minAmount: null,
      maxAmount: null,
      formulaExpression: null,
      vatTreatment: 'standard',
      isGuaranteed: true,
      isEstimated: false,
      effectiveDate: EFFECTIVE_DATE,
      expiryDate: null,
      displayOrder: 2,
      clientFacingExplanation: explanation,
    });
    created++;
  }

  async function importDisbursement(transactionType: TransactionType, chargeName: string, category: string, amount: number, vatTreatment: VatTreatment, explanation: string) {
    await createDisbursementRuleDraft(db, importUser, {
      firmId,
      transactionType,
      chargeName,
      category,
      amountType: 'fixed',
      amount,
      minAmount: null,
      maxAmount: null,
      vatTreatment,
      conditionalTriggerExpression: null,
      effectiveDate: EFFECTIVE_DATE,
      expiryDate: null,
      displayOrder: 1,
      clientFacingExplanation: explanation,
    });
    created++;
  }

  for (const t of TRANSACTION_TYPES) {
    await importFlatBaseFee(t);
    await importSupplement(t, 'Leasehold Supplement', 'leasehold', 150, 'Additional work reviewing lease terms and service charge accounts, for leasehold properties.');
    await importSupplement(t, 'Mortgage Administration Fee', 'mortgageInvolved', 100, 'Administrative work liaising with the mortgage lender, where a mortgage is involved.');
    await importSupplement(t, 'Building Safety Act Fee', 'buildingSafetyAct', 150, 'Additional work relating to Building Safety Act requirements (relevant to some higher-risk residential buildings).');
    await importSupplement(t, 'Shared Ownership Supplement', 'sharedOwnership', 150, 'Additional work for a shared ownership transaction.');

    await importDisbursement(t, 'Search Pack (Estimated)', 'search', 399, 'outside_scope', 'Local authority, water, and environmental searches — estimated figure, paid to the search provider.');
    await importDisbursement(t, 'Bankruptcy Searches', 'search', 8.8, 'outside_scope', 'Bankruptcy search against each party, paid to the search provider.');
    await importDisbursement(t, 'Land Registry Priority Search (OS1)', 'search', 8.8, 'outside_scope', 'HM Land Registry priority search protecting your position pending registration.');
    await importDisbursement(t, 'Lawyer Checker', 'other', 15, 'standard', 'Verification check on the other side’s solicitor, to guard against fraud.');
    await importDisbursement(t, 'Office Copies', 'search', 8.8, 'outside_scope', 'Official copies of the property’s title register and plan from HM Land Registry.');
    await importDisbursement(t, 'Land Registry Registration', 'other', 8.8, 'outside_scope', 'HM Land Registry fee to register the transaction.');
    await importDisbursement(t, 'ID Verification, Source of Funds & AML Checks', 'id_check', 20, 'standard', 'Electronic identity verification and anti-money-laundering checks.');
    await importDisbursement(t, 'Bank Transfer Fee (TT Fee)', 'bank_transfer', 60, 'outside_scope', 'Bank charge for transferring funds.');
    await importDisbursement(t, 'Case Management Fee', 'other', 15, 'standard', 'Fee for the case management system used to run the transaction.');
  }

  console.log(`Import complete. ${created} draft records created for Ackroyd Legal (firm_id=${firmId}), across ${TRANSACTION_TYPES.length} transaction types.`);
  console.log('All records are in draft status — none are usable by the quote engine until a compliance reviewer approves them.');

  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
