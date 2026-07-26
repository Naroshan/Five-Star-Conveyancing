import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, TEAL, CREAM, BORDER, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, ACCENT_BOLD, RADIUS, fraunces } from "@/lib/theme";
import contentStyles from "@/styles/contentPage.module.css";

export const metadata: Metadata = {
  title: "FAQ — Five Star Conveyancing",
  description: "Common questions about comparing conveyancing quotes with Five Star Conveyancing.",
};

const FAQS = [
  {
    q: "Is the comparison free to use?",
    a: "Yes. There's no charge for getting or comparing quotes through the site.",
  },
  {
    q: "Are the firms regulated?",
    a: "Yes — we only compare quotes from SRA-regulated firms.",
  },
  {
    q: "How long does a quote stay valid?",
    a: "It varies by firm — each participating firm sets how long their quote holds, and the results page shows the expiry date for your specific quote.",
  },
  {
    q: "What happens after I select a firm?",
    a: "We pass your details to that firm so they can get in touch with you directly. Selecting a firm this way isn't a binding contract — you're free to instruct a different firm if you change your mind.",
  },
  {
    q: "Why are fees shown as legal fee, VAT, and disbursements separately, rather than one total?",
    a: "So you can see exactly what you're paying for and to whom, rather than a single bundled number that hides how it's made up. See our fees explained page for what each term means.",
  },
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ maxWidth: 1320, margin: "0 auto", background: CREAM, borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}` }}>
        <section className={contentStyles.hero} style={{ borderBottom: `2px solid ${NAVY}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 18 }}>
            Questions, answered
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...fraunces, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: 0, letterSpacing: "-0.02em" }}>
            Frequently asked questions
          </h1>
        </section>

        <section style={{ borderBottom: `2px solid ${NAVY}` }}>
          {FAQS.map((item, i) => (
            <div
              key={item.q}
              className={contentStyles.itemPad}
              style={{
                borderBottom: i < FAQS.length - 1 ? `1px solid ${BORDER}` : undefined,
              }}
            >
              <h2 style={{ fontSize: 16.5, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>{item.q}</h2>
              <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 640, margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </section>

        <section className={contentStyles.ctaSection} style={{ textAlign: "center" }}>
          <p style={{ fontSize: 13.5, color: TEXT_BODY, marginBottom: 28 }}>
            See also:{" "}
            <Link href="/how-it-works" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
              how it works
            </Link>{" "}
            and{" "}
            <Link href="/fees-explained" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
              fees explained
            </Link>
            .
          </p>
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
