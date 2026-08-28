// Five Star Conveyancing — client-requested correction: merge Hutchins Law's
// and Ackroyd Legal's lowest seven property-value bands (imported by
// import-5star-fee-scale.ts as £0–£125k, £125k–£250k, £250k–£325k,
// £325k–£400k, £400k–£500k, £500k–£750k, £750k–£1,000,000) into a single
// flat band covering £0 up to £1,000,000, for purchase, sale, and
// remortgage. Bands above £1,000,000 are untouched.
//
// Client-specified new flat fees for that merged band:
//   - Hutchins Law (SRA 567465): £400
//   - Ackroyd Legal (SRA 554585): £500
//
// This does NOT touch supplements, disbursements, or bands above £1,000,000.
//
// Mechanics: creates one new fee_value_band draft per firm/transaction-type
// (£0–£1,000,000, flat fee), pushes it through the normal
// draft -> pending_review -> approved workflow (same segregation of duties
// as every other go-live script — a different admin approves from whoever
// submitted), then directly expires the seven superseded approved bands
// (each firm/transaction-type has more than one band to retire, so the
// single-band `supersedesBandId` field on fee_value_bands can't express
// this — same reasoning as the earlier direct-SQL retirement of Ackroyd's
// old flat scale in import-5star-fee-scale.ts). The `effective_date <
// EFFECTIVE_DATE` filter is what excludes the newly-approved band itself
// from being expired by the same statement.
//
// Usage: DATABASE_URL=<production> npx tsx scripts/merge-low-value-bands-hutchins-ackroyd.ts

import { createDb } from '../src/db/client.js';
import { createFeeValueBandDraft } from '../src/admin/feeValueBandAdmin.js';
import type { AdminUser, TransactionType } from '../src/types.js';
import { assertLooksLikeProductionDatabase } from './_dbSafety.js';
import { submitFirmForReview, approveFirmForReview } from './_reviewWorkflow.js';

const EFFECTIVE_DATE = '2026-08-28';
const MERGED_VALUE_MAX = 1_000_000;
const TRANSACTION_TYPES: TransactionType[] = ['purchase', 'sale', 'remortgage'];

const FIRMS = [
  { sraNumber: '567465', label: 'Hutchins Law', newFee: 400 },
  { sraNumber: '554585', label: 'Ackroyd Legal', newFee: 500 },
];

async function main() {
  const connectionString = process.env.DATABASE_URL;
  assertLooksLikeProductionDatabase(connectionString);
  const db = createDb(connectionString);

  const importUserRow = await db
    .selectFrom('admin_users')
    .selectAll()
    .where('email', '=', 'data-import@fivestarconveyancing.co.uk')
    .executeTakeFirst();
  if (!importUserRow) throw new Error('Data Import user not found — run import-5star-fee-scale.ts first.');
  const importUser: AdminUser = { userId: importUserRow.user_id, name: importUserRow.name, email: importUserRow.email, role: importUserRow.role };

  for (const firm of FIRMS) {
    const firmRow = await db.selectFrom('firms').selectAll().where('sra_number', '=', firm.sraNumber).executeTakeFirst();
    if (!firmRow) throw new Error(`${firm.label} firm record not found (SRA ${firm.sraNumber}).`);

    const existingDrafts = await db
      .selectFrom('fee_value_bands')
      .select('band_id')
      .where('firm_id', '=', firmRow.firm_id)
      .where('approval_status', 'in', ['draft', 'pending_review'])
      .execute();
    if (existingDrafts.length > 0) {
      throw new Error(
        `${firm.label} already has ${existingDrafts.length} fee_value_bands row(s) in draft/pending_review — resolve those first so this script's submit/approve step doesn't sweep up unrelated changes.`
      );
    }

    for (const transactionType of TRANSACTION_TYPES) {
      await createFeeValueBandDraft(db, importUser, {
        firmId: firmRow.firm_id,
        transactionType,
        valueMin: 0,
        valueMax: MERGED_VALUE_MAX,
        boundaryRule: 'inclusive_upper',
        baseFee: firm.newFee,
        effectiveDate: EFFECTIVE_DATE,
        expiryDate: null,
      });
    }
    console.log(`Created 3 draft bands (purchase/sale/remortgage) for ${firm.label} at £${firm.newFee} up to £${MERGED_VALUE_MAX.toLocaleString()}.`);
  }

  for (const firm of FIRMS) {
    await submitFirmForReview(firm.sraNumber, firm.label);
  }
  for (const firm of FIRMS) {
    await approveFirmForReview(firm.sraNumber, firm.label);
  }

  for (const firm of FIRMS) {
    const firmRow = await db.selectFrom('firms').selectAll().where('sra_number', '=', firm.sraNumber).executeTakeFirstOrThrow();
    for (const transactionType of TRANSACTION_TYPES) {
      const result = await db
        .updateTable('fee_value_bands')
        .set({ expiry_date: EFFECTIVE_DATE })
        .where('firm_id', '=', firmRow.firm_id)
        .where('transaction_type', '=', transactionType)
        .where('approval_status', '=', 'approved')
        .where('value_max', '<=', MERGED_VALUE_MAX)
        .where('effective_date', '<', new Date(EFFECTIVE_DATE))
        .where('expiry_date', 'is', null)
        .executeTakeFirst();
      console.log(`${firm.label} / ${transactionType}: expired ${result.numUpdatedRows} superseded band(s).`);
    }
  }

  console.log('Done. The merged £0–£1,000,000 band is now live for Hutchins Law and Ackroyd Legal (purchase/sale/remortgage).');
  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
