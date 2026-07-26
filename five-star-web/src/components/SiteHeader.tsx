import Link from "next/link";
import { Logo } from "./Logo";
import { NAVY, CREAM, TEXT_HEADING } from "@/lib/theme";

export function SiteHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 44px",
        borderBottom: `2px solid ${NAVY}`,
        background: CREAM,
        flexWrap: "wrap",
        gap: 16,
      }}
    >
      <Link href="/" style={{ textDecoration: "none", display: "flex" }}>
        <Logo variant="onLight" size={20} />
      </Link>
      <nav style={{ display: "flex", alignItems: "center", gap: 34, fontSize: 14, flexWrap: "wrap" }}>
        <Link href="/how-it-works" style={{ fontWeight: 700, color: TEXT_HEADING, textDecoration: "none" }}>
          How it works
        </Link>
        <Link href="/services" style={{ fontWeight: 700, color: TEXT_HEADING, textDecoration: "none" }}>
          Services
        </Link>
        <Link href="/fees-explained" style={{ fontWeight: 700, color: TEXT_HEADING, textDecoration: "none" }}>
          Fees
        </Link>
        <Link href="/faq" style={{ fontWeight: 700, color: TEXT_HEADING, textDecoration: "none" }}>
          FAQ
        </Link>
        <Link
          href="/get-a-quote"
          style={{ fontWeight: 800, color: CREAM, background: NAVY, padding: "12px 26px", whiteSpace: "nowrap", textDecoration: "none" }}
        >
          Get a quote
        </Link>
      </nav>
    </header>
  );
}
