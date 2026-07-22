// Five Star Conveyancing — disbursement rule admin service
// Same draft -> pending_review -> approved/rejected workflow as
// feeRuleAdmin.ts, applied to disbursement_rules — the third and final
// implementation of the pattern.
import { mapDisbursementRule } from '../db/repository.js';
import { assertPermission } from './roles.js';
import { recordAuditEntry } from './auditLog.js';
import { InvalidStateError } from './feeRuleAdmin.js';
async function fetchDisbursementOrThrow(db, disbursementId) {
    const row = await db.selectFrom('disbursement_rules').selectAll().where('disbursement_id', '=', disbursementId).executeTakeFirst();
    if (!row)
        throw new InvalidStateError(`Disbursement rule ${disbursementId} does not exist.`);
    return mapDisbursementRule(row);
}
export async function createDisbursementRuleDraft(db, user, input) {
    assertPermission(user, 'disbursements:create');
    const row = await db
        .insertInto('disbursement_rules')
        .values({
        firm_id: input.firmId,
        transaction_type: input.transactionType,
        charge_name: input.chargeName,
        category: input.category,
        amount_type: input.amountType,
        amount: input.amount,
        min_amount: input.minAmount,
        max_amount: input.maxAmount,
        vat_treatment: input.vatTreatment,
        conditional_trigger_expression: input.conditionalTriggerExpression,
        effective_date: input.effectiveDate,
        expiry_date: input.expiryDate,
        approval_status: 'draft',
        display_order: input.displayOrder,
        client_facing_explanation: input.clientFacingExplanation,
        created_by: user.userId,
        last_modified_by: user.userId,
        supersedes_disbursement_id: input.supersedesDisbursementId ?? null,
    })
        .returningAll()
        .executeTakeFirstOrThrow();
    const rule = mapDisbursementRule(row);
    await recordAuditEntry(db, { actorUserId: user.userId, entityType: 'disbursement_rule', entityId: rule.disbursementId, action: 'create', afterValue: rule });
    return rule;
}
export async function updateDisbursementRuleDraft(db, user, disbursementId, updates) {
    assertPermission(user, 'disbursements:edit');
    const before = await fetchDisbursementOrThrow(db, disbursementId);
    if (before.approvalStatus !== 'draft' && before.approvalStatus !== 'rejected') {
        throw new InvalidStateError(`Disbursement rule ${disbursementId} is '${before.approvalStatus}' and cannot be edited directly. Create a new draft that supersedes it instead.`);
    }
    const row = await db
        .updateTable('disbursement_rules')
        .set({
        ...(updates.chargeName !== undefined && { charge_name: updates.chargeName }),
        ...(updates.category !== undefined && { category: updates.category }),
        ...(updates.amountType !== undefined && { amount_type: updates.amountType }),
        ...(updates.amount !== undefined && { amount: updates.amount }),
        ...(updates.minAmount !== undefined && { min_amount: updates.minAmount }),
        ...(updates.maxAmount !== undefined && { max_amount: updates.maxAmount }),
        ...(updates.vatTreatment !== undefined && { vat_treatment: updates.vatTreatment }),
        ...(updates.conditionalTriggerExpression !== undefined && { conditional_trigger_expression: updates.conditionalTriggerExpression }),
        ...(updates.effectiveDate !== undefined && { effective_date: updates.effectiveDate }),
        ...(updates.expiryDate !== undefined && { expiry_date: updates.expiryDate }),
        ...(updates.displayOrder !== undefined && { display_order: updates.displayOrder }),
        ...(updates.clientFacingExplanation !== undefined && { client_facing_explanation: updates.clientFacingExplanation }),
        last_modified_by: user.userId,
        approval_status: 'draft',
    })
        .where('disbursement_id', '=', disbursementId)
        .returningAll()
        .executeTakeFirstOrThrow();
    const after = mapDisbursementRule(row);
    await recordAuditEntry(db, { actorUserId: user.userId, entityType: 'disbursement_rule', entityId: disbursementId, action: 'update', beforeValue: before, afterValue: after });
    return after;
}
export async function submitDisbursementRuleForReview(db, user, disbursementId) {
    assertPermission(user, 'disbursements:submit_for_review');
    const before = await fetchDisbursementOrThrow(db, disbursementId);
    if (before.approvalStatus !== 'draft') {
        throw new InvalidStateError(`Disbursement rule ${disbursementId} is '${before.approvalStatus}' and cannot be submitted for review from that state.`);
    }
    const row = await db
        .updateTable('disbursement_rules')
        .set({ approval_status: 'pending_review', last_modified_by: user.userId })
        .where('disbursement_id', '=', disbursementId)
        .returningAll()
        .executeTakeFirstOrThrow();
    const after = mapDisbursementRule(row);
    await recordAuditEntry(db, { actorUserId: user.userId, entityType: 'disbursement_rule', entityId: disbursementId, action: 'submit_for_review', beforeValue: before, afterValue: after });
    return after;
}
export async function approveDisbursementRule(db, user, disbursementId) {
    assertPermission(user, 'disbursements:approve');
    return db.transaction().execute(async (trx) => {
        const before = await fetchDisbursementOrThrow(trx, disbursementId);
        if (before.approvalStatus !== 'pending_review') {
            throw new InvalidStateError(`Disbursement rule ${disbursementId} is '${before.approvalStatus}' and cannot be approved from that state.`);
        }
        if (before.lastModifiedBy === user.userId) {
            throw new InvalidStateError('You cannot approve a disbursement rule you last edited yourself. A different reviewer is required.');
        }
        if (before.supersedesDisbursementId) {
            await trx
                .updateTable('disbursement_rules')
                .set({ expiry_date: before.effectiveDate })
                .where('disbursement_id', '=', before.supersedesDisbursementId)
                .where('approval_status', '=', 'approved')
                .execute();
        }
        const row = await trx
            .updateTable('disbursement_rules')
            .set({ approval_status: 'approved' })
            .where('disbursement_id', '=', disbursementId)
            .returningAll()
            .executeTakeFirstOrThrow();
        const after = mapDisbursementRule(row);
        await recordAuditEntry(trx, { actorUserId: user.userId, entityType: 'disbursement_rule', entityId: disbursementId, action: 'approve', beforeValue: before, afterValue: after });
        return after;
    });
}
export async function rejectDisbursementRule(db, user, disbursementId, reason) {
    assertPermission(user, 'disbursements:approve');
    if (!reason || reason.trim().length === 0) {
        throw new InvalidStateError('A reason is required to reject a disbursement rule.');
    }
    const before = await fetchDisbursementOrThrow(db, disbursementId);
    if (before.approvalStatus !== 'pending_review') {
        throw new InvalidStateError(`Disbursement rule ${disbursementId} is '${before.approvalStatus}' and cannot be rejected from that state.`);
    }
    if (before.lastModifiedBy === user.userId) {
        throw new InvalidStateError('You cannot review a disbursement rule you last edited yourself. A different reviewer is required.');
    }
    const row = await db
        .updateTable('disbursement_rules')
        .set({ approval_status: 'rejected' })
        .where('disbursement_id', '=', disbursementId)
        .returningAll()
        .executeTakeFirstOrThrow();
    const after = mapDisbursementRule(row);
    await recordAuditEntry(db, { actorUserId: user.userId, entityType: 'disbursement_rule', entityId: disbursementId, action: 'reject', beforeValue: before, afterValue: after, reason });
    return after;
}
export async function getDisbursementRuleById(db, user, disbursementId) {
    assertPermission(user, 'disbursements:view');
    return fetchDisbursementOrThrow(db, disbursementId);
}
export async function listPendingDisbursementRuleApprovals(db, user) {
    assertPermission(user, 'disbursements:approve');
    const rows = await db.selectFrom('disbursement_rules').selectAll().where('approval_status', '=', 'pending_review').execute();
    return rows.map(mapDisbursementRule);
}
