"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useQuoteSubmit } from "@/lib/useQuoteSubmit";
import { NAVY, TEXT_HEADING, TEXT_MUTED, GRADIENT_CTA, ERROR, RADIUS, SHADOW } from "@/lib/theme";
import { SearchPostcodeIcon } from "./icons";
import styles from "./HeroQuoteWidget.module.css";

// The Konnect-You pattern: the comparison tool lives in the hero itself,
// not just a link to it. Collects the two fields that matter for a rough
// quote and defaults the rest to match get-a-quote/page.tsx's own initial
// state, so a widget submission and an untouched full-form submission
// produce an identical request body.
export function HeroQuoteWidget() {
  const { submit, submitting, error } = useQuoteSubmit();
  const [postcode, setPostcode] = useState("");
  const [propertyValue, setPropertyValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit({
      transactionType: "purchase",
      postcode,
      jurisdiction: "england",
      propertyValue: Number(propertyValue),
      freeholdOrLeasehold: "freehold",
      mortgageInvolved: true,
      flags: {},
    });
  }

  return (
    <div style={{ background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.lg, padding: 28 }}>
      <p style={{ fontWeight: 800, fontSize: 15, color: NAVY, margin: "0 0 16px" }}>Get your quotes in 60 seconds</p>
      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <div className={styles.row} style={{ display: "grid", gap: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_HEADING }}>
            Postcode
            <div style={{ position: "relative", marginTop: 6 }}>
              <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: TEXT_MUTED, display: "flex" }}>
                <SearchPostcodeIcon size={16} />
              </span>
              <input
                required
                value={postcode}
                onChange={(e) => setPostcode(e.target.value)}
                placeholder="SW1A 1AA"
                style={{ width: "100%", paddingLeft: 34 }}
              />
            </div>
          </label>
          <label style={{ fontSize: 12, fontWeight: 700, color: TEXT_HEADING }}>
            Property value (£)
            <input
              required
              type="number"
              min={1}
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
              placeholder="350000"
              style={{ width: "100%", marginTop: 6 }}
            />
          </label>
        </div>

        {error && (
          <p style={{ fontSize: 12.5, color: ERROR, background: "oklch(0.95 0.03 25)", padding: "8px 10px", borderRadius: RADIUS.sm, margin: 0 }}>
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting}
          style={{
            background: GRADIENT_CTA,
            boxShadow: SHADOW.md,
            color: "white",
            fontWeight: 800,
            border: "none",
            borderRadius: RADIUS.pill,
            padding: "14px 20px",
            fontSize: 15,
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Comparing firms…" : "Compare quotes →"}
        </button>

        <Link href="/get-a-quote" style={{ fontSize: 12, color: TEXT_MUTED, textAlign: "center", textDecoration: "underline" }}>
          Want to add mortgage or leasehold details? Use the full form
        </Link>
      </form>
    </div>
  );
}
