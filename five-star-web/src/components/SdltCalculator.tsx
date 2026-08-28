"use client";

import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { calculateSdlt, type BuyerType, type Jurisdiction, type SdltCalculationResult } from "@/lib/sdlt";
import { toDigits, formatThousands } from "@/lib/formatNumber";
import { NAVY, TEAL, ERROR, TEXT_HEADING, TEXT_MUTED, BORDER, ICON_BADGE_BG, RADIUS, SHADOW, GRADIENT_CTA } from "@/lib/theme";
import { MailIcon, ChevronDownIcon, WhatsAppIcon } from "@/components/icons";

const WHATSAPP_GREEN = "#25D366";

// Same Formspree form used for every other lead notification on the site
// (see ResultsInteractive.tsx / GetAQuoteForm.tsx) — a real person gets
// notified whenever someone hands over their email here.
const LEAD_NOTIFY_FORM_ID = "xjgnakev";

const BUYER_TYPES: { value: BuyerType; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "first_time_buyer", label: "First-time buyer" },
  { value: "additional_property", label: "Additional property" },
];

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(amount);
}

function buyerTypeLabel(buyerType: BuyerType): string {
  return BUYER_TYPES.find((b) => b.value === buyerType)?.label ?? "Standard";
}

// Native <select> option lists can't be styled — this replicates the
// custom dropdown pattern already used for "What are you doing?" in
// HeroQuoteWidget.tsx, so the calculator's two dropdowns look intentional
// instead of falling back to the OS's plain option list.
function CustomSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; disabled?: boolean }[];
  onChange: (value: T) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClickOutside);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} style={{ position: "relative", flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 4 }}>
      <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: TEXT_MUTED }}>{label}</span>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 8,
          border: `1.5px solid ${BORDER}`,
          borderRadius: RADIUS.sm,
          padding: "10px 12px",
          fontSize: 14,
          color: NAVY,
          background: "white",
          cursor: "pointer",
          textAlign: "left",
        }}
      >
        <span>{selected?.label}</span>
        <span style={{ display: "inline-flex", transform: open ? "rotate(180deg)" : "none", transition: "transform 0.15s ease" }}>
          <ChevronDownIcon size={13} color={TEXT_MUTED} />
        </span>
      </button>

      {open && (
        <div
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            marginTop: 6,
            background: "white",
            border: `1px solid ${BORDER}`,
            borderRadius: RADIUS.md,
            boxShadow: SHADOW.lg,
            overflow: "hidden",
            zIndex: 20,
          }}
        >
          {options.map((o) => {
            const active = o.value === value;
            return (
              <button
                key={o.value}
                type="button"
                role="option"
                aria-selected={active}
                disabled={o.disabled}
                onClick={() => {
                  if (o.disabled) return;
                  onChange(o.value);
                  setOpen(false);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  textAlign: "left",
                  border: "none",
                  padding: "10px 14px",
                  fontSize: 13.5,
                  fontWeight: active ? 700 : 500,
                  background: active ? ICON_BADGE_BG : "white",
                  color: o.disabled ? TEXT_MUTED : active ? TEAL : TEXT_HEADING,
                  cursor: o.disabled ? "not-allowed" : "pointer",
                  opacity: o.disabled ? 0.55 : 1,
                }}
              >
                {o.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function buildShareText(price: number, jurisdiction: Jurisdiction, buyerType: BuyerType, result: SdltCalculationResult): string {
  const taxName = jurisdiction === "wales" ? "Land Transaction Tax" : "Stamp Duty Land Tax";
  const place = jurisdiction === "wales" ? "Wales" : "England";
  const lines = result.bands.map(
    (b) => `${formatMoney(b.min)}–${b.max ? formatMoney(b.max) : "+"} at ${b.rate}%: ${formatMoney(b.taxForBand)}`
  );
  return [
    `My ${taxName} estimate for a ${formatMoney(price)} property in ${place} (${buyerTypeLabel(buyerType).toLowerCase()}):`,
    ...lines,
    `Total: ${formatMoney(result.total)}`,
    "",
    "via fivestarconveyancing.co.uk/sdlt-calculator",
  ].join("\n");
}

export function SdltCalculator({ compact = false }: { compact?: boolean }) {
  const [price, setPrice] = useState("");
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("england");
  const [buyerType, setBuyerType] = useState<BuyerType>("standard");
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);
  const [emailError, setEmailError] = useState<string | null>(null);
  const [emailSent, setEmailSent] = useState(false);

  const numericPrice = Number(price) || 0;
  const result = useMemo(() => calculateSdlt(numericPrice, jurisdiction, buyerType), [numericPrice, jurisdiction, buyerType]);
  const taxName = jurisdiction === "wales" ? "Land Transaction Tax" : "Stamp Duty Land Tax";

  function handleWhatsApp() {
    const text = buildShareText(numericPrice, jurisdiction, buyerType, result);
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank", "noopener");
  }

  async function handleEmailSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (isSendingEmail) return;
    const formData = new FormData(e.currentTarget);
    const email = String(formData.get("email") ?? "").trim();

    setIsSendingEmail(true);
    setEmailError(null);
    try {
      const response = await fetch("/api/sdlt-calculator/email", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, price: numericPrice, jurisdiction, buyerType }),
      });
      const data = await response.json();
      if (!response.ok) {
        setEmailError(data.error?.message ?? "Something went wrong sending that email. Please try again.");
        return;
      }

      // Best-effort lead notification — the email above has already been
      // sent to the client by this point, so a failure here shouldn't
      // surface as an error.
      fetch(`https://formspree.io/f/${LEAD_NOTIFY_FORM_ID}`, {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify({
          email,
          source: "SDLT calculator",
          price: numericPrice,
          jurisdiction,
          buyerType,
          estimatedTax: result.total,
        }),
      }).catch(() => {});

      setEmailSent(true);
      setShowEmailForm(false);
    } catch {
      setEmailError("Something went wrong sending that email. Please try again.");
    } finally {
      setIsSendingEmail(false);
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 10 : 16 }}>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        <label style={{ flex: "1 1 160px", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: TEXT_MUTED }}>
            Property price
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 6, border: `1.5px solid ${BORDER}`, borderRadius: RADIUS.sm, padding: "10px 12px" }}>
            <span style={{ color: TEXT_MUTED, fontWeight: 700, fontSize: 14 }}>£</span>
            <input
              type="text"
              inputMode="numeric"
              value={formatThousands(price)}
              onChange={(e) => setPrice(toDigits(e.target.value))}
              placeholder="350,000"
              style={{ border: "none", outline: "none", fontSize: 14, color: NAVY, width: "100%", background: "transparent" }}
            />
          </div>
        </label>

        <CustomSelect
          label="Where"
          value={jurisdiction}
          onChange={setJurisdiction}
          options={[
            { value: "england", label: "England" },
            { value: "wales", label: "Wales" },
          ]}
        />

        <CustomSelect
          label="Buyer type"
          value={buyerType}
          onChange={setBuyerType}
          options={BUYER_TYPES.map((b) => ({ ...b, disabled: jurisdiction === "wales" && b.value === "first_time_buyer" }))}
        />
      </div>

      {jurisdiction === "wales" && buyerType === "first_time_buyer" && (
        <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0 }}>Wales has no first-time buyer relief — standard rates are shown.</p>
      )}

      <div
        style={{
          background: ICON_BADGE_BG,
          borderRadius: RADIUS.md,
          padding: compact ? "14px 16px" : "20px 22px",
          boxShadow: compact ? undefined : SHADOW.sm,
        }}
      >
        <p style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: TEXT_MUTED, margin: "0 0 4px" }}>
          Estimated {taxName}
        </p>
        <p style={{ fontSize: compact ? 26 : 32, fontWeight: 800, color: NAVY, margin: "0 0 2px" }}>{formatMoney(result.total)}</p>
        {numericPrice > 0 && (
          <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0 }}>Effective rate: {result.effectiveRate}% of the property price</p>
        )}

        {!compact && result.bands.length > 0 && (
          <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 6 }}>
            {result.bands.map((b, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, color: TEXT_HEADING }}>
                <span>
                  {formatMoney(b.min)} – {b.max ? formatMoney(b.max) : "and above"} at {b.rate}%
                </span>
                <span style={{ fontWeight: 700 }}>{formatMoney(b.taxForBand)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {numericPrice > 0 && (
        <>
          {!showEmailForm && !emailSent && (
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={() => setShowEmailForm(true)}
                className="cta-button"
                style={{
                  flex: "1 1 auto",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: GRADIENT_CTA,
                  color: NAVY,
                  fontWeight: 700,
                  border: "none",
                  borderRadius: RADIUS.pill,
                  padding: "11px 18px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <MailIcon size={15} color={NAVY} />
                Email full breakdown
              </button>
              <button
                type="button"
                onClick={handleWhatsApp}
                style={{
                  flex: "1 1 auto",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  background: WHATSAPP_GREEN,
                  color: "#ffffff",
                  fontWeight: 700,
                  border: "none",
                  borderRadius: RADIUS.pill,
                  padding: "11px 18px",
                  fontSize: 13,
                  cursor: "pointer",
                }}
              >
                <WhatsAppIcon size={16} color="#ffffff" />
                Or click, WhatsApp me the breakdown
              </button>
            </div>
          )}

          {emailSent && <p style={{ fontSize: 13, color: TEAL, fontWeight: 700, margin: 0 }}>Sent — check your inbox for the full breakdown.</p>}

          {showEmailForm && (
            <form onSubmit={handleEmailSubmit} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, border: `1.5px solid ${BORDER}`, borderRadius: RADIUS.sm, padding: "10px 14px" }}>
                <MailIcon size={16} color={TEAL} />
                <input
                  type="email"
                  name="email"
                  required
                  autoComplete="email"
                  placeholder="Email address"
                  style={{ flex: 1, minWidth: 0, background: "transparent", border: "none", outline: "none", fontSize: 14 }}
                />
              </div>
              {emailError && <p style={{ fontSize: 12.5, color: ERROR, margin: 0 }}>{emailError}</p>}
              <div style={{ display: "flex", gap: 8 }}>
                <button
                  type="submit"
                  disabled={isSendingEmail}
                  className="cta-button"
                  style={{
                    background: GRADIENT_CTA,
                    color: NAVY,
                    fontWeight: 700,
                    border: "none",
                    borderRadius: RADIUS.pill,
                    padding: "10px 20px",
                    fontSize: 13,
                    cursor: "pointer",
                    opacity: isSendingEmail ? 0.7 : 1,
                  }}
                >
                  {isSendingEmail ? "Sending…" : "Send breakdown"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEmailForm(false);
                    setEmailError(null);
                  }}
                  disabled={isSendingEmail}
                  style={{ background: "transparent", color: TEXT_HEADING, border: `1px solid ${BORDER}`, borderRadius: RADIUS.pill, padding: "10px 18px", fontSize: 13, cursor: "pointer" }}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </>
      )}

      <p style={{ fontSize: 11, color: TEXT_MUTED, margin: 0, lineHeight: 1.5 }}>
        Estimate only, based on published HMRC / Welsh Revenue Authority rates. It doesn&apos;t account for every relief
        or exemption — always confirm the exact figure with your solicitor before exchange.
      </p>
    </div>
  );
}
