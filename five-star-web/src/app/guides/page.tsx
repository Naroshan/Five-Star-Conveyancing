import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, TEAL, RADIUS, SHADOW, fraunces } from "@/lib/theme";
import { GUIDES } from "@/lib/guides";
import contentStyles from "@/styles/contentPage.module.css";
import styles from "@/styles/tileGrid.module.css";

export const metadata: Metadata = {
  title: "Guides — Five Star Conveyancing",
  description: "Plain-English guides to conveyancing: what's involved, leasehold vs freehold, Stamp Duty Land Tax, and typical timelines.",
};

export default function GuidesPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 18 }}>
            Learn
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...fraunces, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Guides
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: TEXT_BODY, maxWidth: 520, margin: 0 }}>
            Plain-English explanations of how conveyancing actually works, written so you know what to expect before you start.
          </p>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.grid} style={{ display: "grid" }}>
            {GUIDES.map((g) => (
              <Link
                key={g.slug}
                href={`/guides/${g.slug}`}
                className={styles.item}
                style={{ display: "block", background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.md, textDecoration: "none" }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: g.iconBg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <g.icon size={24} color={g.iconColor} />
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{g.title}</h2>
                <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{g.description}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
