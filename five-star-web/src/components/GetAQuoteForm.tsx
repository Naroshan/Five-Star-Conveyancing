"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useQuoteSubmit } from "@/lib/useQuoteSubmit";
import { getServiceType } from "@/lib/serviceTypes";
import { TRANSACTION_TYPES, tenureIsFixedLeasehold } from "@/lib/transactionTypes";
import {
  NAVY,
  TEXT_HEADING,
  TEXT_MUTED,
  TEXT_BODY,
  ACCENT_BOLD,
  BORDER,
  GRADIENT_CTA,
  GRADIENT_TEAL,
  ERROR,
  RADIUS,
  SHADOW,
  display,
} from "@/lib/theme";
import { UserIcon, MailIcon, PhoneIcon, CheckCircleIcon } from "@/components/icons";
import { registerQuoteExitGuard, clearQuoteExitGuard } from "@/lib/quoteExitGuard";
import styles from "./GetAQuoteForm.module.css";
import type { TransactionType } from "five-star-conveyancing-quote-engine/types";

// Formspree form ID for lead notifications — same form used by the Contact
// page (ContactForm.tsx) and by firm selection (ResultsInteractive.tsx); all
// submissions across the site are intentionally consolidated into this one
// form. Firing it here too, right at quote generation, means a lead is
// captured even if the visitor never gets as far as selecting a specific firm.
const LEAD_NOTIFY_FORM_ID = "xjgnakev";

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
  const base = transactionType === "purchase" || transactionType === "sale_and_purchase"
    ? FLAG_OPTIONS
    : FLAG_OPTIONS.filter((opt) => !PURCHASE_ONLY_FLAG_KEYS.has(opt.key));
  return [...base, { key: "buildingSafetyAct", label: "Building Safety Act applies (some higher-risk buildings)" }, { key: "unregisteredTitle", label: "Property title is not yet registered" }];
}

// A remortgage is, by definition, taking out a new mortgage — no need to ask.
function showsMortgageField(transactionType: TransactionType): boolean {
  return transactionType !== "remortgage";
}

function mortgageLabelFor(transactionType: TransactionType): string {
  if (transactionType === "sale") return "Is there an existing mortgage to pay off with the sale proceeds?";
  return "Is a mortgage involved?";
}

const STEPS = ["Service", "Property", "Contact", "Matches"] as const;
type StepName = (typeof STEPS)[number];

