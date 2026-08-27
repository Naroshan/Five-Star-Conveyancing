"use client";

import { useState } from "react";
import { HeroQuoteWidget } from "./HeroQuoteWidget";
import { SdltCalculator } from "./SdltCalculator";
import { TEAL, TEXT_MUTED, BORDER, RADIUS, SHADOW } from "@/lib/theme";

type Tab = "quote" | "sdlt";

export function HeroTabs() {
  const [tab, setTab] = useState<Tab>("quote");

  return (
    <div>
      <div
        role="tablist"
        style={{
          display: "inline-flex",
          gap: 4,
          background: "white",
          border: `1px solid ${BORDER}`,
          borderRadius: RADIUS.pill,
          padding: 4,
          marginBottom: 14,
        }}
      >
        <button
          type="button"
          role="tab"
          aria-selected={tab === "quote"}
          onClick={() => setTab("quote")}
          style={{
            border: "none",
            borderRadius: RADIUS.pill,
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            background: tab === "quote" ? TEAL : "transparent",
            color: tab === "quote" ? "white" : TEXT_MUTED,
          }}
        >
          Get a quote
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "sdlt"}
          onClick={() => setTab("sdlt")}
          style={{
            border: "none",
            borderRadius: RADIUS.pill,
            padding: "8px 18px",
            fontSize: 13,
            fontWeight: 700,
            cursor: "pointer",
            background: tab === "sdlt" ? TEAL : "transparent",
            color: tab === "sdlt" ? "white" : TEXT_MUTED,
          }}
        >
          Stamp Duty calculator
        </button>
      </div>

      {tab === "quote" ? (
        <HeroQuoteWidget />
      ) : (
        <div style={{ borderRadius: RADIUS.lg, padding: 16, background: "white", border: `1px solid ${BORDER}`, boxShadow: SHADOW.md, textAlign: "left" }}>
          <SdltCalculator compact />
        </div>
      )}
    </div>
  );
}
