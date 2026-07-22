// Five Star Conveyancing — fee value band & disbursement rule admin workflow tests
// Same rigour as admin.integration.test.ts (fee_rules), applied to the two
// other rule tables that share the identical workflow pattern. Fictional
// fixture data only.

import { afterAll, beforeEach, describe, expect, it } from 'vitest';
import { sql } from 'kysely';
import { createDb } from '../src/db/client.js';
import { ForbiddenError } from '../src/admin/roles.js';
import { InvalidStateError } from '../src/admin/feeRuleAdmin.js';
import {
  approveFeeValueBand,
  createFeeValueBandDraft,
  getFeeValueBandById,
  listPendingFeeValueBandApprovals,
  rejectFeeValueBand,
  submitFeeValueBandForReview,
  updateFeeValueBandDraft,
  type CreateFeeValueBandInput,
} from '../src/admin/feeValueBandAdmin.js';
import {
  approveDisbursementRule,
  createDisbursementRuleDraft,
  listPendingDisbursementRuleApprovals,
  rejectDisbursementRule,
  submitDisbursementRuleForReview,
  updateDisbursementRuleDraft,
  getDisbursementRuleById,
  type CreateDisbursementRuleInput,
} from '../src/admin/disbursementRuleAdmin.js';
import type { AdminUser } from '../src/types.js';

const connectionString = process.env.DATABASE_URL;
const FIRM_ID = '11111111-1111-1111-1111-111111111111';

const feeAdmin: AdminUser = { userId: '', name: 'Fran Fee', email: 'fran@fixture.test', role: 'fee_administrator' };
const complianceReviewer: AdminUser = { userId: '', name: 'Cal Compliance', email: 'cal@fixture.test', role: 'compliance_reviewer' };
const superAdmin: AdminUser = { userId: '', name: 'Sam Super', email: 'sam@fixture.test', role: 'super_admin' };
const reportingUser: AdminUser = { userId: '', name: 'Rita Reports', email: 'rita@fixture.test', role: 'reporting_user' };

function baseBandInput(overrides: Partial<CreateFeeValueBandInput> = {}): CreateFeeValueBandInput {
  return {
    firmId: FIRM_ID,
    transactionType: 'purchase',
    valueMin: 0,
    valueMax: 250_000,
    boundaryRule: 'inclusive_upper',
    baseFee: 800,
    effectiveDate: '2025-01-01',
    expiryDate: null,
    ...overrides,
  };
}

function baseDisbursementInput(overrides: Partial<CreateDisbursementRuleInput> = {}): CreateDisbursementRuleInput {
  return {
    firmId: FIRM_ID,
    transactionType: 'purchase',
    chargeName: 'Search pack',
    category: 'search',
    amountType: 'fixed',
    amount: 300,
    minAmount: null,
    maxAmount: null,
    vatTreatment: 'exempt',
    conditionalTriggerExpression: null,
    effectiveDate: '2025-01-01',
    expiryDate: null,
    displayOrder: 1,
    clientFacingExplanation: 'Local authority, water and environmental searches.',
    ...overrides,
  };
}

