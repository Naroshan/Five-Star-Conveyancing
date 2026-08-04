"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useQuoteSubmit } from "@/lib/useQuoteSubmit";
import { TRANSACTION_TYPES, tenureIsFixedLeasehold } from "@/lib/transactionTypes";
import { ERROR, NAVY, ACCENT_BOLD, TEXT_MUTED, BORDER } from "@/lib/theme";
import { SearchPostcodeIcon } from "./icons";
import styles from "./HeroQuoteWidget.module.css";
import type { TransactionType } from "five-star-conveyancing-quote-engine/types";

// White bordered search bar sitting on the light hero background (per the
// "Five Star - Home.dc.html" handoff). Collects the two fields that matter
// for a rough quote and defaults the rest to match get-a-quote/page.tsx's
// own initial state, so a widget submission and an untouched full-form
// submission produce an identical request body.
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
      <form onSubmit={handleSubmit} className={styles.bar} style={{ borderRadius: 999, padding: "4px 4px 4px 16px", background: "white", border: `1px solid ${BORDER}` }}>
        <label className={`${styles.field} ${styles.typeField}`}>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: TEXT_MUTED }}>
            What are you doing?
          </span>
          <select
            value={transactionType}
            onChange={(e) => setTransactionType(e.target.value as TransactionType)}
            className={styles.input}
            style={{ appearance: "none", cursor: "pointer", fontSize: 12, width: "100%", textOverflow: "ellipsis", overflow: "hidden", whiteSpace: "nowrap", color: NAVY }}
          >
            {TRANSACTION_TYPES.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.field}>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: TEXT_MUTED }}>
            Postcode
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <SearchPostcodeIcon size={13} color={TEXT_MUTED} />
            <input
              required
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="SW1A 1AA"
              className={styles.input}
              style={{ color: NAVY }}
            />
          </div>
        </label>

        <label className={`${styles.field} ${styles.valueField}`}>
          <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: TEXT_MUTED }}>
            Property value
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ color: TEXT_MUTED, fontWeight: 700, fontSize: 13 }}>£</span>
            <input
              required
              type="number"
              min={1}
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
              placeholder="350,000"
              className={styles.input}
              style={{ color: NAVY }}
            />
          </div>
        </label>

        <button
          type="submit"
          disabled={submitting}
          className={styles.submit}
          style={{
            background: ACCENT_BOLD,
            color: NAVY,
            fontWeight: 800,
            border: "none",
            borderRadius: 999,
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
        <p style={{ fontSize: 11.5, color: ERROR, background: "white", padding: "7px 12px", borderRadius: 8, margin: "8px 0 0", display: "inline-block" }}>
          {error}
        </p>
      )}

      <Link href="/get-a-quote" style={{ fontSize: 12, color: TEXT_MUTED, textDecoration: "underline", display: "inline-block", marginTop: 10 }}>
        Want to add mortgage or leasehold details? Use the full form
      </Link>
    </div>
  );
}
