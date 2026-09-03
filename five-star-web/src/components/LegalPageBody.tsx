import Link from "next/link";
import { NAVY, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, TEAL, GRADIENT_CTA, RADIUS, SHADOW, display } from "@/lib/theme";
import contentStyles from "@/styles/contentPage.module.css";

export interface LegalSection {
  heading: string;
  body: string[];
  /** A specific fact this section is missing (a registration number, an address, a not-yet-decided policy) that only the business can supply — rendered as a distinct callout rather than left unstated. */
  callout?: string;
}

const LAST_UPDATED = "3 September 2026";

export function LegalPageBody({ eyebrow, title, intro, sections }: { eyebrow: string; title: string; intro: string; sections: LegalSection[] }) {
  return (
    <div style={{ background: CREAM }}>
      <section className={contentStyles.hero}>
        <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>
          {eyebrow}
        </div>
        <h1 className={contentStyles.heroHeading} style={{ ...display, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 12px", letterSpacing: "-0.02em" }}>
          {title}
        </h1>
        <p style={{ fontSize: 14, lineHeight: 1.55, color: TEXT_BODY, maxWidth: 620, margin: "0 0 8px" }}>{intro}</p>
        <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0 }}>Last updated: {LAST_UPDATED}</p>
      </section>

      <div className={contentStyles.list}>
        {sections.map((s) => (
          <div key={s.heading} className={contentStyles.itemPad} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>{s.heading}</h2>
            {s.body.map((paragraph, i) => (
              <p key={i} style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 720, margin: i === 0 ? "0 0 10px" : "10px 0" }}>
                {paragraph}
              </p>
            ))}
            {s.callout && (
              <p
                style={{
                  fontSize: 12.5,
                  color: "oklch(0.5 0.15 60)",
                  background: "oklch(0.96 0.04 80)",
                  border: "1px solid oklch(0.85 0.08 75)",
                  borderRadius: RADIUS.sm,
                  padding: "10px 14px",
                  margin: "10px 0 0",
                  maxWidth: 720,
                  lineHeight: 1.55,
                }}
              >
                <strong>Still to confirm:</strong> {s.callout}
              </p>
            )}
          </div>
        ))}
      </div>

      <section className={contentStyles.ctaSection} style={{ textAlign: "center", paddingTop: 0 }}>
        <p style={{ fontSize: 13.5, color: TEXT_BODY, marginBottom: 18 }}>
          Questions about this page?{" "}
          <Link href="/contact" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
            Get in touch
          </Link>
          .
        </p>
        <Link
          href="/get-a-quote"
          className="cta-button"
          style={{ display: "inline-block", background: GRADIENT_CTA, boxShadow: SHADOW.md, color: NAVY, fontWeight: 800, fontSize: 14, padding: "13px 28px", borderRadius: RADIUS.pill, textDecoration: "none" }}
        >
          Get my quote →
        </Link>
      </section>
    </div>
  );
}
