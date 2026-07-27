"use client";

import { useState, type FormEvent } from "react";
import { useQuoteSubmit } from "@/lib/useQuoteSubmit";
import { NAVY, TEXT_HEADING, TEXT_MUTED, ACCENT_BOLD, BORDER, GRADIENT_CTA, ERROR, RADIUS, SHADOW, display } from "@/lib/theme";
import type { TransactionType } from "five-star-conveyancing-quote-engine/types";

interface TransactionTypeOption {
  value: TransactionType;
  label: string;
  /** Used for both the H1 ("Get a ... quote") and the button copy. */
  noun: string;
}

const TRANSACTION_TYPES: TransactionTypeOption[] = [
  { value: "purchase", label: "Purchase", noun: "purchase" },
  { value: "sale", label: "Sale", noun: "sale" },
  { value: "sale_and_purchase", label: "Sale and purchase", noun: "sale and purchase" },
  { value: "remortgage", label: "Remortgage", noun: "remortgage" },
  { value: "transfer_of_equity", label: "Transfer of equity", noun: "transfer of equity" },
  { value: "lease_extension", label: "Lease extension", noun: "lease extension" },
];

const FLAG_OPTIONS: { key: string; label: string }[] = [
  { key: "buyToLet", label: "Buy-to-let purchase" },
  { key: "sharedOwnership", label: "Shared ownership" },
  { key: "helpToBuy", label: "Help to Buy" },
  { key: "rightToBuy", label: "Right to Buy" },
  { key: "islamicFinance", label: "Islamic (Sharia-compliant) finance" },
];

// Buying-scheme flags only make sense when you're the one buying.
const PURCHASE_ONLY_FLAG_KEYS = new Set(["buyToLet", "sharedOwnership", "helpToBuy", "rightToBuy", "islamicFinance"]);

function flagOptionsFor(transactionType: TransactionType): { key: string; label: string }[] {
  if (transactionType === "purchase" || transactionType === "sale_and_purchase") return FLAG_OPTIONS;
  return FLAG_OPTIONS.filter((opt) => !PURCHASE_ONLY_FLAG_KEYS.has(opt.key));
}

// A remortgage is, by definition, taking out a new mortgage — no need to ask.
function showsMortgageField(transactionType: TransactionType): boolean {
  return transactionType !== "remortgage";
}

function mortgageLabelFor(transactionType: TransactionType): string {
  if (transactionType === "sale") return "Yes, I have an existing mortgage to pay off";
  return "Yes, I'm using a mortgage";
}

export function GetAQuoteForm({ initialTransactionType }: { initialTransactionType: TransactionType }) {
  const { submit, submitting, error } = useQuoteSubmit();
  const [transactionType, setTransactionType] = useState<TransactionType>(initialTransactionType);
  const [postcode, setPostcode] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [freeholdOrLeasehold, setFreeholdOrLeasehold] = useState<"freehold" | "leasehold">("freehold");
  const [mortgageInvolved, setMortgageInvolved] = useState(true);
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  const activeType = TRANSACTION_TYPES.find((t) => t.value === transactionType) ?? TRANSACTION_TYPES[0];
  const availableFlags = flagOptionsFor(transactionType);

  function toggleFlag(key: string) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit({
      transactionType,
      postcode,
      jurisdiction: "england",
      propertyValue: Number(propertyValue),
      freeholdOrLeasehold,
      mortgageInvolved: showsMortgageField(transactionType) ? mortgageInvolved : true,
      flags: freeholdOrLeasehold === "leasehold" ? { ...flags, leasehold: true } : flags,
    });
  }

  return (
    <div style={{ background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.lg, overflow: "hidden" }}>
      <div style={{ height: 6, background: GRADIENT_CTA }} />
      <div style={{ padding: "40px 40px 44px" }}>
        <h1 style={{ ...display, fontSize: 30, fontWeight: 600, color: NAVY, marginBottom: 8, letterSpacing: "-0.01em" }}>
          Get a {activeType.noun} quote
        </h1>
        <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 32 }}>
          A few questions about the property, then we&apos;ll show you a real comparison.
        </p>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <Field label="What are you doing?">
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {TRANSACTION_TYPES.map((opt) => {
                const selected = opt.value === transactionType;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setTransactionType(opt.value)}
                    aria-pressed={selected}
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      padding: "8px 14px",
                      borderRadius: RADIUS.pill,
                      border: `1.5px solid ${selected ? ACCENT_BOLD : BORDER}`,
                      background: selected ? ACCENT_BOLD : "white",
                      color: selected ? "white" : TEXT_HEADING,
                      cursor: "pointer",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Property postcode">
            <input
              required
              value={postcode}
              onChange={(e) => setPostcode(e.target.value)}
              placeholder="e.g. SW1A 1AA"
              style={{ width: "100%" }}
            />
          </Field>

          <Field label="Property value (£)">
            <input
              required
              type="number"
              min={1}
              value={propertyValue}
              onChange={(e) => setPropertyValue(e.target.value)}
              placeholder="e.g. 350000"
              style={{ width: "100%" }}
            />
          </Field>

          <Field label="Freehold or leasehold?">
            <div style={{ display: "flex", gap: 16 }}>
              <label style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name="tenure"
                  checked={freeholdOrLeasehold === "freehold"}
                  onChange={() => setFreeholdOrLeasehold("freehold")}
                />
                Freehold
              </label>
              <label style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="radio"
                  name="tenure"
                  checked={freeholdOrLeasehold === "leasehold"}
                  onChange={() => setFreeholdOrLeasehold("leasehold")}
                />
                Leasehold
              </label>
            </div>
          </Field>

          {showsMortgageField(transactionType) && (
            <Field label="Is a mortgage involved?">
              <label style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                <input type="checkbox" checked={mortgageInvolved} onChange={(e) => setMortgageInvolved(e.target.checked)} />
                {mortgageLabelFor(transactionType)}
              </label>
            </Field>
          )}

          <Field label="Does anything else apply? (optional)">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {[...availableFlags, { key: "buildingSafetyAct", label: "Building Safety Act applies (some higher-risk buildings)" }, { key: "unregisteredTitle", label: "Property title is not yet registered" }].map(
                (opt) => (
                  <label key={opt.key} style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                    <input type="checkbox" checked={!!flags[opt.key]} onChange={() => toggleFlag(opt.key)} />
                    {opt.label}
                  </label>
                )
              )}
            </div>
          </Field>

          {error && (
            <p style={{ fontSize: 13, color: ERROR, background: "oklch(0.95 0.03 25)", padding: "10px 12px", borderRadius: RADIUS.sm }}>
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
            {submitting ? "Comparing firms…" : "Compare quotes"}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT_HEADING, marginBottom: 8 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
