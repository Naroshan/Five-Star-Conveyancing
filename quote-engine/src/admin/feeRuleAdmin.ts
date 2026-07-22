// Five Star Conveyancing — fee rule admin service
// Implements the draft -> pending_review -> approved/rejected workflow from
// Stage 2, Section 9: no fee change reaches the calculation engine without
// passing through a compliance reviewer who is not the same person who
// authored the change (segregation of duties), and every step is recorded
// in the audit log.
//
// This is the flagship implementation of the pattern. fee_value_bands and
// disbursement_rules follow an identical shape (same approval_status,
// created_by, last_modified_by columns) — see README for how to extend it.

import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AdminUser, FeeRule, TransactionType, VatTreatment } from '../types.js';
import { mapFeeRule } from '../db/repository.js';
import { assertPermission } from './roles.js';
import { recordAuditEntry } from './auditLog.js';

export class InvalidStateError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'InvalidStateError';
  }
}

export interface CreateFeeRuleInput {
  firmId: string;
  transactionType: TransactionType;
  chargeName: string;
  chargeType: 'base_fee' | 'supplement';
  triggerKey: string | null;
  calculationType: 'fixed' | 'formula';
  amount: number | null;
  minAmount: number | null;
  maxAmount: number | null;
  formulaExpression: string | null;
  vatTreatment: VatTreatment;
  isGuaranteed: boolean;
  isEstimated: boolean;
  effectiveDate: string;
  expiryDate: string | null;
  displayOrder: number;
  clientFacingExplanation: string;
  /** If this rule is replacing an existing approved rule, reference it here — its expiry_date is set automatically when this rule is approved. */
  supersedesFeeRuleId?: string;
}

export type UpdateFeeRuleInput = Partial<
  Pick<
    CreateFeeRuleInput,
    | 'chargeName'
    | 'triggerKey'
    | 'calculationType'
    | 'amount'
    | 'minAmount'
    | 'maxAmount'
    | 'formulaExpression'
    | 'vatTreatment'
    | 'isGuaranteed'
    | 'isEstimated'
    | 'effectiveDate'
    | 'expiryDate'
    | 'displayOrder'
    | 'clientFacingExplanation'
  >
>;

async function fetchFeeRuleOrThrow(db: Kysely<Database>, feeRuleId: string): Promise<FeeRule> {
  const row = await db.selectFrom('fee_rules').selectAll().where('fee_rule_id', '=', feeRuleId).executeTakeFirst();
  if (!row) throw new InvalidStateError(`Fee rule ${feeRuleId} does not exist.`);
  return mapFeeRule(row);
}

export async function createFeeRuleDraft(db: Kysely<Database>, user: AdminUser, input: CreateFeeRuleInput): Promise<FeeRule> {
  assertPermission(user, 'fee_rules:create');

  const row = await db
    .insertInto('fee_rules')
    .values({
      firm_id: input.firmId,
      transaction_type: input.transactionType,
      charge_name: input.chargeName,
      charge_type: input.chargeType,
      trigger_key: input.triggerKey,
      calculation_type: input.calculationType,
      amount: input.amount,
      min_amount: input.minAmount,
      max_amount: input.maxAmount,
      formula_expression: input.formulaExpression,
      vat_treatment: input.vatTreatment,
      is_guaranteed: input.isGuaranteed,
      is_estimated: input.isEstimated,
      effective_date: input.effectiveDate,
      expiry_date: input.expiryDate,
      approval_status: 'draft',
      display_order: input.displayOrder,
      client_facing_explanation: input.clientFacingExplanation,
      created_by: user.userId,
      last_modified_by: user.userId,
      supersedes_fee_rule_id: input.supersedesFeeRuleId ?? null,
    })
    .returningAll()
    .executeTakeFirstOrThrow();

  const feeRule = mapFeeRule(row);
  await recordAuditEntry(db, {
    actorUserId: user.userId,
    entityType: 'fee_rule',
    entityId: feeRule.feeRuleId,
    action: 'create',
    afterValue: feeRule,
  });
  return feeRule;
}

export async function updateFeeRuleDraft(
  db: Kysely<Database>,
  user: AdminUser,
  feeRuleId: string,
  updates: UpdateFeeRuleInput
): Promise<FeeRule> {
  assertPermission(user, 'fee_rules:edit');

  const before = await fetchFeeRuleOrThrow(db, feeRuleId);
  if (before.approvalStatus !== 'draft' && before.approvalStatus !== 'rejected') {
    throw new InvalidStateError(
      `Fee rule ${feeRuleId} is '${before.approvalStatus}' and cannot be edited directly. Create a new draft that supersedes it instead.`
    );
  }

  const row = await db
    .updateTable('fee_rules')
    .set({
      ...(updates.chargeName !== undefined && { charge_name: updates.chargeName }),
      ...(updates.triggerKey !== undefined && { trigger_key: updates.triggerKey }),
      ...(updates.calculationType !== undefined && { calculation_type: updates.calculationType }),
      ...(updates.amount !== undefined && { amount: updates.amount }),
      ...(updates.minAmount !== undefined && { min_amount: updates.minAmount }),
      ...(updates.maxAmount !== undefined && { max_amount: updates.maxAmount }),
      ...(updates.formulaExpression !== undefined && { formula_expression: updates.formulaExpression }),
      ...(updates.vatTreatment !== undefined && { vat_treatment: updates.vatTreatment }),
      ...(updates.isGuaranteed !== undefined && { is_guaranteed: updates.isGuaranteed }),
      ...(updates.isEstimated !== undefined && { is_estimated: updates.isEstimated }),
      ...(updates.effectiveDate !== undefined && { effective_date: updates.effectiveDate }),
      ...(updates.expiryDate !== undefined && { expiry_date: updates.expiryDate }),
      ...(updates.displayOrder !== undefined && { display_order: updates.displayOrder }),
      ...(updates.clientFacingExplanation !== undefined && { client_facing_explanation: updates.clientFacingExplanation }),
      last_modified_by: user.userId,
      // Editing a previously-rejected rule sends it back to draft, not to pending_review —
      // it must be re-submitted deliberately, not silently re-enter the review queue.
      approval_status: 'draft',
    })
    .where('fee_rule_id', '=', feeRuleId)
    .returningAll()
    .executeTakeFirstOrThrow();

  const after = mapFeeRule(row);
  await recordAuditEntry(db, {
    actorUserId: user.userId,
    entityType: 'fee_rule',
    entityId: feeRuleId,
    action: 'update',
    beforeValue: before,
    afterValue: after,
  });
  return after;
}

