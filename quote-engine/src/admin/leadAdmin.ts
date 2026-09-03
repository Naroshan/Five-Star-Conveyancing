// Five Star Conveyancing — lead admin service
// Read-only access to the leads captured on `quotes` (see
// db/repository.ts's listRecentLeads) for whoever holds 'leads:view' —
// currently super_admin and lead_management_user. This is the actual
// database-backed record of a lead; the Formspree notification the
// frontend also fires is a best-effort alert, not the record of truth.

import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import type { AdminUser, ClientAnswers, QuoteContact, TransactionType } from '../types.js';
import {
  getQuoteByReference,
  listRecentLeads,
  listRecentSdltCalculatorLeads,
  loadFirmsByIds,
  type LeadSummary,
  type SdltCalculatorLeadSummary,
} from '../db/repository.js';
import { toPublicResult, type PublicQuoteResult } from '../api/publicResult.js';
import { assertPermission } from './roles.js';

export async function listLeads(db: Kysely<Database>, user: AdminUser, limit?: number): Promise<LeadSummary[]> {
  assertPermission(user, 'leads:view');
  return listRecentLeads(db, limit);
}

/** Leads from the standalone SDLT/LTT calculator — not tied to any quote. */
export async function listSdltCalculatorLeads(db: Kysely<Database>, user: AdminUser, limit?: number): Promise<SdltCalculatorLeadSummary[]> {
  assertPermission(user, 'leads:view');
  return listRecentSdltCalculatorLeads(db, limit);
}

export interface LeadDetail {
  quoteReference: string;
  transactionType: TransactionType;
  status: 'active' | 'expired' | 'converted';
  clientAnswers: ClientAnswers;
  contact: QuoteContact | null;
  results: PublicQuoteResult[];
}

/** Full submission detail for one lead — the same information lookup-quote.ts prints, surfaced in the admin UI. */
export async function getLeadDetail(db: Kysely<Database>, user: AdminUser, quoteReference: string): Promise<LeadDetail | null> {
  assertPermission(user, 'leads:view');

  const quote = await getQuoteByReference(db, quoteReference);
  if (!quote) return null;

  const firmsById = await loadFirmsByIds(db, quote.results.map((r) => r.firmId));

  return {
    quoteReference,
    transactionType: quote.transactionType,
    status: quote.status,
    clientAnswers: quote.clientAnswers,
    contact: quote.contact,
    results: quote.results.map((r) => toPublicResult(r, firmsById)),
  };
}
