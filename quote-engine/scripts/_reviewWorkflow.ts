// Five Star Conveyancing — shared submit/approve workflow for go-live scripts
//
// Extracted from the original Ackroyd-specific submit/approve scripts so
// the same submit-for-review / approve logic can run for any firm by SRA
// number, without duplicating the whole file three times. Behavior is
// identical to the original Ackroyd scripts — only the target firm varies.

import { createDb } from '../src/db/client.js';
import { provisionAdminUser } from '../src/auth/provisioning.js';
import { randomBytes } from 'node:crypto';
import { submitFeeRuleForReview, approveFeeRule } from '../src/admin/feeRuleAdmin.js';
import { submitFeeValueBandForReview, approveFeeValueBand } from '../src/admin/feeValueBandAdmin.js';
import { submitDisbursementRuleForReview, approveDisbursementRule } from '../src/admin/disbursementRuleAdmin.js';
import type { AdminUser } from '../src/types.js';
import { assertLooksLikeProductionDatabase } from './_dbSafety.js';

// Run as the same "Data Import" account that created the drafts
// (fee_administrator — cannot also approve, so this doesn't blur the
// segregation-of-duties line).
export async function submitFirmForReview(sraNumber: string, firmLabel: string): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  assertLooksLikeProductionDatabase(connectionString);
  const db = createDb(connectionString);

  const importUserRow = await db.selectFrom('admin_users').selectAll().where('email', '=', 'data-import@fivestarconveyancing.co.uk').executeTakeFirst();
  if (!importUserRow) throw new Error('Data Import user not found — run the import script first.');
  const importUser: AdminUser = { userId: importUserRow.user_id, name: importUserRow.name, email: importUserRow.email, role: importUserRow.role };

  const firm = await db.selectFrom('firms').selectAll().where('sra_number', '=', sraNumber).executeTakeFirst();
  if (!firm) throw new Error(`${firmLabel} firm record not found (SRA ${sraNumber}).`);

  const draftFeeRules = await db.selectFrom('fee_rules').select('fee_rule_id').where('firm_id', '=', firm.firm_id).where('approval_status', '=', 'draft').execute();
  const draftBands = await db.selectFrom('fee_value_bands').select('band_id').where('firm_id', '=', firm.firm_id).where('approval_status', '=', 'draft').execute();
  const draftDisbursements = await db.selectFrom('disbursement_rules').select('disbursement_id').where('firm_id', '=', firm.firm_id).where('approval_status', '=', 'draft').execute();

  for (const row of draftFeeRules) await submitFeeRuleForReview(db, importUser, row.fee_rule_id);
  for (const row of draftBands) await submitFeeValueBandForReview(db, importUser, row.band_id);
  for (const row of draftDisbursements) await submitDisbursementRuleForReview(db, importUser, row.disbursement_id);

  console.log(`Submitted for review (${firmLabel}): ${draftFeeRules.length} fee rules, ${draftBands.length} value bands, ${draftDisbursements.length} disbursements.`);
  console.log('All still require approval from a compliance_reviewer — a different person from whoever ran this — before they affect real quotes.');

  await db.destroy();
}

// This is the step that makes a firm's fee data live to real consumers.
// Run it only once someone has actually reviewed the figures — this
// function does not re-review data, it only performs the state transition
// once a human already has.
export async function approveFirmForReview(sraNumber: string, firmLabel: string): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  assertLooksLikeProductionDatabase(connectionString);
  const db = createDb(connectionString);

  const firm = await db.selectFrom('firms').selectAll().where('sra_number', '=', sraNumber).executeTakeFirst();
  if (!firm) throw new Error(`${firmLabel} firm record not found (SRA ${sraNumber}).`);

  const existingReviewer = await db.selectFrom('admin_users').selectAll().where('email', '=', 'compliance-reviewer@fivestarconveyancing.co.uk').executeTakeFirst();
  const reviewerId =
    existingReviewer?.user_id ??
    (
      await provisionAdminUser(db, {
        name: 'Compliance Reviewer',
        email: 'compliance-reviewer@fivestarconveyancing.co.uk',
        role: 'compliance_reviewer',
        password: randomBytes(24).toString('base64url'),
      })
    ).userId;
  const reviewer: AdminUser = { userId: reviewerId, name: 'Compliance Reviewer', email: 'compliance-reviewer@fivestarconveyancing.co.uk', role: 'compliance_reviewer' };

  const pendingFeeRules = await db.selectFrom('fee_rules').select('fee_rule_id').where('firm_id', '=', firm.firm_id).where('approval_status', '=', 'pending_review').execute();
  const pendingBands = await db.selectFrom('fee_value_bands').select('band_id').where('firm_id', '=', firm.firm_id).where('approval_status', '=', 'pending_review').execute();
  const pendingDisbursements = await db.selectFrom('disbursement_rules').select('disbursement_id').where('firm_id', '=', firm.firm_id).where('approval_status', '=', 'pending_review').execute();

  for (const row of pendingFeeRules) await approveFeeRule(db, reviewer, row.fee_rule_id);
  for (const row of pendingBands) await approveFeeValueBand(db, reviewer, row.band_id);
  for (const row of pendingDisbursements) await approveDisbursementRule(db, reviewer, row.disbursement_id);

  console.log(`Approved (${firmLabel}): ${pendingFeeRules.length} fee rules, ${pendingBands.length} value bands, ${pendingDisbursements.length} disbursements.`);
  console.log(`${firmLabel} is now live — real quotes will include this firm.`);

  await db.destroy();
}
