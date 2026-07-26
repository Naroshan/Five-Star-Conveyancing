import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, TEAL, GOLD, CREAM, CREAM_ALT, BORDER, BORDER_ALT, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, TEXT_ON_NAVY_MUTED, ACCENT_BOLD, RADIUS, fraunces } from "@/lib/theme";
import styles from "./page.module.css";

const HOW_IT_WORKS = [
  { n: "01", title: "Tell us your move", body: "Price, postcode, buying or selling — 60 seconds." },
  { n: "02", title: "Get itemised quotes", body: "Fee, VAT and disbursements, never bundled." },
  { n: "03", title: "Compare and pick", body: "All firms regulated — compare price and service." },
  { n: "04", title: "Instruct directly", body: "No middleman fees, ever." },
];

const PILLARS = [
  { n: "01", title: "SRA-regulated only", body: "Every firm vetted for regulation and complaints history." },
  { n: "02", title: "Nothing hidden", body: "Legal fee, VAT and disbursements, always itemised." },
  { n: "03", title: "Free, always", body: "Comparing never costs you anything." },
];

const EXAMPLE_QUOTES = [
  { name: "Firm A Solicitors", rating: "★★★★★ 4.9 · cheapest", price: "£1,252", priceColor: TEAL },
  { name: "Firm B Legal Group", rating: "★★★★☆ 4.6", price: "£1,332", priceColor: TEXT_HEADING },
  { name: "Firm C Property Law", rating: "★★★★☆ 4.5", price: "£1,444", priceColor: TEXT_HEADING },
];

