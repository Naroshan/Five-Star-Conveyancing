// Five Star Conveyancing — fee rule admin workflow integration tests
// Runs the full draft -> pending_review -> approved/rejected lifecycle
// against a real PostgreSQL database, including the segregation-of-duties
// rule and fee-rule supersession. Fictional fixture data only.

import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sql } from 'kysely';
import { createDb } from '../src/db/client.js';
import { ForbiddenError } from '../src/admin/roles.js';
import {
  InvalidStateError,
  approveFeeRule,
  createFeeRuleDraft,
  listPendingFeeRuleApprovals,
  getFeeRuleById,
  rejectFeeRule,
  submitFeeRuleForReview,
  updateFeeRuleDraft,
  type CreateFeeRuleInput,
} from '../src/admin/feeRuleAdmin.js';
import { listAuditLogForEntity } from '../src/admin/auditLog.js';
import type { AdminUser } from '../src/types.js';

const connectionString = process.env.DATABASE_URL;

const FIRM_ID = '11111111-1111-1111-1111-111111111111';

const feeAdmin: AdminUser = { userId: '', name: 'Fran Fee', email: 'fran@fixture.test', role: 'fee_administrator' };
const secondFeeAdmin: AdminUser = { userId: '', name: 'Priya Price', email: 'priya@fixture.test', role: 'fee_administrator' };
const complianceReviewer: AdminUser = { userId: '', name: 'Cal Compliance', email: 'cal@fixture.test', role: 'compliance_reviewer' };
const superAdmin: AdminUser = { userId: '', name: 'Sam Super', email: 'sam@fixture.test', role: 'super_admin' };
const reportingUser: AdminUser = { userId: '', name: 'Rita Reports', email: 'rita@fixture.test', role: 'reporting_user' };

function baseInput(overrides: Partial<CreateFeeRuleInput> = {}): CreateFeeRuleInput {
  return {
    firmId: FIRM_ID,
    transactionType: 'purchase',
    chargeName: 'Legal fee',
    chargeType: 'base_fee',
    triggerKey: null,
    calculationType: 'fixed',
    amount: 800,
    minAmount: null,
    maxAmount: null,
    formulaExpression: null,
    vatTreatment: 'standard',
    isGuaranteed: true,
    isEstimated: false,
    effectiveDate: '2025-01-01',
    expiryDate: null,
    displayOrder: 1,
    clientFacingExplanation: 'Base conveyancing fee.',
    ...overrides,
  };
}