if (connectionString) {
  describe('fee value band & disbursement rule admin workflows (integration, real Postgres)', () => {
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
          { name: complianceReviewer.name, email: complianceReviewer.email, role: 'compliance_reviewer', password_hash: 'test-fixture-not-a-real-hash' },
          { name: superAdmin.name, email: superAdmin.email, role: 'super_admin', password_hash: 'test-fixture-not-a-real-hash' },
          { name: reportingUser.name, email: reportingUser.email, role: 'reporting_user', password_hash: 'test-fixture-not-a-real-hash' },
        ])
        .returningAll()
        .execute();

      feeAdmin.userId = users.find((u) => u.email === feeAdmin.email)!.user_id;
      complianceReviewer.userId = users.find((u) => u.email === complianceReviewer.email)!.user_id;
      superAdmin.userId = users.find((u) => u.email === superAdmin.email)!.user_id;
      reportingUser.userId = users.find((u) => u.email === reportingUser.email)!.user_id;
    });

    describe('fee value bands', () => {
      it('runs the full draft -> submit -> approve workflow', async () => {
        const band = await createFeeValueBandDraft(db, feeAdmin, baseBandInput());
        expect(band.approvalStatus).toBe('draft');

        await expect(createFeeValueBandDraft(db, reportingUser, baseBandInput())).rejects.toThrow(ForbiddenError);

        const edited = await updateFeeValueBandDraft(db, feeAdmin, band.bandId, { baseFee: 950 });
        expect(edited.baseFee).toBe(950);

        await submitFeeValueBandForReview(db, feeAdmin, band.bandId);
        await expect(updateFeeValueBandDraft(db, feeAdmin, band.bandId, { baseFee: 1000 })).rejects.toThrow(InvalidStateError);

        const approved = await approveFeeValueBand(db, complianceReviewer, band.bandId);
        expect(approved.approvalStatus).toBe('approved');
        expect(approved.baseFee).toBe(950);
      });

      it('enforces genuine segregation of duties: a super_admin (who has both permissions) cannot approve their own change', async () => {
        const band = await createFeeValueBandDraft(db, superAdmin, baseBandInput());
        await submitFeeValueBandForReview(db, superAdmin, band.bandId);

        await expect(approveFeeValueBand(db, superAdmin, band.bandId)).rejects.toThrow(InvalidStateError);

        const approved = await approveFeeValueBand(db, complianceReviewer, band.bandId);
        expect(approved.approvalStatus).toBe('approved');
      });

      it('rejects with a required reason, and allows resubmission after edit', async () => {
        const band = await createFeeValueBandDraft(db, feeAdmin, baseBandInput());
        await submitFeeValueBandForReview(db, feeAdmin, band.bandId);

        await expect(rejectFeeValueBand(db, complianceReviewer, band.bandId, '')).rejects.toThrow(InvalidStateError);
        const rejected = await rejectFeeValueBand(db, complianceReviewer, band.bandId, 'Boundary looks wrong.');
        expect(rejected.approvalStatus).toBe('rejected');

        const edited = await updateFeeValueBandDraft(db, feeAdmin, band.bandId, { valueMax: 300_000 });
        expect(edited.approvalStatus).toBe('draft');
        await submitFeeValueBandForReview(db, feeAdmin, band.bandId);
        const approved = await approveFeeValueBand(db, complianceReviewer, band.bandId);
        expect(approved.valueMax).toBe(300_000);
      });

      it("sets the superseded band's expiry_date when the superseding band is approved", async () => {
        const original = await createFeeValueBandDraft(db, feeAdmin, baseBandInput({ effectiveDate: '2025-01-01' }));
        await submitFeeValueBandForReview(db, feeAdmin, original.bandId);
        await approveFeeValueBand(db, complianceReviewer, original.bandId);

        const replacement = await createFeeValueBandDraft(db, feeAdmin, baseBandInput({ baseFee: 999, effectiveDate: '2025-06-01', supersedesBandId: original.bandId }));
        await submitFeeValueBandForReview(db, feeAdmin, replacement.bandId);
        await approveFeeValueBand(db, complianceReviewer, replacement.bandId);

        const originalAfter = await db.selectFrom('fee_value_bands').selectAll().where('band_id', '=', original.bandId).executeTakeFirstOrThrow();
        expect(originalAfter.expiry_date?.toISOString().slice(0, 10)).toBe('2025-06-01');
        expect(originalAfter.approval_status).toBe('approved');
      });

      it('lists only pending_review bands, scoped to reviewers', async () => {
        const draft = await createFeeValueBandDraft(db, feeAdmin, baseBandInput());
        const pending = await createFeeValueBandDraft(db, feeAdmin, baseBandInput({ valueMin: 250_000, valueMax: null }));
        await submitFeeValueBandForReview(db, feeAdmin, pending.bandId);

        const result = await listPendingFeeValueBandApprovals(db, complianceReviewer);
        expect(result.map((r) => r.bandId)).toEqual([pending.bandId]);
        expect(result.map((r) => r.bandId)).not.toContain(draft.bandId);
        await expect(listPendingFeeValueBandApprovals(db, reportingUser)).rejects.toThrow(ForbiddenError);
      });

      it('getFeeValueBandById returns the band for a permitted role and throws for an unpermitted one', async () => {
        const band = await createFeeValueBandDraft(db, feeAdmin, baseBandInput());
        const viewed = await getFeeValueBandById(db, reportingUser, band.bandId);
        expect(viewed.baseFee).toBe(800);
        await expect(getFeeValueBandById(db, { userId: 'x', name: 'No Permission', email: 'np@fixture.test', role: 'lead_management_user' }, band.bandId)).rejects.toThrow(ForbiddenError);
      });
    });

    describe('disbursement rules', () => {
      it('runs the full draft -> submit -> approve workflow', async () => {
        const rule = await createDisbursementRuleDraft(db, feeAdmin, baseDisbursementInput());
        expect(rule.approvalStatus).toBe('draft');

        await expect(createDisbursementRuleDraft(db, reportingUser, baseDisbursementInput())).rejects.toThrow(ForbiddenError);

        const edited = await updateDisbursementRuleDraft(db, feeAdmin, rule.disbursementId, { amount: 350 });
        expect(edited.amount).toBe(350);

        await submitDisbursementRuleForReview(db, feeAdmin, rule.disbursementId);
        await expect(updateDisbursementRuleDraft(db, feeAdmin, rule.disbursementId, { amount: 400 })).rejects.toThrow(InvalidStateError);

        const approved = await approveDisbursementRule(db, complianceReviewer, rule.disbursementId);
        expect(approved.approvalStatus).toBe('approved');
        expect(approved.amount).toBe(350);
      });

      it('enforces genuine segregation of duties: a super_admin (who has both permissions) cannot approve their own change', async () => {
        const rule = await createDisbursementRuleDraft(db, superAdmin, baseDisbursementInput());
        await submitDisbursementRuleForReview(db, superAdmin, rule.disbursementId);

        await expect(approveDisbursementRule(db, superAdmin, rule.disbursementId)).rejects.toThrow(InvalidStateError);

        const approved = await approveDisbursementRule(db, complianceReviewer, rule.disbursementId);
        expect(approved.approvalStatus).toBe('approved');
      });

      it('blocks approval while a disbursement rule is still draft (not yet submitted for review)', async () => {
        const rule = await createDisbursementRuleDraft(db, feeAdmin, baseDisbursementInput());
        await expect(approveDisbursementRule(db, complianceReviewer, rule.disbursementId)).rejects.toThrow(InvalidStateError);
      });

      it('rejects with a required reason, and allows resubmission after edit', async () => {
        const rule = await createDisbursementRuleDraft(db, feeAdmin, baseDisbursementInput());
        await submitDisbursementRuleForReview(db, feeAdmin, rule.disbursementId);

        await expect(rejectDisbursementRule(db, complianceReviewer, rule.disbursementId, '')).rejects.toThrow(InvalidStateError);
        const rejected = await rejectDisbursementRule(db, complianceReviewer, rule.disbursementId, 'Confirm VAT treatment.');
        expect(rejected.approvalStatus).toBe('rejected');

        await updateDisbursementRuleDraft(db, feeAdmin, rule.disbursementId, { vatTreatment: 'standard' });
        await submitDisbursementRuleForReview(db, feeAdmin, rule.disbursementId);
        const approved = await approveDisbursementRule(db, complianceReviewer, rule.disbursementId);
        expect(approved.vatTreatment).toBe('standard');
      });

      it("sets the superseded disbursement rule's expiry_date when the superseding rule is approved", async () => {
        const original = await createDisbursementRuleDraft(db, feeAdmin, baseDisbursementInput({ effectiveDate: '2025-01-01' }));
        await submitDisbursementRuleForReview(db, feeAdmin, original.disbursementId);
        await approveDisbursementRule(db, complianceReviewer, original.disbursementId);

        const replacement = await createDisbursementRuleDraft(
          db,
          feeAdmin,
          baseDisbursementInput({ amount: 375, effectiveDate: '2025-06-01', supersedesDisbursementId: original.disbursementId })
        );
        await submitDisbursementRuleForReview(db, feeAdmin, replacement.disbursementId);
        await approveDisbursementRule(db, complianceReviewer, replacement.disbursementId);

        const originalAfter = await db
          .selectFrom('disbursement_rules')
          .selectAll()
          .where('disbursement_id', '=', original.disbursementId)
          .executeTakeFirstOrThrow();
        expect(originalAfter.expiry_date?.toISOString().slice(0, 10)).toBe('2025-06-01');
        expect(originalAfter.approval_status).toBe('approved');
      });

      it('lists only pending_review disbursement rules, scoped to reviewers', async () => {
        const draft = await createDisbursementRuleDraft(db, feeAdmin, baseDisbursementInput({ chargeName: 'Draft charge' }));
        const pending = await createDisbursementRuleDraft(db, feeAdmin, baseDisbursementInput({ chargeName: 'Pending charge' }));
        await submitDisbursementRuleForReview(db, feeAdmin, pending.disbursementId);

        const result = await listPendingDisbursementRuleApprovals(db, complianceReviewer);
        expect(result.map((r) => r.disbursementId)).toEqual([pending.disbursementId]);
        expect(result.map((r) => r.disbursementId)).not.toContain(draft.disbursementId);
        await expect(listPendingDisbursementRuleApprovals(db, reportingUser)).rejects.toThrow(ForbiddenError);
      });

      it('getDisbursementRuleById returns the rule for a permitted role and throws for an unpermitted one', async () => {
        const rule = await createDisbursementRuleDraft(db, feeAdmin, baseDisbursementInput());
        const viewed = await getDisbursementRuleById(db, reportingUser, rule.disbursementId);
        expect(viewed.chargeName).toBe('Search pack');
        await expect(getDisbursementRuleById(db, { userId: 'x', name: 'No Permission', email: 'np@fixture.test', role: 'lead_management_user' }, rule.disbursementId)).rejects.toThrow(ForbiddenError);
      });
    });
  });
} else {
  describe.skip('fee value band & disbursement rule admin workflows (integration, real Postgres) — set DATABASE_URL to run', () => {
    it('skipped: no DATABASE_URL set', () => {});
  });
}
