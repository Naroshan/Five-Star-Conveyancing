import Link from "next/link";
import { NAVY, TEAL, TEXT_MUTED, BORDER, RADIUS } from "@/lib/theme";

// Replaces a quote form (or similar conversion surface) for a visitor
// outside England & Wales — see useRegionRestriction.ts for how that's
// detected, and regionRestriction.ts for the server-side enforcement this
// is a UX layer on top of.
export function RegionRestrictedNotice({ compact = false }: { compact?: boolean }) {
  return (
    <div
      style={{
        padding: compact ? "18px 20px" : "28px 24px",
        textAlign: "center",
        color: TEXT_MUTED,
        border: `1.5px solid ${BORDER}`,
        borderRadius: RADIUS.md,
        fontSize: compact ? 13 : 14,
        lineHeight: 1.6,
      }}
    >
      <p style={{ margin: 0, color: NAVY, fontWeight: 700 }}>Not available in your region</p>
      <p style={{ margin: "8px 0 0" }}>
        Five Star Conveyancing currently only covers property transactions in England and Wales, so we&apos;re
        unable to take enquiries from outside that area.{" "}
        <Link href="/contact" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
          Contact us
        </Link>{" "}
        if you believe you&apos;re seeing this in error.
      </p>
    </div>
  );
}