const TESTIMONIALS = [
  { quote: "Finally a site that shows VAT and disbursements upfront. No surprises.", author: "Rachel H. — First-time buyer" },
  { quote: "Three quotes in two minutes, picked the clearest one. Simple.", author: "David O. — Home mover" },
  { quote: "No sales calls afterwards. Would use again for remortgaging.", author: "Priya K. — Remortgaging" },
];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <div style={{ maxWidth: 1320, margin: "0 auto", background: CREAM, borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}` }}>
        {/* HERO */}
        <section className={styles.hero} style={{ display: "grid", borderBottom: `2px solid ${NAVY}` }}>
          <div className={styles.heroCol} style={{ borderRight: `1px solid ${BORDER}` }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 22 }}>
              Conveyancing, compared honestly
            </div>
            <h1
              className={styles.heroHeading}
              style={{
                ...fraunces,
                fontWeight: 600,
                lineHeight: 1.05,
                color: NAVY,
                margin: "0 0 24px",
                letterSpacing: "-0.02em",
                textWrap: "balance",
              }}
            >
              Know exactly what you&apos;ll pay, before you choose.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: TEXT_BODY, maxWidth: 440, margin: "0 0 36px" }}>
              Legal fee, VAT and disbursements — itemised, side by side, from SRA-regulated firms only.
            </p>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap" }}>
              <Link
                href="/get-a-quote"
                style={{
                  display: "inline-block",
                  background: ACCENT_BOLD,
                  color: "white",
                  fontWeight: 800,
                  fontSize: 15.5,
                  padding: "17px 34px",
                  borderRadius: RADIUS.pill,
                  textDecoration: "none",
                }}
              >
                Compare quotes →
              </Link>
              <Link
                href="/fees-explained"
                style={{ fontWeight: 700, fontSize: 15, color: NAVY, borderBottom: `2px solid ${NAVY}`, paddingBottom: 2, textDecoration: "none" }}
              >
                See sample fees
              </Link>
            </div>
          </div>
          <div className={styles.heroCol} style={{ background: NAVY, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
            <Stat value="4.8/5" label="Trustpilot · 6,200+ reviews" />
            <Divider />
            <Stat value="£0" label="to compare, always free" />
            <Divider />
            <Stat value="100%" label="SRA-regulated firms only" />
          </div>
        </section>

        {/* COMPARE TEASER */}
        <section className={styles.sectionPad} style={{ borderBottom: `2px solid ${NAVY}` }}>
          <div className={styles.compareGrid} style={{ display: "grid" }}>
            <div>
              <h2 className={styles.compareHeading} style={{ ...fraunces, fontWeight: 600, color: NAVY, margin: "0 0 12px" }}>Real quotes, side by side</h2>
              <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.6, margin: "0 0 20px" }}>Example results for a £250,000 freehold purchase.</p>
              <Link
                href="/get-a-quote"
                style={{ fontWeight: 700, fontSize: 14, borderBottom: `2px solid ${TEAL}`, paddingBottom: 2, textDecoration: "none" }}
              >
                See all quotes →
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {EXAMPLE_QUOTES.map((q, i) => (
                <div
                  key={q.name}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: 20,
                    padding: "18px 0",
                    borderBottom: i < EXAMPLE_QUOTES.length - 1 ? `1px solid ${BORDER}` : undefined,
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: TEXT_HEADING }}>
                    {q.name} <span style={{ fontWeight: 600, color: TEXT_MUTED, fontSize: 12.5 }}>{q.rating}</span>
                  </div>
                  <div style={{ ...fraunces, fontSize: 20, fontWeight: 600, color: q.priceColor }}>{q.price}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOCAL STAT */}
        <section className={styles.sectionPad} style={{ textAlign: "center", background: GOLD, borderBottom: `2px solid ${NAVY}` }}>
          <div className={styles.focalValue} style={{ ...fraunces, fontWeight: 600, color: NAVY, marginBottom: 10 }}>£480</div>
          <p style={{ fontSize: 15.5, color: "oklch(0.3 0.05 80)", maxWidth: 420, margin: "0 auto", fontWeight: 600 }}>
            the typical gap between the cheapest and priciest quote on a £250,000 purchase. We show you both.
          </p>
        </section>

        {/* THREE PILLARS */}
        <section className={styles.pillarsGrid} style={{ display: "grid", borderBottom: `2px solid ${NAVY}` }}>
          {PILLARS.map((p, i) => (
            <div key={p.n} className={styles.pillarItem} style={{ borderRight: i < PILLARS.length - 1 ? `1px solid ${BORDER}` : undefined }}>
              <div style={{ ...fraunces, fontSize: 22, color: TEAL, marginBottom: 14 }}>{p.n}</div>
              <h3 style={{ fontSize: 16.5, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{p.title}</h3>
              <p style={{ fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{p.body}</p>
            </div>
          ))}
        </section>

        {/* HOW IT WORKS */}
        <section className={styles.sectionPad} style={{ borderBottom: `2px solid ${NAVY}` }}>
          <h2 className={styles.sectionHeading} style={{ ...fraunces, fontWeight: 600, color: NAVY, margin: "0 0 36px" }}>How it works</h2>
          <div className={styles.howGrid} style={{ display: "grid", borderTop: `1px solid ${BORDER}`, borderLeft: `1px solid ${BORDER}` }}>
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n} style={{ padding: 26, borderRight: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
                <div style={{ ...fraunces, fontSize: 20, fontWeight: 600, color: TEAL, marginBottom: 10 }}>{s.n}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className={styles.sectionPad} style={{ borderBottom: `2px solid ${NAVY}`, background: CREAM_ALT }}>
          <h2 className={styles.sectionHeading} style={{ ...fraunces, fontWeight: 600, color: NAVY, margin: "0 0 36px" }}>What movers say</h2>
          <div className={styles.testimonialsGrid} style={{ display: "grid", borderTop: `1px solid ${BORDER_ALT}`, borderLeft: `1px solid ${BORDER_ALT}` }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.author} style={{ padding: 26, borderRight: `1px solid ${BORDER_ALT}`, borderBottom: `1px solid ${BORDER_ALT}`, background: CREAM }}>
                <div style={{ color: TEAL, fontSize: 13, marginBottom: 12 }}>★★★★★</div>
                <p style={{ fontSize: 14, color: "oklch(0.35 0.02 240)", lineHeight: 1.6, margin: "0 0 14px" }}>&quot;{t.quote}&quot;</p>
                <p style={{ fontSize: 12.5, fontWeight: 700, color: TEXT_HEADING, margin: 0 }}>{t.author}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BAND */}
        <section className={styles.sectionPad} style={{ textAlign: "center", background: NAVY }}>
          <h2 className={styles.ctaHeading} style={{ ...fraunces, fontWeight: 600, color: "white", margin: "0 0 24px" }}>Ready to compare?</h2>
          <Link
            href="/get-a-quote"
            style={{
              display: "inline-block",
              background: ACCENT_BOLD,
              color: "white",
              fontWeight: 800,
              fontSize: 16,
              padding: "18px 40px",
              borderRadius: RADIUS.pill,
              textDecoration: "none",
            }}
          >
            Get my quotes →
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div style={{ ...fraunces, fontSize: 44, fontWeight: 600, color: GOLD, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 13, color: TEXT_ON_NAVY_MUTED, marginTop: 6 }}>{label}</div>
    </div>
  );
}

function Divider() {
  return <div style={{ height: 1, background: "oklch(0.35 0.02 240)" }} />;
}
