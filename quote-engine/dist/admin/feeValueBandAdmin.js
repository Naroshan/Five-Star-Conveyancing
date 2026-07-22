// Five Star Conveyancing — fee value band admin service
// Same draft -> pending_review -> approved/rejected workflow as
// feeRuleAdmin.ts, applied to fee_value_bands. See that file for the
// detailed reasoning on segregation of duties and supersession — this is
// the promised second implementation of the pattern, not just documentation
// of it.
import { mapFeeValueBand } from '../db/repository.js';
import { assertPermission } from './roles.js';
import { recordAuditEntry } from './auditLog.js';
import { InvalidStateError } from './feeRuleAdmin.js';
async function fetchBandOrThrow(db, bandId) {
    const row = await db.selectFrom('fee_value_bands').selectAll().where('band_id', '=', bandId).executeTakeFirst();
    if (!row)
        throw new InvalidStateError(`Fee value band ${bandId} does not exist.`);
    return mapFeeValueBand(row);
}
export async function createFeeValueBandDraft(db, user, input) {
    assertPermission(user, 'fee_bands:create');
    const row = await db
        .insertInto('fee_value_bands')
        .values({
        firm_id: input.firmId,
        transaction_type: input.transactionType,
        value_min: input.valueMin,
        value_max: input.valueMax,
        boundary_rule: input.boundaryRule,
        base_fee: input.baseFee,
        effective_date: input.effectiveDate,
        expiry_date: input.expiryDate,
        approval_status: 'draft',
        created_by: user.userId,
        last_modified_by: user.userId,
        supersedes_band_id: input.supersedesBandId ?? null,
    })
        .returningAll()
        .executeTakeFirstOrThrow();
    const band = mapFeeValueBand(row);
    await recordAuditEntry(db, { actorUserId: user.userId, entityType: 'fee_value_band', entityId: band.bandId, action: 'create', afterValue: band });
    return band;
}
export async function updateFeeValueBandDraft(db, user, bandId, updates) {
    assertPermission(user, 'fee_bands:edit');
    const before = await fetchBandOrThrow(db, bandId);
    if (before.approvalStatus !== 'draft' && before.approvalStatus !== 'rejected') {
        throw new InvalidStateError(`Fee value band ${bandId} is '${before.approvalStatus}' and cannot be edited directly. Create a new draft that supersedes it instead.`);
    }
    const row = await db
        .updateTable('fee_value_bands')
        .set({
        ...(updates.valueMin !== undefined && { value_min: updates.valueMin }),
        ...(updates.valueMax !== undefined && { value_max: updates.valueMax }),
        ...(updates.boundaryRule !== undefined && { boundary_rule: updates.boundaryRule }),
        ...(updates.baseFee !== undefined && { base_fee: updates.baseFee }),
        ...(updates.effectiveDate !== undefined && { effective_date: updates.effectiveDate }),
        ...(updates.expiryDate !== undefined && { expiry_date: updates.expiryDate }),
        last_modified_by: user.userId,
        approval_status: 'draft',
    })
        .where('band_id', '=', bandId)
        .returningAll()
        .executeTakeFirstOrThrow();
    const after = mapFeeValueBand(row);
    await recordAuditEntry(db, { actorUserId: user.userId, entityType: 'fee_value_band', entityId: bandId, action: 'update', beforeValue: before, afterValue: after });
    return after;
}
export async function submitFeeValueBandForReview(db, user, bandId) {
    assertPermission(user, 'fee_bands:submit_for_review');
    const before = await fetchBandOrThrow(db, bandId);
    if (before.approvalStatus !== 'draft') {
        throw new InvalidStateError(`Fee value band ${bandId} is '${before.approvalStatus}' and cannot be submitted for review from that state.`);
    }
    const row = await db
        .updateTable('fee_value_bands')
        .set({ approval_status: 'pending_review', last_modified_by: user.userId })
        .where('band_id', '=', bandId)
        .returningAll()
        .executeTakeFirstOrThrow();
    const after = mapFeeValueBand(row);
    await recordAuditEntry(db, { actorUserId: user.userId, entityType: 'fee_value_band', entityId: bandId, action: 'submit_for_review', beforeValue: before, afterValue: after });
    return after;
}
export async function approveFeeValueBand(db, user, bandId) {
    assertPermission(user, 'fee_bands:approve');
    return db.transaction().execute(async (trx) => {
        const before = await fetchBandOrThrow(trx, bandId);
        if (before.approvalStatus !== 'pending_review') {
            throw new InvalidStateError(`Fee value band ${bandId} is '${before.approvalStatus}' and cannot be approved from that state.`);
        }
        if (before.lastModifiedBy === user.userId) {
            throw new InvalidStateError('You cannot approve a fee value band you last edited yourself. A different reviewer is required.');
        }
        if (before.supersedesBandId) {
            await trx
                .updateTable('fee_value_bands')
                .set({ expiry_date: before.effectiveDate })
                .where('band_id', '=', before.supersedesBandId)
                .where('approval_status', '=', 'approved')
                .execute();
        }
        const row = await trx
            .updateTable('fee_value_bands')
            .set({ approval_status: 'approved' })
            .where('band_id', '=', bandId)
            .returningAll()
            .executeTakeFirstOrThrow();
        const after = mapFeeValueBand(row);
        await recordAuditEntry(trx, { actorUserId: user.userId, entityType: 'fee_value_band', entityId: bandId, action: 'approve', beforeValue: before, afterValue: after });
        return after;
    });
}
export async function rejectFeeValueBand(db, user, bandId, reason) {
    assertPermission(user, 'fee_bands:approve');
    if (!reason || reason.trim().length === 0) {
        throw new InvalidStateError('A reason is required to reject a fee value band.');
    }
    const before = await fetchBandOrThrow(db, bandId);
    if (before.approvalStatus !== 'pending_review') {
        throw new InvalidStateError(`Fee value band ${bandId} is '${before.approvalStatus}' and cannot be rejected from that state.`);
    }
    if (before.lastModifiedBy === user.userId) {
        throw new InvalidStateError('You cannot review a fee value band you last edited yourself. A different reviewer is required.');
    }
    const row = await db
        .updateTable('fee_value_bands')
        .set({ approval_status: 'rejected' })
        .where('band_id', '=', bandId)
        .returningAll()
        .executeTakeFirstOrThrow();
    const after = mapFeeValueBand(row);
    await recordAuditEntry(db, { actorUserId: user.userId, entityType: 'fee_value_band', entityId: bandId, action: 'reject', beforeValue: before, afterValue: after, reason });
    return after;
}
export async function getFeeValueBandById(db, user, bandId) {
    assertPermission(user, 'fee_bands:view');
    return fetchBandOrThrow(db, bandId);
}
export async function listPendingFeeValueBandApprovals(db, user) {
    assertPermission(user, 'fee_bands:approve');
    const rows = await db.selectFrom('fee_value_bands').selectAll().where('approval_status', '=', 'pending_review').execute();
    return rows.map(mapFeeValueBand);
}
