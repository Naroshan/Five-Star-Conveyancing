import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SdltCalculator } from "@/components/SdltCalculator";
import { NAVY, TEAL, CREAM, TEXT_BODY, TEXT_MUTED, BORDER, GRADIENT_CTA, RADIUS, SHADOW, display } from "@/lib/theme";
import contentStyles from "@/styles/contentPage.module.css";

export const metadata: Metadata = {
  title: "Stamp Duty & Land Transaction Tax calculator — Five Star Conveyancing",
  description:
    "Work out roughly how much Stamp Duty Land Tax (England) or Land Transaction Tax (Wales) you'll pay on a property, using current published HMRC and Welsh Revenue Authority rates.",
};

export default function SdltCalculatorPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>
            England & Wales
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...display, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Stamp Duty &amp; Land Transaction Tax calculator
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: TEXT_BODY, maxWidth: 560, margin: 0 }}>
            Work out roughly how much tax you&apos;ll pay on a property purchase, using current published HMRC and
            Welsh Revenue Authority rates — before you compare conveyancing quotes.
          </p>
        </section>

        <section className={contentStyles.ctaSection} style={{ paddingTop: 0 }}>
          <div
            style={{
              maxWidth: 560,
              margin: "0 auto",
              background: "white",
              border: `1px solid ${BORDER}`,
              borderRadius: RADIUS.lg,
              boxShadow: SHADOW.md,
              padding: 24,
            }}
          >
            <SdltCalculator />
          </div>
        </section>

        <section className={contentStyles.ctaSection} style={{ textAlign: "center", paddingTop: 0 }}>
          <Link
            href="/get-a-quote"
            className="cta-button"
            style={{ display: "inline-block", background: GRADIENT_CTA, boxShadow: SHADOW.md, color: NAVY, fontWeight: 800, fontSize: 15.5, padding: "17px 34px", borderRadius: RADIUS.pill, textDecoration: "none" }}
          >
            Get my quote →
          </Link>
        </section>

        <section className={contentStyles.ctaSection} style={{ paddingTop: 0 }}>
          <p style={{ fontSize: 13.5, color: TEXT_MUTED, margin: 0, textAlign: "center" }}>
            Want the full picture on fees too?{" "}
            <Link href="/fees-explained" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
              See how fees are explained
            </Link>
          </p>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
