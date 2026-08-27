"use client";

import { useMemo, useState } from "react";
import { calculateSdlt, type BuyerType, type Jurisdiction } from "@/lib/sdlt";
import { toDigits, formatThousands } from "@/lib/formatNumber";
import { NAVY, TEXT_HEADING, TEXT_MUTED, BORDER, ICON_BADGE_BG, RADIUS, SHADOW } from "@/lib/theme";

const BUYER_TYPES: { value: BuyerType; label: string }[] = [
  { value: "standard", label: "Standard" },
  { value: "first_time_buyer", label: "First-time buyer" },
  { value: "additional_property", label: "Additional property" },
];

function formatMoney(amount: number): string {
  return new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP", maximumFractionDigits: 0 }).format(amount);
}

export function SdltCalculator({ compact = false }: { compact?: boolean }) {
  const [price, setPrice] = useState("");
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction>("england");
  const [buyerType, setBuyerType] = useState<BuyerType>("standard");

  const numericPrice = Number(price) || 0;
  const result = useMemo(() => calculateSdlt(numericPrice, jurisdiction, buyerType), [numericPrice, jurisdiction, buyerType]);
  const taxName = jurisdiction === "wales" ? "Land Transaction Tax" : "Stamp Duty Land Tax";

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

        <label style={{ flex: "1 1 140px", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: TEXT_MUTED }}>
            Where
          </span>
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
            style={{
              border: `1.5px solid ${BORDER}`,
              borderRadius: RADIUS.sm,
              padding: "10px 12px",
              fontSize: 14,
              color: NAVY,
              background: "white",
            }}
          >
            <option value="england">England</option>
            <option value="wales">Wales</option>
          </select>
        </label>

        <label style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 11, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.06em", color: TEXT_MUTED }}>
            Buyer type
          </span>
          <select
            value={buyerType}
            onChange={(e) => setBuyerType(e.target.value as BuyerType)}
            style={{
              border: `1.5px solid ${BORDER}`,
              borderRadius: RADIUS.sm,
              padding: "10px 12px",
              fontSize: 14,
              color: NAVY,
              background: "white",
            }}
          >
            {BUYER_TYPES.map((b) => (
              <option key={b.value} value={b.value} disabled={jurisdiction === "wales" && b.value === "first_time_buyer"}>
                {b.label}
              </option>
            ))}
          </select>
        </label>
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

      <p style={{ fontSize: 11, color: TEXT_MUTED, margin: 0, lineHeight: 1.5 }}>
        Estimate only, based on published HMRC / Welsh Revenue Authority rates. It doesn&apos;t account for every relief
        or exemption — always confirm the exact figure with your solicitor before exchange.
      </p>
    </div>
  );
}
