"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

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
  const router = useRouter();
  const [postcode, setPostcode] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [freeholdOrLeasehold, setFreeholdOrLeasehold] = useState<"freehold" | "leasehold">("freehold");
  const [mortgageInvolved, setMortgageInvolved] = useState(true);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggleFlag(key: string) {
    setFlags((prev) => ({ ...prev, [key]: !prev[key] }));
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const body = {
      transactionType: "purchase",
      postcode,
      jurisdiction: "england",
      propertyValue: Number(propertyValue),
      freeholdOrLeasehold,
      mortgageInvolved,
      flags: freeholdOrLeasehold === "leasehold" ? { ...flags, leasehold: true } : flags,
    };

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
      router.push(`/quote/results/${data.quoteReference}`);
    } catch {
      setError("Something went wrong reaching the quote service. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 560, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-heading)", marginBottom: 4 }}>Get a purchase quote</h1>
        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 24 }}>
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
            <p style={{ fontSize: 13, color: "var(--error)", background: "#FCEBEB", padding: "10px 12px", borderRadius: 6 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              background: "var(--accent)",
              color: "#EAF3EE",
              border: "none",
              borderRadius: 6,
              padding: "12px 20px",
              fontSize: 14,
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? "Comparing firms…" : "Compare quotes"}
          </button>
        </form>
      </main>
      <SiteFooter />
    </>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--text-heading)", marginBottom: 6 }}>
        {label}
      </label>
      {children}
    </div>
  );
}
