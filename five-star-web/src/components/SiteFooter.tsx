import Link from "next/link";
import { Logo } from "./Logo";
import { NAVY, TEAL, TEXT_MUTED, BORDER, CREAM } from "@/lib/theme";
import { ShieldCheckIcon } from "./icons";
import styles from "./SiteFooter.module.css";

const COMPARE_LINKS = [
  { href: "/services/purchase", label: "Buying a home" },
  { href: "/services/sale", label: "Selling a home" },
  { href: "/services/remortgage", label: "Remortgaging" },
  { href: "/get-a-quote", label: "See your matches" },
];

const LEARN_LINKS = [
  { href: "/fees-explained", label: "Fees explained" },
  { href: "/guides", label: "All guides" },
  { href: "/faq", label: "Questions answered" },
];

const ABOUT_LINKS = [
  { href: "/about", label: "Who we are" },
  { href: "/faq", label: "How we verify firms" },
  { href: "/contact", label: "Contact us" },
];

const LEGAL_LINKS = [
  { href: "/contact", label: "Terms & conditions" },
  { href: "/contact", label: "Privacy policy" },
  { href: "/contact", label: "Complaints procedure" },
];

export function SiteFooter() {
  return (
    <footer style={{ padding: "48px 48px 32px", background: CREAM, borderTop: `1px solid ${BORDER}`, marginTop: 40 }}>
      <div className={styles.grid} style={{ display: "grid", marginBottom: 32 }}>
        <div>
          <div style={{ marginBottom: 14 }}>
            <Logo variant="onLight" size={17} />
          </div>
          <p style={{ fontSize: 12.5, color: TEXT_MUTED, lineHeight: 1.7, maxWidth: 250, margin: 0 }}>
            A comparison service for conveyancing. We don&apos;t provide legal services ourselves — we help you
            compare the firms who do.
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 14 }}>
            <ShieldCheckIcon size={15} color={TEAL} />
            <span style={{ fontSize: 12, fontWeight: 600, color: TEXT_MUTED }}>SRA and CLC verified firms only</span>
          </div>
        </div>

        <FooterColumn heading="Find a solicitor" links={COMPARE_LINKS} />
        <FooterColumn heading="Guides" links={LEARN_LINKS} />
        <FooterColumn heading="Find out more" links={ABOUT_LINKS} />
        <FooterColumn heading="Legal" links={LEGAL_LINKS} />
      </div>

      <p style={{ fontSize: 11.5, color: TEXT_MUTED, maxWidth: 700, margin: "24px 0 0", paddingTop: 24, borderTop: `1px solid ${BORDER}`, lineHeight: 1.7 }}>
        Registered company details and regulatory disclosures pending final review before publication.
        Five Star Conveyancing is a comparison service; regulatory disclosures, complaints procedure, and firm
        ownership information are pending final review. © 2026 Five Star Conveyancing.
      </p>
    </footer>
  );
}

function FooterColumn({ heading, links }: { heading: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: NAVY, marginBottom: 14 }}>
        {heading}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {links.map((link, i) => (
          <Link key={`${link.href}-${i}`} href={link.href} style={{ fontSize: 13.5, color: TEXT_MUTED, textDecoration: "none" }}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
