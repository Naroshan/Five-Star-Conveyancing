// Five Star Conveyancing — POST /api/quotes handler
// Framework-agnostic: takes/returns standard Fetch API Request/Response
// objects so it drops directly into a Next.js App Router route handler
// (see nextjs-integration/ for the two-line wiring) without depending on
// Next.js as a package for testing.

import type { Kysely } from 'kysely';
import type { Database } from '../db/schema.js';
import { loadActiveFirmRuleSets, loadSdltBands, saveQuote, saveQuoteResults } from '../db/repository.js';
import { calculateQuotesForFirms } from '../quoteEngine.js';
import { validateClientAnswers } from './schemas.js';
import { generateQuoteReference } from './reference.js';
import type { RateLimiter } from './rateLimiter.js';
import { toPublicResult } from './publicResult.js';
import type { Firm } from '../types.js';

const DEFAULT_QUOTE_VALIDITY_DAYS = 30;
// Transaction types where a Stamp Duty Land Tax / Land Transaction Tax
// estimate is calculated. Transfer of equity and lease extension premiums
// can also attract SDLT/LTT in some circumstances — that eligibility logic
// isn't modelled yet, so those types deliberately don't get an estimate here
// rather than risk one that's silently wrong. Flagged in the README.
const SDLT_APPLICABLE_TRANSACTION_TYPES = new Set(['purchase', 'sale_and_purchase']);

export interface CreateQuoteDeps {
  db: Kysely<Database>;
  rateLimiter?: RateLimiter;
}

function jsonResponse(body: unknown, status: number): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });
}

export async function createQuoteHandler(request: Request, deps: CreateQuoteDeps): Promise<Response> {
  if (deps.rateLimiter) {
    const key = request.headers.get('x-forwarded-for')?.split(',')[0].trim() ?? 'unknown';
    if (!deps.rateLimiter.checkLimit(key)) {
      return jsonResponse({ error: { message: 'Too many requests. Please try again shortly.' } }, 429);
    }
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: { message: 'Request body must be valid JSON.' } }, 400);
  }

  const parsed = validateClientAnswers(body);
  if (!parsed.success) {
    return jsonResponse({ error: { message: 'Invalid quote request.', details: parsed.error.flatten() } }, 400);
  }
  const answers = parsed.data;

  try {
    const ruleSets = await loadActiveFirmRuleSets(deps.db, answers.transactionType);

    const sdltBands = SDLT_APPLICABLE_TRANSACTION_TYPES.has(answers.transactionType)
      ? await loadSdltBands(deps.db, answers.jurisdiction)
      : undefined;

    const results = calculateQuotesForFirms(ruleSets, answers, {
      sdltBands,
      jurisdiction: sdltBands ? answers.jurisdiction : undefined,
    });

    const eligibleFirms = ruleSets.filter((rs) => results.some((r) => r.firmId === rs.firm.firmId && r.eligibilityStatus === 'eligible'));
    const validityDays =
      eligibleFirms.length > 0
        ? Math.min(...eligibleFirms.map((f) => f.firm.quoteValidityDays))
        : DEFAULT_QUOTE_VALIDITY_DAYS;
    const expiryAt = new Date(Date.now() + validityDays * 24 * 60 * 60 * 1000);

    const quoteReference = generateQuoteReference();
    const quoteId = await saveQuote(deps.db, {
      quoteReference,
      transactionType: answers.transactionType,
      clientAnswers: answers,
      expiryAt,
    });
    await saveQuoteResults(deps.db, quoteId, results);

    const firmsById = new Map<string, Firm>(ruleSets.map((rs) => [rs.firm.firmId, rs.firm]));

    return jsonResponse(
      {
        quoteReference,
        transactionType: answers.transactionType,
        expiryAt: expiryAt.toISOString(),
        results: results.map((r) => toPublicResult(r, firmsById)),
      },
      201
    );
  } catch (err) {
    console.error('createQuoteHandler failed', err);
    return jsonResponse({ error: { message: 'Something went wrong generating your quote. Please try again.' } }, 500);
  }
}
