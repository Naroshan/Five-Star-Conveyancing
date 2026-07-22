import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AuditAction } from '../types.js';
export interface RecordAuditEntryParams {
    actorUserId: string;
    entityType: string;
    entityId: string;
    action: AuditAction;
    beforeValue?: unknown;
    afterValue?: unknown;
    reason?: string;
}
export declare function recordAuditEntry(db: Kysely<Database>, params: RecordAuditEntryParams): Promise<void>;
export interface AuditLogEntry {
    logId: string;
    actorUserId: string;
    action: AuditAction;
    beforeValue: unknown;
    afterValue: unknown;
    reason: string | null;
    createdAt: Date;
}
export declare function listAuditLogForEntity(db: Kysely<Database>, entityType: string, entityId: string): Promise<AuditLogEntry[]>;
