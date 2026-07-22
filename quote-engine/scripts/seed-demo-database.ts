// Five Star Conveyancing — DEMO database seed
// Populates two clearly fictional, APPROVED firms so the actual running
// site can be demonstrated end-to-end. This is not real data and this
// script must never point at five_star_data or any real database. Approving
// fictional demo fixtures is fine — the segregation-of-duties control
// exists to protect real commercial decisions, not to gatekeep test data.

// NOT IDEMPOTENT for fee/disbursement rows (same caveat as
// import-ackroyd-legal.ts): the firm and admin-user setup steps check for
// an existing row first, but the fee_rules/fee_value_bands/disbursement_rules
// creates do not. Re-running this against a database that already has demo
// data creates duplicates. Safe pattern: drop and recreate the demo schema,
// then run this once.

import { createDb } from '../src/db/client.js';
import { createFeeValueBandDraft, approveFeeValueBand, submitFeeValueBandForReview } from '../src/admin/feeValueBandAdmin.js';
import { createFeeRuleDraft, approveFeeRule, submitFeeRuleForReview } from '../src/admin/feeRuleAdmin.js';
import { createDisbursementRuleDraft, approveDisbursementRule, submitDisbursementRuleForReview } from '../src/admin/disbursementRuleAdmin.js';
import { provisionAdminUser, beginMfaEnrollment, confirmMfaEnrollment } from '../src/auth/provisioning.js';
import { TOTP, Secret } from 'otpauth';
import type { AdminUser } from '../src/types.js';

