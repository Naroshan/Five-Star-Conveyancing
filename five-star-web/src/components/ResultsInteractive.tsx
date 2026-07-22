"use client";

import { useState } from "react";
import { QuoteResultsList } from "five-star-conveyancing-quote-engine/components/QuoteResults";
import type { PublicQuoteResult } from "five-star-conveyancing-quote-engine/api/publicResult";

export function ResultsInteractive({ results }: { results: PublicQuoteResult[] }) {
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Not wired to real functionality yet (no email delivery, no lead-capture
  // flow, no live chat) — gives visible feedback rather than doing nothing.
  function stubAction(action: string) {
    setActionMessage(`"${action}" isn't wired up yet in this build — see the project README.`);
    setTimeout(() => setActionMessage(null), 4000);
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
        onSelect={() => stubAction("Select this firm")}
        onEmailQuote={() => stubAction("Email quote")}
        onSaveQuote={() => stubAction("Save quote")}
        onSpeakToAdviser={() => stubAction("Speak to an adviser")}
      />
    </>
  );
}
