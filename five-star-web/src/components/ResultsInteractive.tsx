"use client";

import { useState } from "react";
import { QuoteResultsList } from "five-star-conveyancing-quote-engine/components/QuoteResults";
import type { PublicQuoteResult } from "five-star-conveyancing-quote-engine/api/publicResult";

export function ResultsInteractive({ quoteReference, results }: { quoteReference: string; results: PublicQuoteResult[] }) {
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedFirmId, setSelectedFirmId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);

  // Not wired to real functionality yet (no email delivery, no live chat) —
  // gives visible feedback rather than doing nothing. Unlike "Select this
  // firm" below, these genuinely need an email provider account this build
  // doesn't have credentials for.
  function stubAction(action: string) {
    setActionMessage(`"${action}" isn't wired up yet in this build — see the project README.`);
    setTimeout(() => setActionMessage(null), 4000);
  }

  async function handleSelect(firmId: string) {
    if (isSelecting || selectedFirmId) return;
    setIsSelecting(true);
    setActionMessage(null);
    try {
      const response = await fetch(`/api/quotes/${quoteReference}/select`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firmId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setActionMessage(data.error?.message ?? "Something went wrong recording your selection. Please try again.");
        return;
      }
      setSelectedFirmId(firmId);
      setActionMessage("Thanks — we've passed your details to this firm. They'll be in touch shortly.");
    } catch {
      setActionMessage("Something went wrong recording your selection. Please try again.");
    } finally {
      setIsSelecting(false);
    }
  }

  return (
    <>
      {actionMessage && (
        <p
          style={{
            fontSize: 13,
            background: "var(--off-white)",
            border: "0.5px solid var(--border)",
            borderRadius: 6,
            padding: "10px 12px",
            marginBottom: 16,
          }}
        >
          {actionMessage}
        </p>
      )}
      <QuoteResultsList
        results={results}
        onSelect={handleSelect}
        onEmailQuote={() => stubAction("Email quote")}
        onSaveQuote={() => stubAction("Save quote")}
        onSpeakToAdviser={() => stubAction("Speak to an adviser")}
      />
    </>
  );
}
