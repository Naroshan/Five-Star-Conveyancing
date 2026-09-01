import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ContactForm } from "@/components/ContactForm";
import { NAVY, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, TEAL, GRADIENT_CTA, RADIUS, SHADOW, display } from "@/lib/theme";
import contentStyles from "@/styles/contentPage.module.css";

export const metadata: Metadata = {
  title: "Contact — Five Star Conveyancing",
  description: "How to get in touch, and what happens after you select a firm through the comparison.",
};

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>
            Get in touch
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...display, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Contact
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: TEXT_BODY, maxWidth: 520, margin: 0 }}>
            Got a general question about the site? Send us a message below. For questions about a specific
            transaction, see who to contact instead further down this page.
          </p>
        </section>

        <div className={contentStyles.list}>
          <div className={contentStyles.itemPad} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm, maxWidth: 560 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 18px" }}>Send us a message</h2>
            <ContactForm />
          </div>
          <div className={contentStyles.itemPad} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>Already got a quote?</h2>
            <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 680, margin: 0 }}>
              Once you select a firm from your comparison, we pass your details to that firm directly — they&apos;ll
              be in touch to take things forward. Any questions about your specific transaction from that point on
              are best directed to them, since they&apos;re the ones handling it.
            </p>
          </div>
          <div className={contentStyles.itemPad} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>Questions about how the comparison works</h2>
            <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 680, margin: 0 }}>
              Most common questions — whether it&apos;s free, how firms are vetted, what happens after you select a
              firm — are answered on our{" "}
              <Link href="/faq" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
                FAQ page
              </Link>
              .
            </p>
          </div>
          <div className={contentStyles.itemPad} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>Complaints and regulatory contact</h2>
            <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 680, margin: 0 }}>
              Our complaints procedure and regulatory contact details are pending final review before publication.
              If your complaint concerns a specific firm you instructed, their own complaints procedure — which
              every SRA-regulated firm must publish — is the right place to start.
            </p>
          </div>
        </div>

        <section className={contentStyles.ctaSection} style={{ textAlign: "center", paddingTop: 0 }}>
          <Link
            href="/get-a-quote"
            className="cta-button"
            style={{ display: "inline-block", background: GRADIENT_CTA, boxShadow: SHADOW.md, color: NAVY, fontWeight: 800, fontSize: 14, padding: "13px 28px", borderRadius: RADIUS.pill, textDecoration: "none" }}
          >
            Compare quotes →
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
