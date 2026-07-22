// Five Star Conveyancing — GET /api/quotes/:reference handler
// Used both for the results page immediately after a quote is created, and
// as the target of the emailed "save quote" resume link (Stage 5 decision:
// no accounts, so the reference itself is the only thing a client holds).
import { getQuoteByReference, loadFirmsByIds, markQuoteExpired } from '../db/repository.js';
import { toPublicResult } from './publicResult.js';
function jsonResponse(body, status) {
    return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}
export async function getQuoteHandler(reference, db) {
    if (!reference || reference.trim().length === 0) {
        return jsonResponse({ error: { message: 'A quote reference is required.' } }, 400);
    }
    try {
        const quote = await getQuoteByReference(db, reference);
        if (!quote) {
            return jsonResponse({ error: { message: 'No quote was found for that reference.' } }, 404);
        }
        const isExpired = quote.status === 'expired' || quote.expiryAt.getTime() < Date.now();
        if (isExpired) {
            if (quote.status === 'active') {
                await markQuoteExpired(db, quote.quoteId); // lazy transition — no cron job required
            }
            // Per the Stage 5 UX decision: a clear explanation and a prompt to
            // start again, not stale figures presented as current.
            return jsonResponse({
                quoteReference: reference,
                transactionType: quote.transactionType,
                status: 'expired',
                message: 'This quote has expired. Fees may have changed — please generate a new comparison.',
            }, 200);
        }
        const firmsById = await loadFirmsByIds(db, quote.results.map((r) => r.firmId));
        return jsonResponse({
            quoteReference: reference,
            transactionType: quote.transactionType,
            status: quote.status,
            expiryAt: quote.expiryAt.toISOString(),
            results: quote.results.map((r) => toPublicResult(r, firmsById)),
        }, 200);
    }
    catch (err) {
        console.error('getQuoteHandler failed', err);
        return jsonResponse({ error: { message: 'Something went wrong retrieving that quote. Please try again.' } }, 500);
    }
}
