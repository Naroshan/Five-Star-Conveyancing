"use client";

import { useState, type FormEvent } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { useQuoteSubmit } from "@/lib/useQuoteSubmit";
import { NAVY, CREAM, TEXT_HEADING, TEXT_MUTED, GRADIENT_CTA, ERROR, RADIUS, SHADOW, display } from "@/lib/theme";

const FLAG_OPTIONS: { key: string; label: string }[] = [
  { key: "buyToLet", label: "Buy-to-let purchase" },
  { key: "sharedOwnership", label: "Shared ownership" },
  { key: "helpToBuy", label: "Help to Buy" },
  { key: "rightToBuy", label: "Right to Buy" },
  { key: "islamicFinance", label: "Islamic (Sharia-compliant) finance" },
  { key: "buildingSafetyAct", label: "Building Safety Act applies (some higher-risk buildings)" },
  { key: "unregisteredTitle", label: "Property title is not yet registered" },
];

export default function GetAQuotePage() {
  const { submit, submitting, error } = useQuoteSubmit();
  const [postcode, setPostcode] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [freeholdOrLeasehold, setFreeholdOrLeasehold] = useState<"freehold" | "leasehold">("freehold");
  const [mortgageInvolved, setMortgageInvolved] = useState(true);
  const [flags, setFlags] = useState<Record<string, boolean>>({});

  function toggleFlag(key: string) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    submit({
      transactionType: "purchase",
      postcode,
      jurisdiction: "england",
      propertyValue: Number(propertyValue),
      freeholdOrLeasehold,
      mortgageInvolved,
      flags: freeholdOrLeasehold === "leasehold" ? { ...flags, leasehold: true } : flags,
    });
  }

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 640, margin: "0 auto", padding: "56px 24px 80px", background: CREAM }}>
        <div style={{ background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.lg, overflow: "hidden" }}>
          <div style={{ height: 6, background: GRADIENT_CTA }} />
          <div style={{ padding: "40px 40px 44px" }}>
            <h1 style={{ ...display, fontSize: 30, fontWeight: 600, color: NAVY, marginBottom: 8, letterSpacing: "-0.01em" }}>
              Get a purchase quote
            </h1>
            <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 32 }}>
              A few questions about the property, then we&apos;ll show you a real comparison.
            </p>

            <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
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

              <Field label="Is a mortgage involved?">
                <label style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 6 }}>
                  <input type="checkbox" checked={mortgageInvolved} onChange={(e) => setMortgageInvolved(e.target.checked)} />
                  Yes, I&apos;m using a mortgage
                </label>
              </Field>

              <Field label="Does anything else apply? (optional)">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {FLAG_OPTIONS.map((opt) => (
                    <label key={opt.key} style={{ fontSize: 14, display: "flex", alignItems: "center", gap: 8 }}>
                      <input type="checkbox" checked={!!flags[opt.key]} onChange={() => toggleFlag(opt.key)} />
                      {opt.label}
                    </label>
                  ))}
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
      </main>
      <SiteFooter />
    </>
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
