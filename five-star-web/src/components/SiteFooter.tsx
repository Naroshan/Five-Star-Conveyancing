import Link from "next/link";
import { Logo } from "./Logo";
import { TEXT_ON_NAVY_MUTED } from "@/lib/theme";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer style={{ padding: "40px 48px", background: "oklch(0.15 0.02 240)", marginTop: 40 }}>
      <div className={styles.row}>
        <Logo variant="onDark" size={16} />
        <nav className={styles.nav} style={{ display: "flex", gap: 24, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
          <Link href="/how-it-works" style={{ color: TEXT_ON_NAVY_MUTED, textDecoration: "none" }}>
            How it works
          </Link>
          <Link href="/services" style={{ color: TEXT_ON_NAVY_MUTED, textDecoration: "none" }}>
            Services
          </Link>
          <Link href="/fees-explained" style={{ color: TEXT_ON_NAVY_MUTED, textDecoration: "none" }}>
            Fees
          </Link>
          <Link href="/faq" style={{ color: TEXT_ON_NAVY_MUTED, textDecoration: "none" }}>
            FAQ
          </Link>
        </nav>
      </div>
      <p style={{ fontSize: 11.5, color: "oklch(0.55 0.02 240)", maxWidth: 600, margin: "20px 0 0" }}>
        Five Star Conveyancing is a comparison service. Regulatory disclosures, complaints procedure, and firm
        ownership information: pending final review before publication.
      </p>
    </footer>
  );
}
