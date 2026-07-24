// Five Star Conveyancing — POST /api/quotes/:reference/select handler
// "Select this firm" lead handoff: records which firm the client picked off
// their results. Framework-agnostic, same shape as createQuote.ts/getQuote.ts.

import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import { getQuoteByReference, selectQuoteFirm } from '../db/repository.js';

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

export async function selectFirmHandler(reference: string, request: Request, db: Kysely<Database>): Promise<Response> {
  if (!reference || reference.trim().length === 0) {
    return jsonResponse({ error: { message: 'A quote reference is required.' } }, 400);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: { message: 'Request body must be valid JSON.' } }, 400);
  }

  const firmId = (body as { firmId?: unknown } | null)?.firmId;
  if (typeof firmId !== 'string' || firmId.trim().length === 0) {
    return jsonResponse({ error: { message: 'firmId is required.' } }, 400);
  }

  try {
    const quote = await getQuoteByReference(db, reference);
    if (!quote) {
      return jsonResponse({ error: { message: 'No quote was found for that reference.' } }, 404);
    }

    if (quote.status !== 'active' || quote.expiryAt.getTime() < Date.now()) {
      return jsonResponse({ error: { message: 'This quote is no longer active and a firm can no longer be selected from it.' } }, 409);
    }

    const eligibleResult = quote.results.find((r) => r.firmId === firmId && r.eligibilityStatus === 'eligible');
    if (!eligibleResult) {
      return jsonResponse({ error: { message: 'That firm is not an eligible option on this quote.' } }, 400);
    }

    const { updated } = await selectQuoteFirm(db, quote.quoteId, firmId);
    if (!updated) {
      // Lost a race with another request (e.g. two tabs) between the checks
      // above and the update — same outward meaning as the active-check above.
      return jsonResponse({ error: { message: 'This quote is no longer active and a firm can no longer be selected from it.' } }, 409);
    }

    // Not wired up yet: once an email delivery provider is connected, notify
    // the selected firm of the new lead here. Tracked in the launch checklist
    // under "Email sending, for real — ... lead notification to firms".
    console.log(`Lead handoff recorded: quote ${reference} selected firm ${firmId}. Firm notification pending an email provider.`);

    return jsonResponse({ quoteReference: reference, selectedFirmId: firmId, status: 'converted' }, 200);
  } catch (err) {
    console.error('selectFirmHandler failed', err);
    return jsonResponse({ error: { message: 'Something went wrong recording your selection. Please try again.' } }, 500);
  }
}
