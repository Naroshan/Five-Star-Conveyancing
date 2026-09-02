import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AdminUser } from '../types.js';
import { type LeadSummary } from '../db/repository.js';
export declare function listLeads(db: Kysely<Database>, user: AdminUser, limit?: number): Promise<LeadSummary[]>;
