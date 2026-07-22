// Five Star Conveyancing — real-data import: Ackroyd Legal
//
// Source: Ackroyd_Legal_Fee_Scale (1).xlsx, supplied by the client 2026-07-22.
// Every commercial figure below is transcribed from that document — nothing
// is invented. Value-band thresholds are treated as inclusive upper bounds
// per the confirmed interpretation; the referral fee column is deliberately
// ignored per instruction ("ignore referral fee please") — clients are
// quoted the Solicitor Legal Fee only.
//
// Everything this script creates lands in 'draft' status. Nothing here is
// usable by the quote engine (which only reads approval_status = 'approved')
// until a compliance reviewer — a different person from whoever runs this
// import — reviews and approves it through the normal workflow.
//
// NOT LOADED, pending clarification (see the accompanying summary):
//   - "Concessionary" purchase supplement (£50) — meaning unconfirmed.
//   - Three inconsistent "L&C fee" reduction footnotes (£25 / £40 / £50) —
//     unclear what base amount they discount, and possibly unrelated to
//     Five Star at all (may reference a mortgage broker, not us).
//   - Purchase/Sale £2,000,000+ bands — "0.1 Percent" is a formula, which
//     fee_value_bands doesn't support; left unbanded so the engine's
//     existing "no band matched" fallback handles it instead.
//
// VAT treatment: the source sheet doesn't state VAT treatment per item at
// all (only "Fee (Exc. VAT)" as a header). Every supplement and disbursement
// below defaults to 'standard' as the most common real-world treatment —
// flagged explicitly in each row's client_facing_explanation as an
// assumption pending firm confirmation. The base legal fee is 'standard'
// with high confidence (solicitors' fees are standard-rated VAT in the UK).

// NOT IDEMPOTENT: the firm and admin-user setup steps check for an existing
// row first, but every fee_rules/fee_value_bands/disbursement_rules create
// below does not. Running this script twice against the same database will
// create a second full set of duplicate draft rows, not update the first.
// Safe to run once per database; re-running requires manually clearing the
// previous draft rows first (or extending this script with the same
// existence check used for firms/admin_users, if repeat imports become a
// real need).

import { createDb } from '../src/db/client.js';
import { provisionAdminUser } from '../src/auth/provisioning.js';
import { randomBytes } from 'node:crypto';
import { createFeeValueBandDraft } from '../src/admin/feeValueBandAdmin.js';
import { createFeeRuleDraft } from '../src/admin/feeRuleAdmin.js';
import { createDisbursementRuleDraft } from '../src/admin/disbursementRuleAdmin.js';
import type { AdminUser, TransactionType } from '../src/types.js';

