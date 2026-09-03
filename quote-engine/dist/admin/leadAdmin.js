// Five Star Conveyancing — lead admin service
// Read-only access to the leads captured on `quotes` (see
// db/repository.ts's listRecentLeads) for whoever holds 'leads:view' —
// currently super_admin and lead_management_user. This is the actual
// database-backed record of a lead; the Formspree notification the
// frontend also fires is a best-effort alert, not the record of truth.
import { getQuoteByReference, listRecentLeads, listRecentSdltCalculatorLeads, loadFirmsByIds, } from '../db/repository.js';
import { toPublicResult } from '../api/publicResult.js';
import { assertPermission } from './roles.js';
export async function listLeads(db, user, limit) {
    assertPermission(user, 'leads:view');
    return listRecentLeads(db, limit);
}
/** Leads from the standalone SDLT/LTT calculator — not tied to any quote. */
export async function listSdltCalculatorLeads(db, user, limit) {
    assertPermission(user, 'leads:view');
    return listRecentSdltCalculatorLeads(db, limit);
}
/** Full submission detail for one lead — the same information lookup-quote.ts prints, surfaced in the admin UI. */
export async function getLeadDetail(db, user, quoteReference) {
    assertPermission(user, 'leads:view');
    const quote = await getQuoteByReference(db, quoteReference);
    if (!quote)
        return null;
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
