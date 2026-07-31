"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useQuoteSubmit } from "@/lib/useQuoteSubmit";
import { TRANSACTION_TYPES, tenureIsFixedLeasehold } from "@/lib/transactionTypes";
import { ERROR, RADIUS } from "@/lib/theme";
import { SearchPostcodeIcon } from "./icons";
import styles from "./HeroQuoteWidget.module.css";
import type { TransactionType } from "five-star-conveyancing-quote-engine/types";

// MoneySuperMarket-style inline search bar: sits directly on the gradient
// (frosted glass, no boxed-off white card), not a separate floating panel.
// Collects the two fields that matter for a rough quote and defaults the
// rest to match get-a-quote/page.tsx's own initial state, so a widget
// submission and an untouched full-form submission produce an identical
// request body.
export function HeroQuoteWidget() {
  const { submit, submitting, error } = useQuoteSubmit();
  const [transactionType, setTransactionType] = useState<TransactionType>("purchase");
  const [postcode, setPostcode] = useState("");
  const [propertyValue, setPropertyValue] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit({
      transactionType,
      postcode,
      jurisdiction: "england",
      propertyValue: Number(propertyValue),
      freeholdOrLeasehold: tenureIsFixedLeasehold(transactionType) ? "leasehold" : "freehold",
      mortgageInvolved: true,
      flags: {},
    });
  }

  return (
    <div>
      <form onSubmit={handleSubmit} className={styles.bar} style={{ borderRadius: RADIUS.pill, padding: "4px 4px 4px 16px" }}>
        <label className={`${styles.field} ${styles.typeField}`}>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "oklch(1 0 0 / 0.65)" }}>
            What are you doing?
          </span>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as TransactionType)}
            className={styles.input}
            style={{ appearance: "none", cursor: "pointer", fontSize: 12, width: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap" }}
          >
            {TRANSACTION_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value} style={{ color: "black" }}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "oklch(1 0 0 / 0.65)" }}>
            Postcode
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <SearchPostcodeIcon size={13} color="oklch(1 0 0 / 0.55)" />
            <input
              required
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="SW1A 1AA"
              className={styles.input}
            />
          </div>
        </label>

        <label className={styles.field}>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: "oklch(1 0 0 / 0.65)" }}>
            Property value
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: "oklch(1 0 0 / 0.55)", fontWeight: 700, fontSize: 13 }}>£</span>
            <input
              required
              type="number"
              min={1}
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
              placeholder="350,000"
              className={styles.input}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className={styles.submit}
          style={{
            background: "white",
            color: "oklch(0.5 0.22 350)",
            fontWeight: 800,
            border: "none",
            borderRadius: RADIUS.pill,
            padding: "11px 20px",
            fontSize: 13,
            whiteSpace: "nowrap",
            opacity: submitting ? 0.7 : 1,
          }}
        >
          {submitting ? "Comparing…" : "Compare quotes →"}
        </button>
      </form>

      {error && (
        <p style={{ fontSize: 11.5, color: ERROR, background: "white", padding: "7px 12px", borderRadius: RADIUS.sm, margin: "8px 0 0", display: "inline-block" }}>
          {error}
        </p>
      )}

      <Link href="/get-a-quote" style={{ fontSize: 12, color: "oklch(1 0 0 / 0.75)", textDecoration: "underline", display: "inline-block", marginTop: 10 }}>
        Want to add mortgage or leasehold details? Use the full form
      </Link>
    </div>
  );
}