export function GetAQuoteForm({ initialTransactionType }: { initialTransactionType: TransactionType }) {
  const { submit, submitting, error } = useQuoteSubmit();
  const [stepIndex, setStepIndex] = useState(0);
  const [transactionType, setTransactionType] = useState<TransactionType>(initialTransactionType);
  const [postcode, setPostcode] = useState("");
  const [propertyValue, setPropertyValue] = useState("");
  const [freeholdOrLeasehold, setFreeholdOrLeasehold] = useState<"freehold" | "leasehold">(
    tenureIsFixedLeasehold(initialTransactionType) ? "leasehold" : "freehold"
  );
  const [mortgageInvolved, setMortgageInvolved] = useState(true);
  const [flags, setFlags] = useState<Record<string, boolean>>({});
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");

  const availableFlags = flagOptionsFor(transactionType);
  const tenureFixed = tenureIsFixedLeasehold(transactionType);
  const currentStep: StepName = STEPS[stepIndex];

  function resetToStart() {
    setStepIndex(0);
    setTransactionType(initialTransactionType);
    setPostcode("");
    setPropertyValue("");
    setFreeholdOrLeasehold(tenureIsFixedLeasehold(initialTransactionType) ? "leasehold" : "freehold");
    setMortgageInvolved(true);
    setFlags({});
    setName("");
    setEmail("");
    setPhone("");
  }

  // Warns before the header's "Get a quote" link resets progress —
  // registered only once the visitor has moved past the first step, since
  // that's the point at which navigating away would actually lose something.
  useEffect(() => {
    if (stepIndex === 0) {
      clearQuoteExitGuard();
      return;
    }
    registerQuoteExitGuard({
      confirmMessage: "You're partway through getting a quote. Are you sure you want to end this and start over?",
      reset: resetToStart,
    });
    return () => clearQuoteExitGuard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stepIndex]);

  function toggleFlag(key: string, value: boolean) {
    setFlags((prev) => ({ ...prev, [key]: value }));
  }

  function selectTransactionType(next: TransactionType) {
    setTransactionType(next);
    if (tenureIsFixedLeasehold(next)) setFreeholdOrLeasehold("leasehold");
  }

  function goToStep(e: FormEvent, index: number) {
    e.preventDefault();
    setStepIndex(index);
  }

  async function handleFinalSubmit(e: FormEvent) {
    e.preventDefault();

    // Best-effort lead notification — doesn't block quote generation below,
    // which is the part that actually has to succeed.
    fetch(`https://formspree.io/f/${LEAD_NOTIFY_FORM_ID}`, {
      method: "POST",
      headers: { "content-type": "application/json", accept: "application/json" },
      body: JSON.stringify({ name, email, phone, transactionType, postcode, propertyValue }),
    }).catch(() => {});

    const mortgageFlag = showsMortgageField(transactionType) ? mortgageInvolved : true;
    const submittedFlags = { ...flags };
    if (freeholdOrLeasehold === "leasehold") submittedFlags.leasehold = true;
    // Mirrored into flags (in addition to the top-level field below) because
    // fee-rule/disbursement triggers can only key off answers.flags, not
    // top-level ClientAnswers fields — e.g. Ackroyd Legal's Mortgage
    // Administration Fee supplement triggers on flags.mortgageInvolved.
    if (mortgageFlag) submittedFlags.mortgageInvolved = true;

    await submit({
      transactionType,
      postcode,
      jurisdiction: "england",
      propertyValue: Number(propertyValue),
      freeholdOrLeasehold,
      mortgageInvolved: mortgageFlag,
      flags: submittedFlags,
    });
  }

  return (
    <div style={{ background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.lg, overflow: "hidden" }}>
      <div style={{ height: 6, background: GRADIENT_CTA }} />
      <div style={{ padding: "28px 32px 34px" }}>
        <StepIndicator steps={STEPS} activeIndex={stepIndex} />

        {currentStep === "Service" && (
          <form onSubmit={(e) => goToStep(e, 1)} style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 28 }}>
            <div>
              <h1 style={{ ...display, fontSize: 26, fontWeight: 600, color: NAVY, marginBottom: 8, letterSpacing: "-0.01em" }}>
                Find verified conveyancing firms
              </h1>
              <p style={{ fontSize: 14, color: TEXT_MUTED, margin: 0 }}>What are you doing?</p>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {TRANSACTION_TYPES.map((opt) => {
                const selected = opt.value === transactionType;
                const service = getServiceType(opt.value.replaceAll("_", "-"));
                return (
                  <label
                    key={opt.value}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 14,
                      border: `1.5px solid ${selected ? ACCENT_BOLD : BORDER}`,
                      background: selected ? "oklch(0.97 0.02 350)" : "white",
                      borderRadius: RADIUS.md,
                      padding: "14px 18px",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="radio"
                      name="transactionType"
                      checked={selected}
                      onChange={() => selectTransactionType(opt.value)}
                    />
                    <div>
                      <p style={{ fontSize: 14.5, fontWeight: 700, color: TEXT_HEADING, margin: 0 }}>{opt.label}</p>
                      {service && <p style={{ fontSize: 12.5, color: TEXT_MUTED, margin: "2px 0 0" }}>{service.short}</p>}
                    </div>
                  </label>
                );
              })}
            </div>

            <StepSubmitButton>Continue</StepSubmitButton>
          </form>
        )}

        {currentStep === "Property" && (
          <form onSubmit={(e) => goToStep(e, 2)} style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 28 }}>
            <h2 style={{ ...display, fontSize: 22, fontWeight: 600, color: NAVY, margin: 0 }}>
              About the property{transactionType === "sale" ? " you're selling" : transactionType === "purchase" ? " you're buying" : ""}
            </h2>

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

            {tenureFixed ? (
              <Field label="Tenure">
                <p style={{ fontSize: 14, color: TEXT_MUTED, margin: 0 }}>Leasehold (a lease extension is always on a leasehold property)</p>
              </Field>
            ) : (
              <Field label="Is the property freehold or leasehold?">
                <ButtonRow
                  options={[{ value: "freehold", label: "Freehold" }, { value: "leasehold", label: "Leasehold" }]}
                  value={freeholdOrLeasehold}
                  onChange={(v) => setFreeholdOrLeasehold(v as "freehold" | "leasehold")}
                />
              </Field>
            )}

            <div className={styles.flagsGrid} style={{ display: "grid", gap: "4px 16px" }}>
              {showsMortgageField(transactionType) && (
                <CompactToggleField label={mortgageLabelFor(transactionType)}>
                  <ButtonRow
                    options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
                    value={mortgageInvolved ? "yes" : "no"}
                    onChange={(v) => setMortgageInvolved(v === "yes")}
                  />
                </CompactToggleField>
              )}

              {availableFlags.map((opt) => (
                <CompactToggleField key={opt.key} label={opt.label}>
                  <ButtonRow
                    options={[{ value: "no", label: "No" }, { value: "yes", label: "Yes" }]}
                    value={flags[opt.key] ? "yes" : "no"}
                    onChange={(v) => toggleFlag(opt.key, v === "yes")}
                  />
                </CompactToggleField>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10 }}>
              <BackButton onClick={() => setStepIndex(0)} />
              <StepSubmitButton>Continue</StepSubmitButton>
            </div>
          </form>
        )}

        {currentStep === "Contact" && (
          <form onSubmit={handleFinalSubmit} style={{ display: "flex", flexDirection: "column", gap: 16, marginTop: 28 }}>
            <div>
              <h2 style={{ ...display, fontSize: 22, fontWeight: 800, color: NAVY, margin: "0 0 6px" }}>Your details</h2>
              <p style={{ fontSize: 13.5, fontWeight: 700, color: TEXT_HEADING, margin: 0 }}>
                So we can show you your matches, and firms can get in touch about your enquiry.
              </p>
            </div>

            <ContactField label="Full name" icon={<UserIcon size={16} color={ACCENT_BOLD} />}>
              <input required autoComplete="name" placeholder="e.g. Jordan Smith" value={name} onChange={(e) => setName(e.target.value)} style={inputStyle} />
            </ContactField>
            <ContactField label="Email address" icon={<MailIcon size={16} color={ACCENT_BOLD} />}>
              <input required type="email" autoComplete="email" placeholder="e.g. jordan@example.com" value={email} onChange={(e) => setEmail(e.target.value)} style={inputStyle} />
            </ContactField>
            <ContactField label="Phone number" icon={<PhoneIcon size={16} color={ACCENT_BOLD} />}>
              <input required type="tel" autoComplete="tel" placeholder="e.g. 07700 900123" value={phone} onChange={(e) => setPhone(e.target.value)} style={inputStyle} />
            </ContactField>

            {error && (
              <p style={{ fontSize: 13, color: ERROR, background: "oklch(0.95 0.03 25)", padding: "10px 12px", borderRadius: RADIUS.sm }}>
                {error}
              </p>
            )}

            <div style={{ display: "flex", gap: 10 }}>
              <BackButton onClick={() => setStepIndex(1)} disabled={submitting} />
              <StepSubmitButton disabled={submitting}>{submitting ? "Finding your matches…" : "See my matches"}</StepSubmitButton>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function StepIndicator({ steps, activeIndex }: { steps: readonly string[]; activeIndex: number }) {
  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {steps.map((step, i) => {
        const done = i < activeIndex;
        const active = i === activeIndex;
        return (
          <div key={step} style={{ display: "flex", alignItems: "center", flex: i < steps.length - 1 ? 1 : undefined }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 12.5,
                  fontWeight: 800,
                  color: done || active ? "white" : TEXT_MUTED,
                  background: done ? GRADIENT_TEAL : active ? ACCENT_BOLD : "white",
                  border: done || active ? "none" : `1.5px solid ${BORDER}`,
                }}
              >
                {done ? <CheckCircleIcon size={15} color="white" /> : i + 1}
              </div>
              <span style={{ fontSize: 10.5, fontWeight: 700, color: active ? TEXT_HEADING : TEXT_MUTED, whiteSpace: "nowrap" }}>{step}</span>
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 1.5, background: done ? GRADIENT_TEAL : BORDER, margin: "0 6px 18px" }} />}
          </div>
        );
      })}
    </div>
  );
}

