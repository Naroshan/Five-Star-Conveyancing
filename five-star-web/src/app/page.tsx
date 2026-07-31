import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroQuoteWidget } from "@/components/HeroQuoteWidget";
import { HeroChainMotif } from "@/components/HeroChainMotif";
import {
  NAVY,
  TEAL,
  GOLD,
  CREAM,
  CREAM_ALT,
  TEXT_HEADING,
  TEXT_MUTED,
  GRADIENT_HERO,
  GRADIENT_GOLD_BAND,
  GRADIENT_TEAL,
  SHADOW,
  RADIUS,
  ICON_BADGE_BG,
  ICON_BADGE_BG_ACCENT,
  ICON_BADGE_BG_GOLD,
  display,
} from "@/lib/theme";
import { ShieldCheckIcon, PoundCoinIcon, CheckCircleIcon, StarIcon, RibbonBadgeIcon } from "@/components/icons";
import styles from "./page.module.css";

const HOW_IT_WORKS = [
  { n: "01", title: "Tell us your move", body: "Price, postcode, buying or selling — 60 seconds." },
  { n: "02", title: "Get itemised quotes", body: "Fee, VAT and disbursements, never bundled." },
  { n: "03", title: "Compare and pick", body: "All firms regulated — compare price and service." },
  { n: "04", title: "Instruct directly", body: "No middleman fees, ever." },
];

const PILLARS = [
  { icon: ShieldCheckIcon, bg: ICON_BADGE_BG, iconColor: TEAL, title: "SRA-regulated only", body: "Every firm vetted for regulation and complaints history." },
  { icon: PoundCoinIcon, bg: ICON_BADGE_BG_ACCENT, iconColor: "oklch(0.5 0.22 350)", title: "Nothing hidden", body: "Legal fee, VAT and disbursements, always itemised." },
  { icon: CheckCircleIcon, bg: ICON_BADGE_BG_GOLD, iconColor: "oklch(0.6 0.14 80)", title: "Free, always", body: "Comparing never costs you anything." },
];

const EXAMPLE_QUOTES = [
  { name: "Firm A Solicitors", rating: 5, ratingLabel: "4.9", price: "£1,252", cheapest: true },
  { name: "Firm B Legal Group", rating: 4, ratingLabel: "4.6", price: "£1,332", cheapest: false },
  { name: "Firm C Property Law", rating: 4, ratingLabel: "4.5", price: "£1,444", cheapest: false },
];

