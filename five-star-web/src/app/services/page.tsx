import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, GRADIENT_CTA, TEAL, RADIUS, SHADOW, fraunces } from "@/lib/theme";
import { SERVICE_TYPES } from "@/lib/serviceTypes";
import contentStyles from "@/styles/contentPage.module.css";
import styles from "@/styles/tileGrid.module.css";

export const metadata: Metadata = {
  title: "Services — Five Star Conveyancing",
  description: "Conveyancing transaction types we compare quotes for: sale, purchase, remortgage, transfer of equity, and lease extension.",
};

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
            {SERVICE_TYPES.map((t) => (
              <Link
                key={t.slug}
                href={`/services/${t.slug}`}
                className={styles.item}
                style={{ display: "block", background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.md, textDecoration: "none" }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: t.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <t.icon size={24} color={t.iconColor} />
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{t.title}</h2>
                <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{t.short}</p>
              </Link>
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
