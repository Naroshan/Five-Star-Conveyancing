import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, TEAL, CREAM, BORDER, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, ACCENT_BOLD, RADIUS, fraunces } from "@/lib/theme";
import contentStyles from "@/styles/contentPage.module.css";

export const metadata: Metadata = {
  title: "Fees explained — Five Star Conveyancing",
  description: "What legal fees, VAT, and disbursements actually mean in a conveyancing quote, and why we show them separately.",
};

const TERMS = [
  {
    title: "Legal fee",
    body: "The solicitor's or conveyancer's own charge for their professional work on your transaction. This is what you're paying them for their time and expertise — separate from any third-party costs.",
  },
  {
    title: "VAT",
    body: "Value Added Tax, charged on top of most legal fees at the standard rate. Some disbursements attract VAT and some don't, depending on what they are — a genuine breakdown shows this per item rather than guessing.",
  },
  {
    title: "Disbursements",
    body: "Costs the firm pays to third parties on your behalf and passes on to you — for example search fees, Land Registry fees, or telegraphic transfer fees. These aren't the firm's own charge, so they're listed separately from the legal fee.",
  },
  {
    title: "Estimated vs guaranteed",
    body: "Some charges are fixed and guaranteed up front. Others are genuinely estimated — usually because the exact cost depends on something that isn't known until later in the transaction. A trustworthy comparison should tell you which is which, not present an estimate as if it were guaranteed.",
  },
];

export default function FeesExplainedPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ maxWidth: 1320, margin: "0 auto", background: CREAM, borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}` }}>
        <section className={contentStyles.hero} style={{ borderBottom: `2px solid ${NAVY}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 18 }}>
            No hidden totals
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...fraunces, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Fees explained
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: TEXT_BODY, maxWidth: 520, margin: 0 }}>
            What the terms on your comparison actually mean, and why we show them separately rather than as one
            bundled number.
          </p>
        </section>

        <section style={{ borderBottom: `2px solid ${NAVY}` }}>
          {TERMS.map((t, i) => (
            <div
              key={t.title}
              className={contentStyles.itemPad}
              style={{
                borderBottom: i < TERMS.length - 1 ? `1px solid ${BORDER}` : undefined,
              }}
            >
              <h2 style={{ fontSize: 18, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>{t.title}</h2>
              <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 640, margin: 0 }}>{t.body}</p>
            </div>
          ))}
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