const TESTIMONIALS = [
  { quote: "Finally a site that shows VAT and disbursements upfront. No surprises.", author: "Rachel H.", role: "First-time buyer", avatarBg: TEAL },
  { quote: "Three quotes in two minutes, picked the clearest one. Simple.", author: "David O.", role: "Home mover", avatarBg: "oklch(0.5 0.22 350)" },
  { quote: "No sales calls afterwards. Would use again for remortgaging.", author: "Priya K.", role: "Remortgaging", avatarBg: "oklch(0.6 0.14 80)" },
];

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        {/* HERO */}
        <section className={styles.hero} style={{ background: GRADIENT_HERO, position: "relative", overflow: "hidden", textAlign: "center" }}>
          <HeroChainMotif />
          <div className={styles.heroInner} style={{ position: "relative", zIndex: 1, margin: "0 auto" }}>
            <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: "oklch(0.85 0.15 80)", marginBottom: 22 }}>
              Conveyancing, compared honestly
            </div>
            <h1
              className={styles.heroHeading}
              style={{
                ...display,
                fontWeight: 600,
                lineHeight: 1.05,
                color: "white",
                margin: "0 0 20px",
                letterSpacing: "-0.02em",
                textWrap: "balance",
              }}
            >
              Know exactly <span style={{ color: "oklch(0.82 0.15 85)" }}>what you&apos;ll pay</span>, before you choose.
            </h1>
            <p style={{ fontSize: 17, lineHeight: 1.65, color: "oklch(0.85 0.03 240)", maxWidth: 520, margin: "0 auto 40px" }}>
              Legal fee, VAT and disbursements — itemised, side by side, from SRA-regulated firms only.
            </p>

            <div className={styles.heroBarWrap}>
              <HeroQuoteWidget />
            </div>

            <div style={{ display: "flex", gap: 28, flexWrap: "wrap", justifyContent: "center", marginTop: 36 }}>
              <StatChip icon={StarIcon} value="4.8/5" label="Trustpilot · 6,200+ reviews" />
              <StatChip icon={PoundCoinIcon} value="£0" label="to compare, always free" />
              <StatChip icon={ShieldCheckIcon} value="100%" label="SRA-regulated firms only" />
            </div>

            <Link
              href="/fees-explained"
              style={{ display: "inline-block", marginTop: 30, fontWeight: 700, fontSize: 14, color: "white", borderBottom: "2px solid oklch(1 0 0 / 0.5)", paddingBottom: 2, textDecoration: "none" }}
            >
              See sample fees →
            </Link>
          </div>
        </section>

        {/* GUARANTEE STRIP — bold, punchy, built on real promises already
            made elsewhere on the site (free to compare, itemised, no
            obligation), not a fabricated discount or limited-time claim. */}
        <section style={{ background: NAVY, padding: "22px 24px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", alignItems: "center", gap: "12px 40px", maxWidth: 900, margin: "0 auto" }}>
            {["No hidden fees", "No obligation, ever", "Always free to compare"].map((claim) => (
              <div key={claim} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <CheckCircleIcon size={18} color="oklch(0.82 0.15 85)" />
                <span style={{ ...display, fontSize: 15.5, fontWeight: 700, color: "white", whiteSpace: "nowrap" }}>{claim}</span>
              </div>
            ))}
          </div>
        </section>

        {/* COMPARE TEASER */}
        <section className={styles.sectionPad}>
          <div className={styles.compareGrid} style={{ display: "grid" }}>
            <div>
              <h2 className={styles.compareHeading} style={{ ...display, fontWeight: 600, color: NAVY, margin: "0 0 12px" }}>Real quotes, side by side</h2>
              <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.6, margin: "0 0 20px" }}>Example results for a £250,000 freehold purchase.</p>
              <Link
                href="/get-a-quote"
                style={{ fontWeight: 700, fontSize: 14, borderBottom: `2px solid ${TEAL}`, paddingBottom: 2, textDecoration: "none" }}
              >
                See all quotes →
              </Link>
            </div>
            <div className={styles.quoteCards}>
              {EXAMPLE_QUOTES.map((q) => (
                <div
                  key={q.name}
                  style={{
                    position: "relative",
                    display: "grid",
                    gridTemplateColumns: "1fr auto",
                    alignItems: "center",
                    gap: 20,
                    padding: "20px 24px",
                    background: "white",
                    borderRadius: RADIUS.md,
                    boxShadow: q.cheapest ? SHADOW.lg : SHADOW.sm,
                  }}
                >
                  {q.cheapest && (
                    <span
                      style={{
                        position: "absolute",
                        top: -10,
                        left: 20,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 4,
                        background: "oklch(0.5 0.22 350)",
                        color: "white",
                        fontSize: 11,
                        fontWeight: 800,
                        padding: "4px 10px",
                        borderRadius: RADIUS.pill,
                        boxShadow: SHADOW.sm,
                      }}
                    >
                      <RibbonBadgeIcon size={12} color="white" /> Cheapest
                    </span>
                  )}
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14.5, color: TEXT_HEADING, marginBottom: 4 }}>{q.name}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <StarIcon key={i} size={12} color={i < q.rating ? GOLD : "oklch(0.9 0.01 80)"} />
                      ))}
                      <span style={{ fontWeight: 600, color: TEXT_MUTED, fontSize: 12.5, marginLeft: 4 }}>{q.ratingLabel}</span>
                    </div>
                  </div>
                  <div style={{ ...display, fontSize: 20, fontWeight: 600, color: q.cheapest ? "oklch(0.5 0.22 350)" : TEXT_HEADING }}>{q.price}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FOCAL STAT */}
        <section className={styles.sectionPad} style={{ textAlign: "center", background: GRADIENT_GOLD_BAND }}>
          <PoundCoinIcon size={44} color="oklch(0.35 0.06 80)" />
          <div className={styles.focalValue} style={{ ...display, fontWeight: 600, color: NAVY, marginTop: 8, marginBottom: 10 }}>£480</div>
          <p style={{ fontSize: 15.5, color: "oklch(0.3 0.05 80)", maxWidth: 420, margin: "0 auto", fontWeight: 600 }}>
            the typical gap between the cheapest and priciest quote on a £250,000 purchase. We show you both.
          </p>
        </section>

        {/* THREE PILLARS — styled as an itemised ledger, echoing the "always
            itemised, never bundled" promise structurally rather than as
            three matching icon-badge cards */}
        <section className={styles.sectionPad}>
          <div style={{ maxWidth: 720, margin: "0 auto", background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.md, padding: "8px 32px" }}>
            {PILLARS.map((p, i) => (
              <div
                key={p.title}
                className={styles.ledgerRow}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 18,
                  padding: "24px 0",
                  borderBottom: i < PILLARS.length - 1 ? "1px dashed oklch(0.85 0.01 80)" : "none",
                }}
              >
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: RADIUS.sm,
                    background: p.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <p.icon size={19} color={p.iconColor} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{ fontSize: 15.5, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 4px" }}>{p.title}</h3>
                  <p style={{ fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{p.body}</p>
                </div>
                <CheckCircleIcon size={20} color={TEAL} className={styles.ledgerCheck} />
              </div>
            ))}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className={styles.sectionPad}>
          <h2 className={styles.sectionHeading} style={{ ...display, fontWeight: 600, color: NAVY, margin: "0 0 36px" }}>How it works</h2>
          <div className={styles.howGrid} style={{ display: "grid" }}>
            <div className={styles.howConnector} />
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n} style={{ position: "relative", background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.md, padding: 24, textAlign: "center" }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: "50%",
                    background: GRADIENT_TEAL,
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    margin: "0 auto 14px",
                    ...display,
                    fontSize: 16,
                    fontWeight: 600,
                  }}
                >
                  {s.n}
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className={styles.sectionPad} style={{ background: CREAM_ALT }}>
          <h2 className={styles.sectionHeading} style={{ ...display, fontWeight: 600, color: NAVY, margin: "0 0 36px" }}>What movers say</h2>
          <div className={styles.testimonialsGrid} style={{ display: "grid" }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.author} style={{ position: "relative", background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.md, padding: "26px 26px 26px 30px", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 4, background: t.avatarBg }} />
                <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 14 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} size={14} color={GOLD} />
                  ))}
                </div>
                <p style={{ fontSize: 14, color: "oklch(0.35 0.02 240)", lineHeight: 1.6, margin: "0 0 18px" }}>&quot;{t.quote}&quot;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      minWidth: 34,
                      height: 26,
                      padding: "0 8px",
                      borderRadius: RADIUS.sm,
                      background: `color-mix(in oklch, ${t.avatarBg} 14%, white)`,
                      color: t.avatarBg,
                      fontSize: 12,
                      fontWeight: 800,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {initials(t.author)}
                  </div>
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 700, color: TEXT_HEADING, margin: 0 }}>{t.author}</p>
                    <p style={{ fontSize: 11.5, color: TEXT_MUTED, margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BAND */}
        <section className={styles.sectionPad} style={{ textAlign: "center", background: GRADIENT_HERO, position: "relative", overflow: "hidden" }}>
          <HeroChainMotif />
          <h2 className={styles.ctaHeading} style={{ ...display, fontWeight: 600, color: "white", margin: "0 0 24px", position: "relative", zIndex: 1 }}>Ready to compare?</h2>
          <Link
            href="/get-a-quote"
            style={{
              display: "inline-block",
              background: "white",
              color: "oklch(0.5 0.22 350)",
              fontWeight: 800,
              fontSize: 16,
              padding: "18px 40px",
              borderRadius: RADIUS.pill,
              boxShadow: SHADOW.lg,
              textDecoration: "none",
              position: "relative",
              zIndex: 1,
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

function StatChip({ icon: Icon, value, label }: { icon: typeof StarIcon; value: string; label: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 34, height: 34, borderRadius: "50%", background: "oklch(1 0 0 / 0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        <Icon size={16} color={GOLD} />
      </div>
      <div>
        <div style={{ ...display, fontSize: 16, fontWeight: 600, color: "white", lineHeight: 1.1 }}>{value}</div>
        <div style={{ fontSize: 10.5, color: "oklch(0.85 0.03 240)" }}>{label}</div>
      </div>
    </div>
  );
}
