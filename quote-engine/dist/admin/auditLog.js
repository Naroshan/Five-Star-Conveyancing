// Five Star Conveyancing — audit log
// Every administrative change is recorded here: who, what, when,
// before/after values. This is the Stage 2 FR19 / Stage 4 audit_log
// requirement — not optional logging, but the record a compliance reviewer
// or regulator would actually need to reconstruct a change.
export async function recordAuditEntry(db, params) {
    await db
        .insertInto('audit_log')
        .values({
        actor_user_id: params.actorUserId,
        entity_type: params.entityType,
        entity_id: params.entityId,
        action: params.action,
        before_value: params.beforeValue === undefined ? null : JSON.stringify(params.beforeValue),
        after_value: params.afterValue === undefined ? null : JSON.stringify(params.afterValue),
        reason: params.reason ?? null,
    })
        .execute();
}
function mapAuditLogRow(r) {
    return {
        logId: r.log_id,
        actorUserId: r.actor_user_id,
        action: r.action,
        beforeValue: typeof r.before_value === 'string' ? JSON.parse(r.before_value) : r.before_value,
        afterValue: typeof r.after_value === 'string' ? JSON.parse(r.after_value) : r.after_value,
        reason: r.reason,
        // Kysely's Selectable<> doesn't fully collapse Generated<ColumnType<...>>
        // for this column in inference (a type-level quirk, not a runtime one —
        // pg's driver genuinely returns a real Date for timestamptz columns; we
        // only override the numeric-OID parser in db/client.ts, not this one).
        createdAt: r.created_at,
    };
}
export async function listAuditLogForEntity(db, entityType, entityId) {
    const rows = await db
        .selectFrom('audit_log')
        .selectAll()
        .where('entity_type', '=', entityType)
        .where('entity_id', '=', entityId)
        .orderBy('created_at', 'asc')
        .execute();
    return rows.map(mapAuditLogRow);
}