export async function submitFeeRuleForReview(db: Kysely<Database>, user: AdminUser, feeRuleId: string): Promise<FeeRule> {
  assertPermission(user, 'fee_rules:submit_for_review');

  const before = await fetchFeeRuleOrThrow(db, feeRuleId);
  if (before.approvalStatus !== 'draft') {
    throw new InvalidStateError(`Fee rule ${feeRuleId} is '${before.approvalStatus}' and cannot be submitted for review from that state.`);
  }

  const row = await db
    .updateTable('fee_rules')
    .set({ approval_status: 'pending_review', last_modified_by: user.userId })
    .where('fee_rule_id', '=', feeRuleId)
    .returningAll()
    .executeTakeFirstOrThrow();

  const after = mapFeeRule(row);
  await recordAuditEntry(db, {
    actorUserId: user.userId,
    entityType: 'fee_rule',
    entityId: feeRuleId,
    action: 'submit_for_review',
    beforeValue: before,
    afterValue: after,
  });
  return after;
}

export async function approveFeeRule(db: Kysely<Database>, user: AdminUser, feeRuleId: string): Promise<FeeRule> {
  assertPermission(user, 'fee_rules:approve');

  return db.transaction().execute(async (trx) => {
    const before = await fetchFeeRuleOrThrow(trx, feeRuleId);
    if (before.approvalStatus !== 'pending_review') {
      throw new InvalidStateError(`Fee rule ${feeRuleId} is '${before.approvalStatus}' and cannot be approved from that state.`);
    }
    // Segregation of duties: the reviewer must not be the person who last edited it.
    if (before.lastModifiedBy === user.userId) {
      throw new InvalidStateError('You cannot approve a fee rule you last edited yourself. A different reviewer is required.');
    }

    if (before.supersedesFeeRuleId) {
      await trx
        .updateTable('fee_rules')
        .set({ expiry_date: before.effectiveDate })
        .where('fee_rule_id', '=', before.supersedesFeeRuleId)
        .where('approval_status', '=', 'approved')
        .execute();
    }

    const row = await trx
      .updateTable('fee_rules')
      .set({ approval_status: 'approved' })
      .where('fee_rule_id', '=', feeRuleId)
      .returningAll()
      .executeTakeFirstOrThrow();

    const after = mapFeeRule(row);
    await recordAuditEntry(trx, {
      actorUserId: user.userId,
      entityType: 'fee_rule',
      entityId: feeRuleId,
      action: 'approve',
      beforeValue: before,
      afterValue: after,
    });
    return after;
  });
}

export async function rejectFeeRule(db: Kysely<Database>, user: AdminUser, feeRuleId: string, reason: string): Promise<FeeRule> {
  assertPermission(user, 'fee_rules:approve'); // same permission gate as approval — a reviewer can do either
  if (!reason || reason.trim().length === 0) {
    throw new InvalidStateError('A reason is required to reject a fee rule.');
  }

  const before = await fetchFeeRuleOrThrow(db, feeRuleId);
  if (before.approvalStatus !== 'pending_review') {
    throw new InvalidStateError(`Fee rule ${feeRuleId} is '${before.approvalStatus}' and cannot be rejected from that state.`);
  }
  if (before.lastModifiedBy === user.userId) {
    throw new InvalidStateError('You cannot review a fee rule you last edited yourself. A different reviewer is required.');
  }

  const row = await db
    .updateTable('fee_rules')
    .set({ approval_status: 'rejected' })
    .where('fee_rule_id', '=', feeRuleId)
    .returningAll()
    .executeTakeFirstOrThrow();

  const after = mapFeeRule(row);
  await recordAuditEntry(db, {
    actorUserId: user.userId,
    entityType: 'fee_rule',
    entityId: feeRuleId,
    action: 'reject',
    beforeValue: before,
    afterValue: after,
    reason,
  });
  return after;
}

export async function getFeeRuleById(db: Kysely<Database>, user: AdminUser, feeRuleId: string): Promise<FeeRule> {
  assertPermission(user, 'fee_rules:view');
  return fetchFeeRuleOrThrow(db, feeRuleId);
}

export async function listPendingFeeRuleApprovals(db: Kysely<Database>, user: AdminUser): Promise<FeeRule[]> {
  assertPermission(user, 'fee_rules:approve');
  const rows = await db.selectFrom('fee_rules').selectAll().where('approval_status', '=', 'pending_review').execute();
  return rows.map(mapFeeRule);
}
