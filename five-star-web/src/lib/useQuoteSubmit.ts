"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { TransactionType } from "five-star-conveyancing-quote-engine/types";

export interface QuoteSubmitBody {
  transactionType: TransactionType;
  postcode: string;
  jurisdiction: "england";
  // Every transaction type except sale_and_purchase uses propertyValue;
  // sale_and_purchase uses the two leg fields instead — mirrors the API's
  // mutual-exclusivity validation (quote-engine/src/api/schemas.ts).
  propertyValue?: number;
  salePropertyValue?: number;
  purchasePropertyValue?: number;
  freeholdOrLeasehold: "freehold" | "leasehold";
  mortgageInvolved: boolean;
  flags: Record<string, boolean>;
  // Optional here — the homepage's condensed widget doesn't collect contact
  // details up front, only the full get-a-quote form does. Either way this
  // is what actually persists the lead's contact details in the database
  // (see quote-engine/src/api/createQuote.ts); it's not just for notification.
  contact?: { name: string; email: string; phone: string };
}

// Shared by the full get-a-quote form and the homepage hero widget — both
// POST the same shape to /api/quotes and redirect to the results page on
// success, so the fetch/error-handling logic lives here once.
export function useQuoteSubmit() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // recoveryEmail is deliberately separate from `contact` on QuoteSubmitBody
  // — that's a name+email+phone lead, required all together. This is an
  // optional, email-only "send me a link to these quotes" convenience,
  // handled by its own endpoint rather than createQuote's contact
  // validation (which would reject an email with no name/phone).
  async function submit(body: QuoteSubmitBody, recoveryEmail?: string) {
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.error?.message ?? "Something went wrong. Please check your answers and try again.");
        setSubmitting(false);
        return;
      }
      if (recoveryEmail) {
        fetch(`/api/quotes/${data.quoteReference}/email-results`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ email: recoveryEmail }),
        }).catch(() => {});
      }
      router.push(`/quote/results/${data.quoteReference}`);
    } catch {
      setError("Something went wrong reaching the quote service. Please try again.");
      setSubmitting(false);
    }
  }

  return { submit, submitting, error };
}
