import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AdminUser, ClientAnswers, QuoteContact, TransactionType } from '../types.js';
import { type LeadSummary } from '../db/repository.js';
import { type PublicQuoteResult } from '../api/publicResult.js';
export declare function listLeads(db: Kysely<Database>, user: AdminUser, limit?: number): Promise<LeadSummary[]>;
export interface LeadDetail {
    quoteReference: string;
    transactionType: TransactionType;
    status: 'active' | 'expired' | 'converted';
    clientAnswers: ClientAnswers;
    contact: QuoteContact | null;
    results: PublicQuoteResult[];
}
/** Full submission detail for one lead — the same information lookup-quote.ts prints, surfaced in the admin UI. */
export declare function getLeadDetail(db: Kysely<Database>, user: AdminUser, quoteReference: string): Promise<LeadDetail | null>;
