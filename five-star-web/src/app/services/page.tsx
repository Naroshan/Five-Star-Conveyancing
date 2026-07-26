import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, TEAL, GOLD, CREAM, BORDER, TEXT_BODY, ACCENT_BOLD, RADIUS, fraunces } from "@/lib/theme";
import contentStyles from "@/styles/contentPage.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Services — Five Star Conveyancing",
  description: "Conveyancing transaction types we compare quotes for: sale, purchase, remortgage, transfer of equity, and lease extension.",
};

const TRANSACTION_TYPES = [
  { n: "01", title: "Purchase", body: "Buying a property, freehold or leasehold, with or without a mortgage." },
  { n: "02", title: "Sale", body: "Selling a property you own." },
  { n: "03", title: "Sale and purchase", body: "Selling your current property and buying your next one at the same time." },
  { n: "04", title: "Remortgage", body: "Switching mortgage lender or deal on a property you already own." },
  { n: "05", title: "Transfer of equity", body: "Adding or removing a name from the title of a property — for example after marriage, divorce, or a change in ownership share." },
  { n: "06", title: "Lease extension", body: "Extending the remaining term of a leasehold property." },
];

// Bold color-blocked tile treatment, cycling through the accent palette —
// GOLD needs navy text for contrast, the other two take white.
const TILE_STYLES = [
  { bg: TEAL, text: "white", muted: "oklch(0.9 0.03 190)" },
  { bg: ACCENT_BOLD, text: "white", muted: "oklch(0.88 0.05 350)" },
  { bg: GOLD, text: NAVY, muted: "oklch(0.32 0.06 80)" },
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ maxWidth: 1320, margin: "0 auto", background: CREAM, borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}` }}>
        <section className={contentStyles.hero} style={{ borderBottom: `2px solid ${NAVY}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 18 }}>
            What we compare
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...fraunces, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Services
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: TEXT_BODY, maxWidth: 480, margin: 0 }}>
            We compare conveyancing quotes across these transaction types.
          </p>
        </section>

        <section className={styles.grid} style={{ display: "grid", borderBottom: `2px solid ${NAVY}`, borderTop: `1px solid ${BORDER}`, background: NAVY }}>
          {TRANSACTION_TYPES.map((t, i) => {
            const tile = TILE_STYLES[i % TILE_STYLES.length];
            return (
              <div key={t.title} className={styles.item} style={{ background: tile.bg }}>
                <div style={{ ...fraunces, fontSize: 26, color: tile.text, opacity: 0.6, marginBottom: 14 }}>{t.n}</div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: tile.text, margin: "0 0 8px" }}>{t.title}</h2>
                <p style={{ fontSize: 14, color: tile.muted, lineHeight: 1.6, margin: 0 }}>{t.body}</p>
              </div>
            );
          })}
        </section>

        <section className={contentStyles.ctaSection} style={{ textAlign: "center" }}>
          <Link
            href="/get-a-quote"
            style={{ display: "inline-block", background: ACCENT_BOLD, color: "white", fontWeight: 800, fontSize: 15.5, padding: "17px 34px", borderRadius: RADIUS.pill, textDecoration: "none" }}
          >
            Get my quote →
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
