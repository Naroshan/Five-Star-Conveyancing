import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, CREAM, TEAL, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, GRADIENT_CTA, GRADIENT_TEAL, RADIUS, SHADOW, display } from "@/lib/theme";
import { HomeIcon, ClockIcon, CheckCircleIcon } from "@/components/icons";
import contentStyles from "@/styles/contentPage.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "How it works — Five Star Conveyancing",
  description: "How our conveyancing comparison works: answer a few questions, see a real itemised comparison, choose a firm.",
};

const STEPS = [
  {
    n: "01",
    icon: HomeIcon,
    title: "Answer a few questions",
    body: "Tell us about the property and the transaction — value, tenure, whether a mortgage is involved, and anything unusual about the situation.",
  },
  {
    n: "02",
    icon: ClockIcon,
    title: "See a real comparison",
    body: "We show you an itemised breakdown for each participating firm — legal fee, VAT, and disbursements listed separately, never bundled into one number.",
  },
  {
    n: "03",
    icon: CheckCircleIcon,
    title: "Choose a firm",
    body: "Pick the firm that's right for you directly from the comparison. There's no obligation, and no fee to use the comparison itself.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 18 }}>
            The process
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...display, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            How it works
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: TEXT_BODY, maxWidth: 480, margin: 0 }}>
            Three steps between you and a genuine, itemised conveyancing comparison.
          </p>
        </section>

        <div className={styles.steps}>
          {STEPS.map((step) => (
            <div key={step.n} className={styles.step} style={{ display: "grid", background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.md }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: "50%",
                  background: GRADIENT_TEAL,
                  color: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <step.icon size={24} color="white" />
              </div>
              <div>
                <div style={{ ...display, fontSize: 13, fontWeight: 600, color: TEAL, marginBottom: 4 }}>Step {step.n}</div>
                <h2 style={{ fontSize: 19, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>{step.title}</h2>
                <p style={{ fontSize: 15, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 620, margin: 0 }}>{step.body}</p>
              </div>
            </div>
          ))}
        </div>

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
