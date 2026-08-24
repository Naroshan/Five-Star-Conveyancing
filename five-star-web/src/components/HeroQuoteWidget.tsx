"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import { useQuoteSubmit } from "@/lib/useQuoteSubmit";
import { TRANSACTION_TYPES, tenureIsFixedLeasehold } from "@/lib/transactionTypes";
import { ERROR, NAVY, TEAL, GRADIENT_CTA, TEXT_MUTED, TEXT_HEADING, BORDER, ICON_BADGE_BG, RADIUS, SHADOW } from "@/lib/theme";
import { SearchPostcodeIcon, ChevronDownIcon } from "./icons";
import styles from "./HeroQuoteWidget.module.css";
import type { TransactionType } from "five-star-conveyancing-quote-engine/types";

// White bordered search card sitting on the light hero background (per the
// "Five Star - Home.dc.html" handoff). Collects the two fields that matter
// for a rough quote and defaults the rest to match get-a-quote/page.tsx's
// own initial state, so a widget submission and an untouched full-form
// submission produce an identical request body.
export function HeroQuoteWidget() {
  const { submit, submitting, error } = useQuoteSubmit();
  const [transactionType, setTransactionType] = useState<TransactionType>("purchase");
  const [postcode, setPostcode] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [salePropertyValue, setSalePropertyValue] = useState("");
  const [purchasePropertyValue, setPurchasePropertyValue] = useState("");
  const isSaleAndPurchase = transactionType === "sale_and_purchase";
  const [typeMenuOpen, setTypeMenuOpen] = useState(false);
  const typeFieldRef = useRef<HTMLDivElement>(null);

  const selectedType = TRANSACTION_TYPES.find((opt) => opt.value === transactionType) ?? TRANSACTION_TYPES[0];

  useEffect(() => {
    if (!typeMenuOpen) return;
    function onClickOutside(e: MouseEvent) {
      if (typeFieldRef.current && !typeFieldRef.current.contains(e.target as Node)) setTypeMenuOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setTypeMenuOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [typeMenuOpen]);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit({
      transactionType,
      postcode,
      jurisdiction: "england",
      ...(isSaleAndPurchase
        ? { salePropertyValue: Number(salePropertyValue), purchasePropertyValue: Number(purchasePropertyValue) }
        : { propertyValue: Number(propertyValue) }),
      freeholdOrLeasehold: tenureIsFixedLeasehold(transactionType) ? "leasehold" : "freehold",
      mortgageInvolved: true,
      flags: {},
    });
  }

  return (
    <div>
      <form
        onSubmit={handleSubmit}
        className={styles.card}
        style={{ borderRadius: RADIUS.lg, padding: 10, background: "white", border: `1px solid ${BORDER}`, boxShadow: SHADOW.md }}
      >
        <div className={styles.fieldsRow}>
          <div ref={typeFieldRef} className={`${styles.field} ${styles.typeField}`} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setTypeMenuOpen((v) => !v)}
              aria-haspopup="listbox"
              aria-expanded={typeMenuOpen}
              className={styles.typeButton}
            >
              <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: TEXT_MUTED, display: "block" }}>
                What are you doing?
              </span>
              <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: NAVY, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedType.label}
                </span>
                <ChevronDownIcon size={13} color={TEXT_MUTED} className={typeMenuOpen ? styles.chevronOpen : undefined} />
              </span>
            </button>

            {typeMenuOpen && (
              <div role="listbox" className={styles.typeMenu} style={{ borderRadius: RADIUS.md, border: `1px solid ${BORDER}`, boxShadow: SHADOW.lg }}>
                {TRANSACTION_TYPES.map((opt) => {
                  const active = opt.value === transactionType;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      role="option"
                      aria-selected={active}
                      onClick={() => {
                        setTransactionType(opt.value);
                        setTypeMenuOpen(false);
                      }}
                      className={styles.typeOption}
                      style={active ? { background: ICON_BADGE_BG, color: TEAL } : { color: TEXT_HEADING }}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

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

          {isSaleAndPurchase ? (
            <>
              <label className={`${styles.field} ${styles.valueField}`}>
                <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: TEXT_MUTED }}>
                  Sale Price
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: TEXT_MUTED, fontWeight: 700, fontSize: 13 }}>£</span>
                  <input
                    required
                    type="number"
                    min={1}
                    value={salePropertyValue}
                    onChange={(e) => setSalePropertyValue(e.target.value)}
                    placeholder="300,000"
                    className={styles.input}
                    style={{ color: NAVY }}
                  />
                </div>
              </label>
              <label className={`${styles.field} ${styles.valueField}`}>
                <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: TEXT_MUTED }}>
                  Purchase Price
                </span>
                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ color: TEXT_MUTED, fontWeight: 700, fontSize: 13 }}>£</span>
                  <input
                    required
                    type="number"
                    min={1}
                    value={purchasePropertyValue}
                    onChange={(e) => setPurchasePropertyValue(e.target.value)}
                    placeholder="350,000"
                    className={styles.input}
                    style={{ color: NAVY }}
                  />
                </div>
              </label>
            </>
          ) : (
            <label className={`${styles.field} ${styles.valueField}`}>
              <span style={{ fontSize: 9, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.08em", color: TEXT_MUTED }}>
                {transactionType === "purchase" ? "Purchase Price" : transactionType === "sale" ? "Sale Price" : "Property value"}
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
          )}
        </div>

        <button
          type="submit"
          disabled={submitting}
          className={`${styles.submit} cta-button`}
          style={{
            background: GRADIENT_CTA,
            color: NAVY,
            fontWeight: 800,
            border: "none",
            borderRadius: RADIUS.md,
            padding: "14px 20px",
            fontSize: 14,
            width: "100%",
            marginTop: 8,
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
