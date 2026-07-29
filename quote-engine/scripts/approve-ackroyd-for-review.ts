// Five Star Conveyancing — approve Ackroyd Legal's pending fee data
//
// Runs as a distinct 'compliance_reviewer' account (never the 'Data Import'
// account that created the drafts — approveFeeRule/approveFeeValueBand/
// approveDisbursementRule all refuse if last_modified_by === approver, so
// segregation of duties is enforced in code, not just by convention).
//
// This is the step that makes Ackroyd Legal's fee data live to real
// consumers. Run it only once someone has actually reviewed the figures —
// see the comment block at the top of import-ackroyd-legal.ts for the
// specific commercial confirmations already obtained from the client
// (flat fee across all six transaction types, supplement trigger
// conditions, disbursement scope). This script does not re-review that
// data; it only performs the state transition once a human already has.

import { createDb } from '../src/db/client.js';
import { provisionAdminUser } from '../src/auth/provisioning.js';
import { randomBytes } from 'node:crypto';
import { approveFeeRule } from '../src/admin/feeRuleAdmin.js';
import { approveFeeValueBand } from '../src/admin/feeValueBandAdmin.js';
import { approveDisbursementRule } from '../src/admin/disbursementRuleAdmin.js';
import type { AdminUser } from '../src/types.js';
import { assertLooksLikeProductionDatabase } from './_dbSafety.js';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  assertLooksLikeProductionDatabase(connectionString);
  const db = createDb(connectionString);

  const ackroyd = await db.selectFrom('firms').selectAll().where('sra_number', '=', '554585').executeTakeFirst();
  if (!ackroyd) throw new Error('Ackroyd Legal firm record not found — run import-ackroyd-legal.ts first.');

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

  const pendingFeeRules = await db.selectFrom('fee_rules').select('fee_rule_id').where('firm_id', '=', ackroyd.firm_id).where('approval_status', '=', 'pending_review').execute();
  const pendingBands = await db.selectFrom('fee_value_bands').select('band_id').where('firm_id', '=', ackroyd.firm_id).where('approval_status', '=', 'pending_review').execute();
  const pendingDisbursements = await db.selectFrom('disbursement_rules').select('disbursement_id').where('firm_id', '=', ackroyd.firm_id).where('approval_status', '=', 'pending_review').execute();

  for (const row of pendingFeeRules) await approveFeeRule(db, reviewer, row.fee_rule_id);
  for (const row of pendingBands) await approveFeeValueBand(db, reviewer, row.band_id);
  for (const row of pendingDisbursements) await approveDisbursementRule(db, reviewer, row.disbursement_id);

  console.log(`Approved: ${pendingFeeRules.length} fee rules, ${pendingBands.length} value bands, ${pendingDisbursements.length} disbursements.`);
  console.log('Ackroyd Legal is now live — real quotes will include this firm.');

  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
