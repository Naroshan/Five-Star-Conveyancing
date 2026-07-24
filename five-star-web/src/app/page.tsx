import Link from "next/link";

// Colors match the design source exactly (Five Star - Home.dc.html).
const NAVY = "oklch(0.2 0.02 240)";
const TEAL = "oklch(0.45 0.1 190)";
const GOLD = "oklch(0.75 0.15 80)";
const CREAM = "oklch(0.97 0.012 80)";
const CREAM_ALT = "oklch(0.94 0.015 80)";
const BORDER = "oklch(0.88 0.01 80)";
const BORDER_ALT = "oklch(0.85 0.01 80)";
const TEXT_HEADING = "oklch(0.22 0.03 240)";
const TEXT_BODY = "oklch(0.4 0.02 240)";
const TEXT_MUTED = "oklch(0.5 0.02 240)";
const TEXT_ON_NAVY_MUTED = "oklch(0.75 0.02 240)";
const TEXT_ON_NAVY_BODY = "oklch(0.35 0.02 240)";

const fraunces = { fontFamily: "var(--font-fraunces), 'Fraunces', serif" };

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

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      style={{ fontWeight: 700, fontSize: 14, color: TEXT_HEADING, borderBottom: "2px solid transparent", paddingBottom: 2, textDecoration: "none" }}
    >
      {children}
    </Link>
  );
}

