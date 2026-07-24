import Link from "next/link";
import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer
      style={{
        background: "var(--navy-dark)",
        color: "var(--text-on-navy-body)",
        fontSize: 12,
        padding: "24px",
        marginTop: 40,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <Logo variant="onDark" size={15} />
      </div>
      <nav style={{ display: "flex", justifyContent: "center", gap: 16, marginBottom: 12, flexWrap: "wrap" }}>
        <Link href="/how-it-works" style={{ color: "var(--text-on-navy-body)", textDecoration: "none" }}>
          How it works
        </Link>
        <Link href="/services" style={{ color: "var(--text-on-navy-body)", textDecoration: "none" }}>
          Services
        </Link>
        <Link href="/fees-explained" style={{ color: "var(--text-on-navy-body)", textDecoration: "none" }}>
          Fees
        </Link>
        <Link href="/faq" style={{ color: "var(--text-on-navy-body)", textDecoration: "none" }}>
          FAQ
        </Link>
      </nav>
      <p style={{ margin: 0 }}>
        Comparison service. Regulatory disclosures, complaints procedure, and firm ownership information: pending
        final review before publication.
      </p>
    </footer>
  );
}
