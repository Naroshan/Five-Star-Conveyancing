import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, GRADIENT_CTA, TEAL, RADIUS, SHADOW, ICON_BADGE_BG, ICON_BADGE_BG_ACCENT, ICON_BADGE_BG_GOLD, fraunces } from "@/lib/theme";
import { HomeIcon, SwapIcon, RefreshIcon, UsersIcon, DocumentExtendIcon } from "@/components/icons";
import contentStyles from "@/styles/contentPage.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Services — Five Star Conveyancing",
  description: "Conveyancing transaction types we compare quotes for: sale, purchase, remortgage, transfer of equity, and lease extension.",
};

const TRANSACTION_TYPES = [
  { icon: HomeIcon, bg: ICON_BADGE_BG, iconColor: TEAL, title: "Purchase", body: "Buying a property, freehold or leasehold, with or without a mortgage." },
  { icon: HomeIcon, bg: ICON_BADGE_BG_ACCENT, iconColor: "oklch(0.5 0.22 350)", title: "Sale", body: "Selling a property you own." },
  { icon: SwapIcon, bg: ICON_BADGE_BG_GOLD, iconColor: "oklch(0.6 0.14 80)", title: "Sale and purchase", body: "Selling your current property and buying your next one at the same time." },
  { icon: RefreshIcon, bg: ICON_BADGE_BG, iconColor: TEAL, title: "Remortgage", body: "Switching mortgage lender or deal on a property you already own." },
  { icon: UsersIcon, bg: ICON_BADGE_BG_ACCENT, iconColor: "oklch(0.5 0.22 350)", title: "Transfer of equity", body: "Adding or removing a name from the title of a property — for example after marriage, divorce, or a change in ownership share." },
  { icon: DocumentExtendIcon, bg: ICON_BADGE_BG_GOLD, iconColor: "oklch(0.6 0.14 80)", title: "Lease extension", body: "Extending the remaining term of a leasehold property." },
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
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

        <section className={styles.gridSection}>
          <div className={styles.grid} style={{ display: "grid" }}>
            {TRANSACTION_TYPES.map((t) => (
              <div key={t.title} className={styles.item} style={{ background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.md }}>
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: t.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <t.icon size={24} color={t.iconColor} />
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{t.title}</h2>
                <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{t.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={contentStyles.ctaSection} style={{ textAlign: "center", paddingTop: 0 }}>
          <Link
            href="/get-a-quote"
            style={{ display: "inline-block", background: GRADIENT_CTA, boxShadow: SHADOW.md, color: "white", fontWeight: 800, fontSize: 15.5, padding: "17px 34px", borderRadius: RADIUS.pill, textDecoration: "none" }}
          >
            Get my quote →
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