export default function HomePage() {
  return (
    <div style={{ maxWidth: 1320, margin: "0 auto", background: CREAM, borderLeft: `1px solid ${BORDER}`, borderRight: `1px solid ${BORDER}` }}>
      <header
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "22px 44px",
          borderBottom: `2px solid ${NAVY}`,
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <Link href="/" style={{ fontStretch: "condensed", letterSpacing: "-0.01em", fontSize: 20, lineHeight: 1, textDecoration: "none" }}>
          <span style={{ fontWeight: 800, color: NAVY }}>FIVE</span>
          <span style={{ fontWeight: 800, color: TEAL }}>STAR</span>
          <span style={{ fontWeight: 600, color: TEXT_MUTED }}>CONVEYANCING</span>
        </Link>
        <nav style={{ display: "flex", alignItems: "center", gap: 34, flexWrap: "wrap" }}>
          <NavLink href="/get-a-quote">Compare</NavLink>
          <NavLink href="/fees-explained">Fees</NavLink>
          {/* No real authored guide content yet — not linked, same treatment as "Knowledge hub" elsewhere on the site. */}
          <span style={{ fontWeight: 700, fontSize: 14, color: TEXT_MUTED }}>Guides</span>
          <NavLink href="/faq">FAQ</NavLink>
          <Link
            href="/get-a-quote"
            style={{ fontWeight: 800, fontSize: 14, color: CREAM, background: NAVY, padding: "12px 26px", whiteSpace: "nowrap", textDecoration: "none" }}
          >
            Get a quote
          </Link>
        </nav>
      </header>

      {/* HERO */}
      <section style={{ display: "grid", gridTemplateColumns: "1.15fr 0.85fr", borderBottom: `2px solid ${NAVY}` }}>
        <div style={{ padding: "80px 48px", borderRight: `1px solid ${BORDER}` }}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 22 }}>
            Conveyancing, compared honestly
          </div>
          <h1
            style={{
              ...fraunces,
              fontWeight: 600,
              fontSize: 56,
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
              style={{ display: "inline-block", background: TEAL, color: "white", fontWeight: 800, fontSize: 15.5, padding: "17px 34px", textDecoration: "none" }}
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
        <div style={{ padding: "80px 48px", background: NAVY, display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
          <Stat value="4.8/5" label="Trustpilot · 6,200+ reviews" />
          <Divider />
          <Stat value="£0" label="to compare, always free" />
          <Divider />
          <Stat value="100%" label="SRA-regulated firms only" />
        </div>
      </section>

      {/* COMPARE TEASER */}
      <section style={{ padding: "64px 48px", borderBottom: `2px solid ${NAVY}` }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: 48 }}>
          <div>
            <h2 style={{ ...fraunces, fontWeight: 600, fontSize: 28, color: NAVY, margin: "0 0 12px" }}>Real quotes, side by side</h2>
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
      <section style={{ padding: "56px 48px", textAlign: "center", background: GOLD, borderBottom: `2px solid ${NAVY}` }}>
        <div style={{ ...fraunces, fontSize: 46, fontWeight: 600, color: NAVY, marginBottom: 10 }}>£480</div>
        <p style={{ fontSize: 15.5, color: "oklch(0.3 0.05 80)", maxWidth: 420, margin: "0 auto", fontWeight: 600 }}>
          the typical gap between the cheapest and priciest quote on a £250,000 purchase. We show you both.
        </p>
      </section>

      {/* THREE PILLARS */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderBottom: `2px solid ${NAVY}` }}>
        {PILLARS.map((p, i) => (
          <div key={p.n} style={{ padding: "48px 40px", borderRight: i < PILLARS.length - 1 ? `1px solid ${BORDER}` : undefined }}>
            <div style={{ ...fraunces, fontSize: 22, color: TEAL, marginBottom: 14 }}>{p.n}</div>
            <h3 style={{ fontSize: 16.5, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{p.title}</h3>
            <p style={{ fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{p.body}</p>
          </div>
        ))}
      </section>

      {/* HOW IT WORKS */}
      <section style={{ padding: "64px 48px", borderBottom: `2px solid ${NAVY}` }}>
        <h2 style={{ ...fraunces, fontWeight: 600, fontSize: 30, color: NAVY, margin: "0 0 36px" }}>How it works</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", borderTop: `1px solid ${BORDER}`, borderLeft: `1px solid ${BORDER}` }}>
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
      <section style={{ padding: "64px 48px", borderBottom: `2px solid ${NAVY}`, background: CREAM_ALT }}>
        <h2 style={{ ...fraunces, fontWeight: 600, fontSize: 30, color: NAVY, margin: "0 0 36px" }}>What movers say</h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", borderTop: `1px solid ${BORDER_ALT}`, borderLeft: `1px solid ${BORDER_ALT}` }}>
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
      <section style={{ padding: "64px 48px", textAlign: "center", background: NAVY }}>
        <h2 style={{ ...fraunces, fontWeight: 600, fontSize: 32, color: "white", margin: "0 0 24px" }}>Ready to compare?</h2>
        <Link
          href="/get-a-quote"
          style={{ display: "inline-block", background: GOLD, color: NAVY, fontWeight: 800, fontSize: 16, padding: "18px 40px", textDecoration: "none" }}
        >
          Get my quotes →
        </Link>
      </section>

      <footer style={{ padding: "40px 48px", background: "oklch(0.15 0.02 240)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ fontStretch: "condensed", letterSpacing: "-0.01em", fontSize: 16 }}>
            <span style={{ fontWeight: 800, color: "white" }}>FIVE</span>
            <span style={{ fontWeight: 800, color: GOLD }}>STAR</span>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 13, fontWeight: 600, flexWrap: "wrap" }}>
            <Link href="/get-a-quote" style={{ color: TEXT_ON_NAVY_MUTED, textDecoration: "none" }}>
              Compare
            </Link>
            <Link href="/fees-explained" style={{ color: TEXT_ON_NAVY_MUTED, textDecoration: "none" }}>
              Fees
            </Link>
            <span style={{ color: TEXT_ON_NAVY_BODY }}>Guides</span>
            <Link href="/faq" style={{ color: TEXT_ON_NAVY_MUTED, textDecoration: "none" }}>
              FAQ
            </Link>
          </div>
        </div>
        <p style={{ fontSize: 11.5, color: "oklch(0.55 0.02 240)", maxWidth: 600, margin: "20px 0 0" }}>
          Five Star Conveyancing is a comparison service. Regulatory disclosures pending final review. © 2026 Five Star Conveyancing.
        </p>
      </footer>
    </div>
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