function ButtonRow({ options, value, onChange }: { options: { value: string; label: string }[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ display: "flex", gap: 8 }}>
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            aria-pressed={selected}
            style={{
              fontSize: 13.5,
              fontWeight: 700,
              padding: "9px 20px",
              borderRadius: RADIUS.sm,
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
  );
}

function StepSubmitButton({ children, disabled }: { children: React.ReactNode; disabled?: boolean }) {
  return (
    <button
      type="submit"
      disabled={disabled}
      style={{
        flex: 1,
        background: GRADIENT_CTA,
        boxShadow: SHADOW.md,
        color: "white",
        fontWeight: 800,
        border: "none",
        borderRadius: RADIUS.pill,
        padding: "14px 20px",
        fontSize: 15,
        opacity: disabled ? 0.7 : 1,
      }}
    >
      {children}
    </button>
  );
}

function BackButton({ onClick, disabled }: { onClick: () => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        background: "transparent",
        color: TEXT_HEADING,
        border: `1px solid ${BORDER}`,
        borderRadius: RADIUS.pill,
        padding: "14px 22px",
        fontSize: 14,
        cursor: "pointer",
      }}
    >
      Back
    </button>
  );
}

function CompactToggleField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ padding: "8px 0" }}>
      <label style={{ display: "block", fontSize: 12.5, fontWeight: 700, color: TEXT_HEADING, marginBottom: 6, lineHeight: 1.3 }}>{label}</label>
      {children}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT_HEADING, marginBottom: 8 }}>{label}</label>
      {children}
    </div>
  );
}

function ContactField({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 13, fontWeight: 700, color: TEXT_HEADING, marginBottom: 8 }}>{label}</label>
      <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${BORDER}`, borderRadius: RADIUS.sm, padding: "10px 14px" }}>
        {icon}
        {children}
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
  background: "transparent",
  border: "none",
  outline: "none",
  fontSize: 14,
  color: TEXT_BODY,
};
