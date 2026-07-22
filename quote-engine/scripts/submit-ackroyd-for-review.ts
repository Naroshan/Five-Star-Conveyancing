// Five Star Conveyancing — submit Ackroyd Legal's draft data for review
//
// import-ackroyd-legal.ts deliberately only creates drafts — submitting for
// review is a separate, deliberate act (so whoever entered the data gets a
// chance to check it first). This script performs that second step for
// every currently-draft record belonging to Ackroyd Legal, so a compliance
// reviewer's queue actually has something to act on.
//
// Run as the same "Data Import" account that created the drafts (fee_administrator
// — cannot also approve, so this doesn't blur the segregation-of-duties line).

import { createDb } from '../src/db/client.js';
import { submitFeeRuleForReview } from '../src/admin/feeRuleAdmin.js';
import { submitFeeValueBandForReview } from '../src/admin/feeValueBandAdmin.js';
import { submitDisbursementRuleForReview } from '../src/admin/disbursementRuleAdmin.js';
import type { AdminUser } from '../src/types.js';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !connectionString.includes('five_star_data')) {
    throw new Error('Refusing to run: DATABASE_URL must point at five_star_data.');
  }
  const db = createDb(connectionString);

  const importUserRow = await db.selectFrom('admin_users').selectAll().where('email', '=', 'data-import@fivestarconveyancing.co.uk').executeTakeFirst();
  if (!importUserRow) throw new Error('Data Import user not found — run import-ackroyd-legal.ts first.');
  const importUser: AdminUser = { userId: importUserRow.user_id, name: importUserRow.name, email: importUserRow.email, role: importUserRow.role };

  const ackroyd = await db.selectFrom('firms').selectAll().where('sra_number', '=', '554585').executeTakeFirst();
  if (!ackroyd) throw new Error('Ackroyd Legal firm record not found.');

  const draftFeeRules = await db.selectFrom('fee_rules').select('fee_rule_id').where('firm_id', '=', ackroyd.firm_id).where('approval_status', '=', 'draft').execute();
  const draftBands = await db.selectFrom('fee_value_bands').select('band_id').where('firm_id', '=', ackroyd.firm_id).where('approval_status', '=', 'draft').execute();
  const draftDisbursements = await db.selectFrom('disbursement_rules').select('disbursement_id').where('firm_id', '=', ackroyd.firm_id).where('approval_status', '=', 'draft').execute();

  for (const row of draftFeeRules) await submitFeeRuleForReview(db, importUser, row.fee_rule_id);
  for (const row of draftBands) await submitFeeValueBandForReview(db, importUser, row.band_id);
  for (const row of draftDisbursements) await submitDisbursementRuleForReview(db, importUser, row.disbursement_id);

  console.log(`Submitted for review: ${draftFeeRules.length} fee rules, ${draftBands.length} value bands, ${draftDisbursements.length} disbursements.`);
  console.log('All still require approval from a compliance_reviewer — a different person from whoever ran this — before they affect real quotes.');

  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
