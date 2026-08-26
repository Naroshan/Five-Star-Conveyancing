"use client";

import { useState, type FormEvent } from "react";
import { QuoteResultsList } from "five-star-conveyancing-quote-engine/components/QuoteResults";
import type { PublicQuoteResult } from "five-star-conveyancing-quote-engine/api/publicResult";
import { CREAM, BORDER, NAVY, TEAL, TEXT_HEADING, TEXT_MUTED, GRADIENT_CTA, ERROR, RADIUS, SHADOW } from "@/lib/theme";
import { UserIcon, MailIcon, PhoneIcon } from "@/components/icons";

// Formspree form ID for lead notifications — same form used by the Contact
// page (ContactForm.tsx) and by quote generation (GetAQuoteForm.tsx); all
// submissions across the site are intentionally consolidated into this one
// form, so a real person is notified whenever a client selects a firm.
const LEAD_NOTIFY_FORM_ID = "xjgnakev";

export function ResultsInteractive({ quoteReference, results }: { quoteReference: string; results: PublicQuoteResult[] }) {
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [selectedFirmId, setSelectedFirmId] = useState<string | null>(null);
  const [pendingFirmId, setPendingFirmId] = useState<string | null>(null);
  const [isSelecting, setIsSelecting] = useState(false);
  const [contactError, setContactError] = useState<string | null>(null);

  const [emailQuoteFirmId, setEmailQuoteFirmId] = useState<string | null>(null);
  const [isSendingEmailQuote, setIsSendingEmailQuote] = useState(false);
  const [emailQuoteError, setEmailQuoteError] = useState<string | null>(null);

  // Live chat isn't wired up yet — gives visible feedback rather than doing nothing.
  function stubAction(action: string) {
    setActionMessage(`"${action}" isn't wired up yet in this build — see the project README.`);
    setTimeout(() => setActionMessage(null), 4000);
  }

  function handleSaveQuote(firmId: string) {
    const url = `/api/quotes/${quoteReference}/pdf?firmId=${encodeURIComponent(firmId)}`;
    const link = document.createElement("a");
    link.href = url;
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  function handleEmailQuote(firmId: string) {
    setEmailQuoteError(null);
    setEmailQuoteFirmId(firmId);
  }

  async function handleConfirmEmailQuote(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!emailQuoteFirmId || isSendingEmailQuote) return;

    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    setIsSendingEmailQuote(true);
    setEmailQuoteError(null);
    try {
      const response = await fetch(`/api/quotes/${quoteReference}/email-quote`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firmId: emailQuoteFirmId, email }),
      });
      const data = await response.json();
      if (!response.ok) {
        setEmailQuoteError(data.error?.message ?? "Something went wrong sending that email. Please try again.");
        return;
      }
      setEmailQuoteFirmId(null);
      setActionMessage("Sent — check your inbox for the quote.");
      setTimeout(() => setActionMessage(null), 4000);
    } catch {
      setEmailQuoteError("Something went wrong sending that email. Please try again.");
    } finally {
      setIsSendingEmailQuote(false);
    }
  }

  function handleSelect(firmId: string) {
    if (isSelecting || selectedFirmId) return;
    setContactError(null);
    setPendingFirmId(firmId);
  }

  async function handleConfirmSelection(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!pendingFirmId || isSelecting) return;

    const formData = new FormData(e.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();

    setIsSelecting(true);
    setActionMessage(null);
    try {
      const response = await fetch(`/api/quotes/${quoteReference}/select`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ firmId: pendingFirmId }),
      });
      const data = await response.json();
      if (!response.ok) {
        setContactError(data.error?.message ?? "Something went wrong recording your selection. Please try again.");
        return;
      }

      const result = results.find((r) => r.firm.firmId === pendingFirmId);
      // Best-effort — a failed lead notification shouldn't block the client
      // seeing their selection was recorded (that part already succeeded above).
      fetch(`https://formspree.io/f/${LEAD_NOTIFY_FORM_ID}`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          quoteReference,
          firmId: pendingFirmId,
          firmName: result?.firm.tradingName ?? result?.firm.legalEntityName ?? pendingFirmId,
          totalEstimate: result?.totalEstimate ?? null,
        }),
      }).catch(() => {});

      setSelectedFirmId(pendingFirmId);
      setPendingFirmId(null);
      setActionMessage("Thanks — we've passed your details to this firm. They'll be in touch shortly.");
    } catch {
      setContactError("Something went wrong recording your selection. Please try again.");
    } finally {
      setIsSelecting(false);
    }
  }

  const pendingResult = pendingFirmId ? results.find((r) => r.firm.firmId === pendingFirmId) : undefined;
  const pendingFirmName = pendingResult?.firm.tradingName ?? pendingResult?.firm.legalEntityName ?? "this firm";

  return (
    <>
      {actionMessage && (
        <p
          style={{
            fontSize: 13,
            background: CREAM,
            border: `1px solid ${BORDER}`,
            borderRadius: RADIUS.sm,
            padding: "10px 12px",
            marginBottom: 16,
          }}
        >
          {actionMessage}
        </p>
      )}

      {pendingFirmId && (
        <div
          role="dialog"
          aria-label={`Your details for ${pendingFirmName}`}
          style={{
            background: "white",
            border: `1px solid ${BORDER}`,
            borderRadius: RADIUS.md,
            boxShadow: SHADOW.md,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 14.5, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 4px" }}>
            Your details for {pendingFirmName}
          </p>
          <p style={{ fontSize: 13, color: TEXT_MUTED, margin: "0 0 16px" }}>
            So they can get in touch with you about your enquiry.
          </p>
          <form onSubmit={handleConfirmSelection} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ContactField icon={<UserIcon size={16} color={TEAL} />}>
              <input type="text" name="name" required autoComplete="name" placeholder="Full name" style={inputStyle} />
            </ContactField>
            <ContactField icon={<MailIcon size={16} color={TEAL} />}>
              <input type="email" name="email" required autoComplete="email" placeholder="Email address" style={inputStyle} />
            </ContactField>
            <ContactField icon={<PhoneIcon size={16} color={TEAL} />}>
              <input type="tel" name="phone" required autoComplete="tel" placeholder="Phone number" style={inputStyle} />
            </ContactField>

            {contactError && <p style={{ fontSize: 13, color: ERROR, margin: 0 }}>{contactError}</p>}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                type="submit"
                disabled={isSelecting}
                className="cta-button"
                style={{
                  background: GRADIENT_CTA,
                  boxShadow: SHADOW.sm,
                  color: NAVY,
                  fontWeight: 700,
                  border: "none",
                  borderRadius: RADIUS.pill,
                  padding: "10px 20px",
                  fontSize: 13.5,
                  opacity: isSelecting ? 0.7 : 1,
                }}
              >
                {isSelecting ? "Confirming…" : "Confirm selection"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setPendingFirmId(null);
                  setContactError(null);
                }}
                disabled={isSelecting}
                style={{
                  background: "transparent",
                  color: TEXT_HEADING,
                  border: `1px solid ${BORDER}`,
                  borderRadius: RADIUS.pill,
                  padding: "10px 18px",
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {emailQuoteFirmId && (
        <div
          role="dialog"
          aria-label="Email this quote"
          style={{
            background: "white",
            border: `1px solid ${BORDER}`,
            borderRadius: RADIUS.md,
            boxShadow: SHADOW.md,
            padding: 20,
            marginBottom: 16,
          }}
        >
          <p style={{ fontSize: 14.5, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 4px" }}>Email this quote to yourself</p>
          <p style={{ fontSize: 13, color: TEXT_MUTED, margin: "0 0 16px" }}>We&apos;ll send a PDF copy to the address below.</p>
          <form onSubmit={handleConfirmEmailQuote} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <ContactField icon={<MailIcon size={16} color={TEAL} />}>
              <input type="email" name="email" required autoComplete="email" placeholder="Email address" style={inputStyle} />
            </ContactField>

            {emailQuoteError && <p style={{ fontSize: 13, color: ERROR, margin: 0 }}>{emailQuoteError}</p>}

            <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
              <button
                type="submit"
                disabled={isSendingEmailQuote}
                className="cta-button"
                style={{
                  background: GRADIENT_CTA,
                  boxShadow: SHADOW.sm,
                  color: NAVY,
                  fontWeight: 700,
                  border: "none",
                  borderRadius: RADIUS.pill,
                  padding: "10px 20px",
                  fontSize: 13.5,
                  opacity: isSendingEmailQuote ? 0.7 : 1,
                }}
              >
                {isSendingEmailQuote ? "Sending…" : "Send quote"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setEmailQuoteFirmId(null);
                  setEmailQuoteError(null);
                }}
                disabled={isSendingEmailQuote}
                style={{
                  background: "transparent",
                  color: TEXT_HEADING,
                  border: `1px solid ${BORDER}`,
                  borderRadius: RADIUS.pill,
                  padding: "10px 18px",
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <QuoteResultsList
        results={results}
        onSelect={handleSelect}
        onEmailQuote={handleEmailQuote}
        onSaveQuote={handleSaveQuote}
        onSpeakToAdviser={() => stubAction("Speak to an adviser")}
      />
    </>
  );
}

function ContactField({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${BORDER}`, borderRadius: RADIUS.sm, padding: "10px 14px" }}>
      {icon}
      {children}
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
};