const VAT_ASSUMPTION_NOTE =
  ' [VAT treatment assumed standard — the source fee scale did not state VAT treatment per item; please confirm before approving.]';

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

  for (const t of ['purchase', 'sale', 'remortgage'] as TransactionType[]) {
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
  // A system-only account: it's provisioned with a random password nobody
  // is given, since this script uses it via direct service-layer calls,
  // never the web login. Not the same thing as "no password" — the column
  // is still not-null and still hashed, it's just not a credential anyone
  // holds. If this account ever needs to log in through the UI, provision
  // it properly with provisionAdminUser and a real, given password instead.
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

  const EFFECTIVE_DATE = '2026-07-22';
  let created = 0;

  async function importValueBands(transactionType: TransactionType, chargeName: string, bands: { valueMin: number; valueMax: number | null; baseFee: number }[]) {
    await createFeeRuleDraft(db, importUser, {
      firmId,
      transactionType,
      chargeName,
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
      effectiveDate: EFFECTIVE_DATE,
      expiryDate: null,
      displayOrder: 1,
      clientFacingExplanation: 'Base conveyancing legal fee, tiered by property value.',
    });
    created++;

    for (const band of bands) {
      await createFeeValueBandDraft(db, importUser, {
        firmId,
        transactionType,
        valueMin: band.valueMin,
        valueMax: band.valueMax,
        boundaryRule: 'inclusive_upper',
        baseFee: band.baseFee,
        effectiveDate: EFFECTIVE_DATE,
        expiryDate: null,
      });
      created++;
    }
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
      displayOrder: 1,
      clientFacingExplanation: explanation + VAT_ASSUMPTION_NOTE,
    });
    created++;
  }

  async function importDisbursement(transactionType: TransactionType, chargeName: string, category: string, amount: number, explanation: string) {
    await createDisbursementRuleDraft(db, importUser, {
      firmId,
      transactionType,
      chargeName,
      category,
      amountType: 'fixed',
      amount,
      minAmount: null,
      maxAmount: null,
      vatTreatment: 'standard',
      conditionalTriggerExpression: null,
      effectiveDate: EFFECTIVE_DATE,
      expiryDate: null,
      displayOrder: 1,
      clientFacingExplanation: explanation + VAT_ASSUMPTION_NOTE,
    });
    created++;
  }

  // --- Purchase: value bands (Solicitor Legal Fee column; referral fee ignored per instruction) ---
  await importValueBands('purchase', 'Legal fee', [
    { valueMin: 0, valueMax: 125_000, baseFee: 1_000 },
    { valueMin: 125_000, valueMax: 250_000, baseFee: 1_000 },
    { valueMin: 250_000, valueMax: 325_000, baseFee: 1_200 },
    { valueMin: 325_000, valueMax: 400_000, baseFee: 1_300 },
    { valueMin: 400_000, valueMax: 500_000, baseFee: 1_350 },
    { valueMin: 500_000, valueMax: 750_000, baseFee: 1_500 },
    { valueMin: 750_000, valueMax: 1_000_000, baseFee: 1_750 },
    { valueMin: 1_000_000, valueMax: 1_250_000, baseFee: 1_750 },
    { valueMin: 1_250_000, valueMax: 1_500_000, baseFee: 2_000 },
    { valueMin: 1_500_000, valueMax: 1_750_000, baseFee: 2_500 },
    { valueMin: 1_750_000, valueMax: 2_000_000, baseFee: 2_750 },
    // No band above £2,000,000 — source gives "0.1 Percent" (a formula, unsupported); falls through to "excluded, no published fee".
  ]);

  // --- Sale: value bands ---
  await importValueBands('sale', 'Legal fee', [
    { valueMin: 0, valueMax: 125_000, baseFee: 1_000 },
    { valueMin: 125_000, valueMax: 250_000, baseFee: 1_000 },
    { valueMin: 250_000, valueMax: 325_000, baseFee: 1_000 },
    { valueMin: 325_000, valueMax: 400_000, baseFee: 1_000 },
    { valueMin: 400_000, valueMax: 500_000, baseFee: 1_150 },
    { valueMin: 500_000, valueMax: 750_000, baseFee: 1_250 },
    { valueMin: 750_000, valueMax: 1_000_000, baseFee: 1_350 },
    { valueMin: 1_000_000, valueMax: 1_250_000, baseFee: 1_350 },
    { valueMin: 1_250_000, valueMax: 1_500_000, baseFee: 1_400 },
    { valueMin: 1_500_000, valueMax: 1_750_000, baseFee: 1_500 },
    { valueMin: 1_750_000, valueMax: 2_000_000, baseFee: 1_600 },
    // No band above £2,000,000 — same formula issue as Purchase.
  ]);

  // --- Remortgage: value bands (the £2m+ row gives a real fixed figure, so it's included as an open-ended top band) ---
  await importValueBands('remortgage', 'Legal fee', [
    { valueMin: 0, valueMax: 125_000, baseFee: 750 },
    { valueMin: 125_000, valueMax: 250_000, baseFee: 750 },
    { valueMin: 250_000, valueMax: 325_000, baseFee: 750 },
    { valueMin: 325_000, valueMax: 400_000, baseFee: 750 },
    { valueMin: 400_000, valueMax: 500_000, baseFee: 750 },
    { valueMin: 500_000, valueMax: 750_000, baseFee: 750 },
    { valueMin: 750_000, valueMax: 1_000_000, baseFee: 850 },
    { valueMin: 1_000_000, valueMax: 1_250_000, baseFee: 1_000 },
    { valueMin: 1_250_000, valueMax: 1_500_000, baseFee: 1_000 },
    { valueMin: 1_500_000, valueMax: 1_750_000, baseFee: 1_200 },
    { valueMin: 1_750_000, valueMax: 2_000_000, baseFee: 1_500 },
    { valueMin: 2_000_000, valueMax: null, baseFee: 1_500 }, // source gives a real fixed figure here, unlike Purchase/Sale's formula row
  ]);

  // --- Purchase supplements ---
  await importSupplement('purchase', 'Islamic finance', 'islamicFinance', 750, 'Additional work for Sharia-compliant (Islamic) finance arrangements.');
  await importSupplement('purchase', 'Buy-to-let', 'buyToLet', 150, 'Additional work for a buy-to-let purchase.');
  await importSupplement('purchase', 'Building Safety Act', 'buildingSafetyAct', 250, 'Additional work relating to Building Safety Act requirements (relevant to some higher-risk residential buildings).');
  await importSupplement('purchase', 'Leasehold', 'leasehold', 150, 'Additional work reviewing lease terms and service charge accounts.');
  await importSupplement('purchase', 'Gifted deposit — UK donor', 'giftedDepositUK', 150, 'Additional work verifying a gifted deposit from a UK-based donor.');
  await importSupplement('purchase', 'Gifted deposit — overseas donor', 'giftedDepositOverseas', 250, 'Additional work verifying a gifted deposit from an overseas donor.');
  await importSupplement('purchase', 'Help to Buy', 'helpToBuy', 150, 'Additional work for a Help to Buy purchase (Equity Loan or ISA — priced at the ISA rate per client instruction; Equity Loan cases were priced higher (£250) in the source data, flagged in case this needs revisiting).');
  await importSupplement('purchase', 'Mortgage redemption', 'mortgageRedemption', 150, 'Additional work redeeming an existing mortgage as part of the purchase.');
  await importSupplement('purchase', 'Right to Buy', 'rightToBuy', 150, 'Additional work for a Right to Buy purchase.');
  await importSupplement('purchase', 'SDLT return filing', 'sdltReturn', 50, 'Fee for preparing and filing the Stamp Duty Land Tax return (separate from the tax itself).');
  await importSupplement('purchase', 'Shared ownership', 'sharedOwnership', 350, 'Additional work for a shared ownership purchase.');
  await importSupplement('purchase', 'Unregistered title', 'unregisteredTitle', 850, 'Additional work where the property title is not yet registered with HM Land Registry.');
  // "Concessionary" (£50) deliberately NOT imported — meaning unconfirmed.

  // --- Sale supplements ---
  await importSupplement('sale', 'Islamic finance', 'islamicFinance', 750, 'Additional work for Sharia-compliant (Islamic) finance arrangements.');
  await importSupplement('sale', 'Help to Buy (Equity Loan repayment)', 'helpToBuy', 250, 'Additional work repaying a Help to Buy Equity Loan as part of the sale.');
  await importSupplement('sale', 'Building Safety Act', 'buildingSafetyAct', 250, 'Additional work relating to Building Safety Act requirements.');
  await importSupplement('sale', 'Leasehold', 'leasehold', 150, 'Additional work reviewing lease terms and service charge accounts.');
  await importSupplement('sale', 'Mortgage redemption', 'mortgageRedemption', 100, 'Additional work redeeming an existing mortgage as part of the sale.');
  await importSupplement('sale', 'Shared ownership', 'sharedOwnership', 350, 'Additional work for a shared ownership sale.');
  await importSupplement('sale', 'Unregistered title', 'unregisteredTitle', 750, 'Additional work where the property title is not yet registered with HM Land Registry.');

  // --- Purchase disbursements ---
  await importDisbursement('purchase', 'CHAPS fee', 'bank_transfer', 50, 'Bank charge for same-day (CHAPS) transfer of funds.');
  await importDisbursement('purchase', 'ID check', 'id_check', 20, 'Electronic identity verification (priced per person in the source data; this system does not yet scale per-person, so it is loaded as a flat figure — flagged for review).');
  await importDisbursement('purchase', 'Completion searches', 'search', 10, 'Pre-completion search updates.');
  await importDisbursement('purchase', 'Post-completion fees', 'other', 150, 'Administrative work after completion (e.g. registration submission).');
  await importDisbursement('purchase', 'Search pack', 'search', 299, 'Local authority, water, and environmental searches.');
  await importDisbursement('purchase', 'Bank transfer fee', 'bank_transfer', 50, 'Bank charge for transferring funds.');
  // Note: no HM Land Registry registration fee is itemised anywhere in the source sheet — worth confirming whether it's bundled into another line or genuinely charged separately.

  // --- Sale disbursements ---
  await importDisbursement('sale', 'CHAPS fee', 'bank_transfer', 50, 'Bank charge for same-day (CHAPS) transfer of funds.');
  await importDisbursement('sale', 'ID check', 'id_check', 20, 'Electronic identity verification (priced per person in the source data; loaded as a flat figure — flagged for review).');
  await importDisbursement('sale', 'Completion searches', 'search', 10, 'Pre-completion search updates.');
  await importDisbursement('sale', 'Post-completion fees', 'other', 150, 'Administrative work after completion.');
  await importDisbursement('sale', 'Bank transfer fee', 'bank_transfer', 50, 'Bank charge for transferring funds.');

  console.log(`Import complete. ${created} draft records created for Ackroyd Legal (firm_id=${firmId}).`);
  console.log('All records are in draft status — none are usable by the quote engine until a compliance reviewer approves them.');

  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
