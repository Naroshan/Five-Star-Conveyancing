// Five Star Conveyancing — loads one firm's result off an existing quote,
// reusing the same tested handler the results page itself calls, so PDF/email
// generation can never see a different shape of data than what's on screen.
import { getQuoteHandler } from "five-star-conveyancing-quote-engine/api/getQuote";
import type { PublicQuoteResult } from "five-star-conveyancing-quote-engine/api/publicResult";
import { db } from "@/lib/db";

export type LoadQuoteResultOutcome =
  | { error: string; status: number }
  | { quoteReference: string; result: PublicQuoteResult };

export async function loadQuoteResultForFirm(reference: string, firmId: string): Promise<LoadQuoteResultOutcome> {
  const response = await getQuoteHandler(reference, db);
  const data = await response.json();

  if (!response.ok) {
    return { error: data.error?.message ?? "Something went wrong loading that quote.", status: response.status };
  }
  if (data.status === "expired") {
    return { error: data.message ?? "This quote has expired.", status: 409 };
  }

  const result = (data.results as PublicQuoteResult[]).find((r) => r.firm.firmId === firmId);
  if (!result) {
    return { error: "That firm is not part of this quote.", status: 404 };
  }

  return { quoteReference: data.quoteReference, result };
}
