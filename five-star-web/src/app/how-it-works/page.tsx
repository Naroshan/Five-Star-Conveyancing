import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, TEAL, CREAM, BORDER, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, fraunces } from "@/lib/theme";
import contentStyles from "@/styles/contentPage.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "How it works — Five Star Conveyancing",
  description: "How our conveyancing comparison works: answer a few questions, see a real itemised comparison, choose a firm.",
};

const STEPS = [
  {
    n: "01",
    title: "Answer a few questions",
    body: "Tell us about the property and the transaction — value, tenure, whether a mortgage is involved, and anything unusual about the situation.",
  },
  {
    n: "02",
    title: "See a real comparison",
    body: "We show you an itemised breakdown for each participating firm — legal fee, VAT, and disbursements listed separately, never bundled into one number.",
  },
  {
    n: "03",
    title: "Choose a firm",
    body: "Pick the firm that's right for you directly from the comparison. There's no obligation, and no fee to use the comparison itself.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ maxWidth: 1320, margin: "0 auto", background: CREAM, borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}` }}>
        <section className={contentStyles.hero} style={{ borderBottom: `2px solid ${NAVY}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 18 }}>
            The process
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...fraunces, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            How it works
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: TEXT_BODY, maxWidth: 480, margin: 0 }}>
            Three steps between you and a genuine, itemised conveyancing comparison.
          </p>
        </section>

        <section style={{ borderBottom: `2px solid ${NAVY}` }}>
          {STEPS.map((step, i) => (
            <div
              key={step.n}
              className={styles.step}
              style={{
                display: "grid",
                borderBottom: i < STEPS.length - 1 ? `1px solid ${BORDER}` : undefined,
              }}
            >
              <div className={styles.stepNumber} style={{ ...fraunces, fontWeight: 600, color: TEAL }}>{step.n}</div>
              <div>
                <h2 style={{ fontSize: 19, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>{step.title}</h2>
                <p style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 620, margin: 0 }}>{step.body}</p>
              </div>
            </div>
          ))}
        </section>

        <section className={contentStyles.ctaSection} style={{ textAlign: "center" }}>
          <Link
            href="/get-a-quote"
            style={{ display: "inline-block", background: TEAL, color: "white", fontWeight: 800, fontSize: 15.5, padding: "17px 34px", textDecoration: "none" }}
          >
            Get my quote →
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
