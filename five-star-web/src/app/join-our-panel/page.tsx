import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FirmRecruitmentForm } from "@/components/FirmRecruitmentForm";
import { NAVY, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, TEAL, RADIUS, SHADOW, display } from "@/lib/theme";
import { pageMetadata } from "@/lib/seo";
import contentStyles from "@/styles/contentPage.module.css";

export const metadata: Metadata = pageMetadata({
  path: "/join-our-panel",
  title: "Join Our Panel — Five Star Conveyancing",
  description: "Apply to join the Five Star Conveyancing comparison panel — for SRA and CLC regulated conveyancing firms in England and Wales.",
});

const STEPS = [
  {
    heading: "You apply",
    body: "Tell us a bit about your firm and the areas you cover using the form below.",
  },
  {
    heading: "We check the basics",
    body: "We confirm your firm is genuinely regulated by the SRA or CLC before adding you to the panel — that's a condition for every firm we show, not an optional extra.",
  },
  {
    heading: "You appear in relevant comparisons",
    body: "Once you're on the panel, clients whose transaction type, location, and property details match what your firm accepts will see your itemised quote alongside the others.",
  },
  {
    heading: "You're contacted directly",
    body: "When a client selects your firm from their comparison, we pass their details straight to you — from that point, it's a normal instruction between you and your client.",
  },
];

export default function JoinOurPanelPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>
            For conveyancing firms
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...display, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Join our panel
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: TEXT_BODY, maxWidth: 560, margin: 0 }}>
            We compare itemised conveyancing quotes for clients across England and Wales. If your firm is regulated
            by the Solicitors Regulation Authority (SRA) or the Council for Licensed Conveyancers (CLC), you can
            apply to be included in those comparisons.
          </p>
        </section>

        <section className={contentStyles.ctaSection} style={{ paddingTop: 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 16px" }}>How it works</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, maxWidth: 900 }}>
            {STEPS.map((step, i) => (
              <div key={step.heading} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm, padding: "16px 18px" }}>
                <div style={{ fontSize: 12, fontWeight: 800, color: TEAL, marginBottom: 8 }}>Step {i + 1}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{step.heading}</h3>
                <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={contentStyles.ctaSection} style={{ paddingTop: 0, maxWidth: 700 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>How it&apos;s funded</h2>
          <p style={{ fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.65, margin: 0 }}>
            Comparing quotes is free for clients. As set out in our{" "}
            <Link href="/terms" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
              terms
            </Link>
            , we may receive a fee or commission from your firm when a client goes on to instruct you through the
            comparison — the exact terms are confirmed once your application is reviewed, not fixed in advance here.
          </p>
        </section>

        <div className={contentStyles.list} style={{ maxWidth: 560 }}>
          <div className={contentStyles.itemPad} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 18px" }}>Apply to join</h2>
            <FirmRecruitmentForm />
          </div>
        </div>

        <section className={contentStyles.ctaSection} style={{ paddingTop: 0 }}>
          <p style={{ fontSize: 13.5, color: TEXT_BODY, margin: 0 }}>
            Questions before applying?{" "}
            <Link href="/contact" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
              Get in touch
            </Link>
            .
          </p>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