if (connectionString) {
  describe('fee rule admin workflow (integration, real Postgres)', () => {
    const db = createDb(connectionString);

    afterAll(async () => {
      await db.destroy();
    });

    beforeEach(async () => {
      await sql`truncate table audit_log, quote_results, quotes, disbursement_rules, fee_rules, fee_value_bands, firm_restrictions, admin_users, firm_transaction_types, firms restart identity cascade`.execute(
        db
      );

      await db.insertInto('firms').values([{ firm_id: FIRM_ID, legal_entity_name: 'Test Firm A (fixture)', status: 'active', quote_validity_days: 30 }]).execute();

      const users = await db
        .insertInto('admin_users')
        .values([
          { name: feeAdmin.name, email: feeAdmin.email, role: 'fee_administrator', password_hash: 'test-fixture-not-a-real-hash' },
          { name: secondFeeAdmin.name, email: secondFeeAdmin.email, role: 'fee_administrator', password_hash: 'test-fixture-not-a-real-hash' },
          { name: complianceReviewer.name, email: complianceReviewer.email, role: 'compliance_reviewer', password_hash: 'test-fixture-not-a-real-hash' },
          { name: superAdmin.name, email: superAdmin.email, role: 'super_admin', password_hash: 'test-fixture-not-a-real-hash' },
          { name: reportingUser.name, email: reportingUser.email, role: 'reporting_user', password_hash: 'test-fixture-not-a-real-hash' },
        ])
        .returningAll()
        .execute();

      // Wire generated ids back onto the fixture objects used by each test.
      feeAdmin.userId = users.find((u) => u.email === feeAdmin.email)!.user_id;
      secondFeeAdmin.userId = users.find((u) => u.email === secondFeeAdmin.email)!.user_id;
      complianceReviewer.userId = users.find((u) => u.email === complianceReviewer.email)!.user_id;
      superAdmin.userId = users.find((u) => u.email === superAdmin.email)!.user_id;
      reportingUser.userId = users.find((u) => u.email === reportingUser.email)!.user_id;
    });

    it('creates a draft and records an audit entry', async () => {
      const rule = await createFeeRuleDraft(db, feeAdmin, baseInput());
      expect(rule.approvalStatus).toBe('draft');
      expect(rule.createdBy).toBe(feeAdmin.userId);
      expect(rule.lastModifiedBy).toBe(feeAdmin.userId);

      const auditEntries = await listAuditLogForEntity(db, 'fee_rule', rule.feeRuleId);
      expect(auditEntries).toHaveLength(1);
      expect(auditEntries[0].action).toBe('create');
      expect(auditEntries[0].actorUserId).toBe(feeAdmin.userId);
    });

    it('rejects creation from a role without permission', async () => {
      await expect(createFeeRuleDraft(db, reportingUser, baseInput())).rejects.toThrow(ForbiddenError);
    });

    it('allows editing a draft, but blocks editing once it is pending_review', async () => {
      const rule = await createFeeRuleDraft(db, feeAdmin, baseInput());

      const edited = await updateFeeRuleDraft(db, feeAdmin, rule.feeRuleId, { amount: 950 });
      expect(edited.amount).toBe(950);
      expect(edited.approvalStatus).toBe('draft');

      await submitFeeRuleForReview(db, feeAdmin, rule.feeRuleId);

      await expect(updateFeeRuleDraft(db, feeAdmin, rule.feeRuleId, { amount: 1000 })).rejects.toThrow(InvalidStateError);
    });

    it('enforces segregation of duties: the last editor cannot approve their own change', async () => {
      const rule = await createFeeRuleDraft(db, superAdmin, baseInput());
      await submitFeeRuleForReview(db, superAdmin, rule.feeRuleId);

      // super_admin has approve permission, but is also the last editor — must still be blocked.
      await expect(approveFeeRule(db, superAdmin, rule.feeRuleId)).rejects.toThrow(InvalidStateError);

      // A different reviewer can approve the same rule without issue.
      const approved = await approveFeeRule(db, complianceReviewer, rule.feeRuleId);
      expect(approved.approvalStatus).toBe('approved');
    });

    it('runs the full happy path: draft -> submit -> approve, by two different people', async () => {
      const rule = await createFeeRuleDraft(db, feeAdmin, baseInput());
      await submitFeeRuleForReview(db, feeAdmin, rule.feeRuleId);
      const approved = await approveFeeRule(db, complianceReviewer, rule.feeRuleId);

      expect(approved.approvalStatus).toBe('approved');

      const auditEntries = await listAuditLogForEntity(db, 'fee_rule', rule.feeRuleId);
      expect(auditEntries.map((e) => e.action)).toEqual(['create', 'submit_for_review', 'approve']);
      expect(auditEntries[2].actorUserId).toBe(complianceReviewer.userId);
    });

    it('rejects with a reason, and requires a non-empty reason', async () => {
      const rule = await createFeeRuleDraft(db, feeAdmin, baseInput());
      await submitFeeRuleForReview(db, feeAdmin, rule.feeRuleId);

      await expect(rejectFeeRule(db, complianceReviewer, rule.feeRuleId, '')).rejects.toThrow(InvalidStateError);

      const rejected = await rejectFeeRule(db, complianceReviewer, rule.feeRuleId, 'Amount looks like a typo — please confirm.');
      expect(rejected.approvalStatus).toBe('rejected');

      const auditEntries = await listAuditLogForEntity(db, 'fee_rule', rule.feeRuleId);
      const rejectEntry = auditEntries.find((e) => e.action === 'reject');
      expect(rejectEntry?.reason).toBe('Amount looks like a typo — please confirm.');
    });

    it('allows a rejected draft to be edited and resubmitted', async () => {
      const rule = await createFeeRuleDraft(db, feeAdmin, baseInput());
      await submitFeeRuleForReview(db, feeAdmin, rule.feeRuleId);
      await rejectFeeRule(db, complianceReviewer, rule.feeRuleId, 'Needs a second look.');

      const edited = await updateFeeRuleDraft(db, secondFeeAdmin, rule.feeRuleId, { amount: 825 });
      expect(edited.approvalStatus).toBe('draft'); // back to draft, not silently re-queued
      expect(edited.lastModifiedBy).toBe(secondFeeAdmin.userId);

      await submitFeeRuleForReview(db, secondFeeAdmin, rule.feeRuleId);
      const approved = await approveFeeRule(db, complianceReviewer, rule.feeRuleId);
      expect(approved.approvalStatus).toBe('approved');
      expect(approved.amount).toBe(825);
    });

    it("sets the superseded rule's expiry_date when the superseding rule is approved", async () => {
      const original = await createFeeRuleDraft(db, feeAdmin, baseInput({ effectiveDate: '2025-01-01' }));
      await submitFeeRuleForReview(db, feeAdmin, original.feeRuleId);
      await approveFeeRule(db, complianceReviewer, original.feeRuleId);

      const replacement = await createFeeRuleDraft(
        db,
        feeAdmin,
        baseInput({ amount: 1_100, effectiveDate: '2025-06-01', supersedesFeeRuleId: original.feeRuleId })
      );
      await submitFeeRuleForReview(db, feeAdmin, replacement.feeRuleId);
      await approveFeeRule(db, complianceReviewer, replacement.feeRuleId);

      const originalAfter = await db.selectFrom('fee_rules').selectAll().where('fee_rule_id', '=', original.feeRuleId).executeTakeFirstOrThrow();
      expect(originalAfter.expiry_date?.toISOString().slice(0, 10)).toBe('2025-06-01');
      expect(originalAfter.approval_status).toBe('approved'); // still valid for its historical window, not deleted
    });

    it('lists only pending_review rules for a compliance reviewer, and blocks non-reviewers from listing', async () => {
      const draftRule = await createFeeRuleDraft(db, feeAdmin, baseInput({ chargeName: 'Draft one' }));
      const pendingRule = await createFeeRuleDraft(db, feeAdmin, baseInput({ chargeName: 'Pending one' }));
      await submitFeeRuleForReview(db, feeAdmin, pendingRule.feeRuleId);

      const pending = await listPendingFeeRuleApprovals(db, complianceReviewer);
      expect(pending.map((r) => r.feeRuleId)).toEqual([pendingRule.feeRuleId]);
      expect(pending.map((r) => r.feeRuleId)).not.toContain(draftRule.feeRuleId);

      await expect(listPendingFeeRuleApprovals(db, reportingUser)).rejects.toThrow(ForbiddenError);
    });

    it('getFeeRuleById returns the rule for a permitted role and throws for an unpermitted one', async () => {
      const rule = await createFeeRuleDraft(db, feeAdmin, baseInput({ chargeName: 'Viewable rule' }));

      const viewed = await getFeeRuleById(db, reportingUser, rule.feeRuleId); // view-only role can still view
      expect(viewed.chargeName).toBe('Viewable rule');

      await expect(getFeeRuleById(db, noPermissionUser(), rule.feeRuleId)).rejects.toThrow(ForbiddenError);
    });
  });
} else {
  describe.skip('fee rule admin workflow (integration, real Postgres) — set DATABASE_URL to run', () => {
    it('skipped: no DATABASE_URL set', () => {});
  });
}

function noPermissionUser(): AdminUser {
  return { userId: 'irrelevant-no-permission-role', name: 'No Permission', email: 'no-permission@fixture.test', role: 'lead_management_user' };
}