// Demo credentials — genuinely usable for logging into the running app
// locally, not secrets worth protecting (this is fictional demo data).
// Never reuse these anywhere real.
const DEMO_AUTHOR_PASSWORD = 'DemoAuthor2026Password';
const DEMO_REVIEWER_PASSWORD = 'DemoReviewer2026Password';

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString || !connectionString.includes('five_star_demo')) {
    throw new Error('Refusing to run: DATABASE_URL must point at five_star_demo. This script writes fictional data and must never touch a real database.');
  }
  const db = createDb(connectionString);

  let author: AdminUser;
  let reviewer: AdminUser;
  const existingAuthor = await db.selectFrom('admin_users').selectAll().where('email', '=', 'demo-author@fixture.test').executeTakeFirst();
  author = existingAuthor
    ? { userId: existingAuthor.user_id, name: existingAuthor.name, email: existingAuthor.email, role: existingAuthor.role }
    : await provisionAdminUser(db, { name: 'Demo Author', email: 'demo-author@fixture.test', role: 'fee_administrator', password: DEMO_AUTHOR_PASSWORD });
  // Demo Author has no MFA enrolled — demonstrates the "MFA not yet set up" state.

  const existingReviewer = await db.selectFrom('admin_users').selectAll().where('email', '=', 'demo-reviewer@fixture.test').executeTakeFirst();
  let reviewerMfaSecret: string;
  if (existingReviewer) {
    reviewer = { userId: existingReviewer.user_id, name: existingReviewer.name, email: existingReviewer.email, role: existingReviewer.role };
    reviewerMfaSecret = existingReviewer.mfa_secret ?? '';
  } else {
    reviewer = await provisionAdminUser(db, { name: 'Demo Reviewer', email: 'demo-reviewer@fixture.test', role: 'compliance_reviewer', password: DEMO_REVIEWER_PASSWORD });
    // Demo Reviewer has MFA fully enrolled, so the complete password + TOTP
    // flow can be demonstrated and tested end to end, not just the
    // password-only path.
    const enrollment = await beginMfaEnrollment(db, reviewer.userId);
    reviewerMfaSecret = enrollment.secret;
    const totp = new TOTP({ secret: Secret.fromBase32(enrollment.secret), algorithm: 'SHA1', digits: 6, period: 30 });
    await confirmMfaEnrollment(db, reviewer.userId, totp.generate());
  }

  console.log('Demo credentials (fictional, safe to share, never reuse for anything real):');
  console.log(`  Demo Author     — demo-author@fixture.test / ${DEMO_AUTHOR_PASSWORD} (no MFA)`);
  console.log(`  Demo Reviewer   — demo-reviewer@fixture.test / ${DEMO_REVIEWER_PASSWORD} (MFA enrolled)`);
  if (reviewerMfaSecret) console.log(`  Demo Reviewer MFA secret (base32, for an authenticator app): ${reviewerMfaSecret}`);

  const firms = [
    { name: 'Meridian Property Law (DEMO)', sra: '111111', baseFee: 850, leaseholdSupp: 150 },
    { name: 'Northgate Conveyancing (DEMO)', sra: '222222', baseFee: 950, leaseholdSupp: 175 },
  ];

  for (const f of firms) {
    const existingFirm = await db.selectFrom('firms').selectAll().where('sra_number', '=', f.sra).executeTakeFirst();
    const firmId = existingFirm?.firm_id ?? (await db.insertInto('firms').values({ legal_entity_name: f.name, sra_number: f.sra, status: 'active', quote_validity_days: 30 }).returning('firm_id').executeTakeFirstOrThrow()).firm_id;

    const acceptsAlready = await db.selectFrom('firm_transaction_types').selectAll().where('firm_id', '=', firmId).where('transaction_type', '=', 'purchase').executeTakeFirst();
    if (!acceptsAlready) {
      await db.insertInto('firm_transaction_types').values({ firm_id: firmId, transaction_type: 'purchase', accepted: true }).execute();
    }

    const band = await createFeeValueBandDraft(db, author, {
      firmId, transactionType: 'purchase', valueMin: 0, valueMax: null, boundaryRule: 'inclusive_upper',
      baseFee: f.baseFee, effectiveDate: '2026-01-01', expiryDate: null,
    });
    await submitFeeValueBandForReview(db, author, band.bandId);
    await approveFeeValueBand(db, reviewer, band.bandId);

    const baseFeeRule = await createFeeRuleDraft(db, author, {
      firmId, transactionType: 'purchase', chargeName: 'Legal fee', chargeType: 'base_fee', triggerKey: null,
      calculationType: 'fixed', amount: null, minAmount: null, maxAmount: null, formulaExpression: null,
      vatTreatment: 'standard', isGuaranteed: true, isEstimated: false, effectiveDate: '2026-01-01', expiryDate: null,
      displayOrder: 1, clientFacingExplanation: 'Base conveyancing legal fee. (Demo data.)',
    });
    await submitFeeRuleForReview(db, author, baseFeeRule.feeRuleId);
    await approveFeeRule(db, reviewer, baseFeeRule.feeRuleId);

    const leaseholdRule = await createFeeRuleDraft(db, author, {
      firmId, transactionType: 'purchase', chargeName: 'Leasehold supplement', chargeType: 'supplement', triggerKey: 'leasehold',
      calculationType: 'fixed', amount: f.leaseholdSupp, minAmount: null, maxAmount: null, formulaExpression: null,
      vatTreatment: 'standard', isGuaranteed: true, isEstimated: false, effectiveDate: '2026-01-01', expiryDate: null,
      displayOrder: 2, clientFacingExplanation: 'Additional work reviewing lease terms. (Demo data.)',
    });
    await submitFeeRuleForReview(db, author, leaseholdRule.feeRuleId);
    await approveFeeRule(db, reviewer, leaseholdRule.feeRuleId);

    const searchDisb = await createDisbursementRuleDraft(db, author, {
      firmId, transactionType: 'purchase', chargeName: 'Search pack', category: 'search', amountType: 'fixed',
      amount: 280, minAmount: null, maxAmount: null, vatTreatment: 'exempt', conditionalTriggerExpression: null,
      effectiveDate: '2026-01-01', expiryDate: null, displayOrder: 1, clientFacingExplanation: 'Local authority, water and environmental searches. (Demo data.)',
    });
    await submitDisbursementRuleForReview(db, author, searchDisb.disbursementId);
    await approveDisbursementRule(db, reviewer, searchDisb.disbursementId);

    console.log(`Seeded and approved: ${f.name}`);
  }

  // One deliberately pending item, left unapproved on purpose, so the admin
  // review queue (Module 8) has something real to display and act on.
  const firstFirm = await db.selectFrom('firms').selectAll().where('sra_number', '=', firms[0].sra).executeTakeFirstOrThrow();
  const pendingRule = await createFeeRuleDraft(db, author, {
    firmId: firstFirm.firm_id, transactionType: 'purchase', chargeName: 'Building Safety Act supplement',
    chargeType: 'supplement', triggerKey: 'buildingSafetyAct', calculationType: 'fixed', amount: 250,
    minAmount: null, maxAmount: null, formulaExpression: null, vatTreatment: 'standard', isGuaranteed: true,
    isEstimated: false, effectiveDate: '2026-01-01', expiryDate: null, displayOrder: 3,
    clientFacingExplanation: 'Additional work relating to Building Safety Act requirements. (Demo data.)',
  });
  await submitFeeRuleForReview(db, author, pendingRule.feeRuleId);
  console.log(`Seeded a pending (not yet approved) fee rule: ${pendingRule.feeRuleId}`);

  await db.destroy();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
