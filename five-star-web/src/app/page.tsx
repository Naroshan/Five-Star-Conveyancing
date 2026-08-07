import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { HeroQuoteWidget } from "@/components/HeroQuoteWidget";
import { LOCATIONS } from "@/lib/locations";
import {
  NAVY,
  TEAL,
  GOLD,
  CREAM,
  CREAM_ALT,
  BORDER,
  TEXT_HEADING,
  TEXT_MUTED,
  GRADIENT_HERO,
  GRADIENT_TEAL,
  ACCENT_BOLD,
  RADIUS,
  ICON_BADGE_BG,
  ICON_BADGE_BG_GOLD,
  display,
} from "@/lib/theme";
import { ShieldCheckIcon, PoundCoinIcon, CheckCircleIcon, StarIcon, HomeIcon, SwapIcon, RefreshIcon } from "@/components/icons";
import styles from "./page.module.css";

const HERO_TILES = [
  { type: "purchase", label: "Buying", icon: HomeIcon },
  { type: "sale", label: "Selling", icon: SwapIcon },
  { type: "sale_and_purchase", label: "Selling and buying", icon: SwapIcon },
  { type: "remortgage", label: "Remortgaging", icon: RefreshIcon },
];

const HOW_IT_WORKS = [
  { n: "1", title: "Tell us about your move", body: "A few quick questions — price, postcode, and whether you're buying, selling or both." },
  { n: "2", title: "Get matched", body: "We match you to regulated firms suited to your move, not just the closest ones to you." },
  { n: "3", title: "Review your options", body: "Compare itemised quotes — fee, VAT and disbursements shown apart, never bundled." },
  { n: "4", title: "Choose with confidence", body: "Speak to them and instruct at your own pace. We never add a fee on top." },
];

const ABOUT_CARDS = [
  { icon: PoundCoinIcon, bg: ICON_BADGE_BG_GOLD, title: "See the full breakdown", body: "Legal fee, VAT and disbursements shown separately for every quote, not folded into one bundled number." },
  { icon: ShieldCheckIcon, bg: ICON_BADGE_BG, title: "Trusted & verified", body: "We check every firm's regulation and complaints history so you don't have to." },
  { icon: CheckCircleIcon, bg: ICON_BADGE_BG, title: "Right fit, first time", body: "Matched on your move, not just your postcode." },
];

const GUIDE_COLUMNS = [
  {
    heading: "Fees & costs",
    links: [
      { href: "/fees-explained", label: "How conveyancing fees work" },
      { href: "/fees-explained", label: "What are disbursements?" },
      { href: "/fees-explained", label: "VAT on legal fees" },
    ],
  },
  {
    heading: "Cost guides",
    links: [
      { href: "/guides", label: "Conveyancing fees & costs" },
      { href: "/guides", label: "Solicitor fees when buying" },
      { href: "/guides", label: "Solicitor fees when selling" },
    ],
  },
  {
    heading: "Other helpful guides",
    links: [
      { href: "/guides", label: "What is a conveyancing search?" },
      { href: "/guides", label: "Leasehold vs freehold" },
      { href: "/how-it-works", label: "How the comparison works" },
    ],
  },
];

const TESTIMONIALS = [
  { quote: "Finally a site that shows VAT and disbursements upfront. No surprises.", author: "Rachel H.", role: "First-time buyer" },
  { quote: "Three quotes in two minutes, picked the clearest one. Simple.", author: "David O.", role: "Home mover" },
  { quote: "No sales calls afterwards. Would use again for remortgaging.", author: "Priya K.", role: "Remortgaging" },
];

function initials(name: string) {
  return name.split(" ").map((part) => part[0]).join("").toUpperCase();
}

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM_ALT }}>
        {/* HERO */}
        <section className={styles.hero} style={{ background: GRADIENT_HERO, position: "relative", overflow: "hidden", textAlign: "center" }}>
          <div className={styles.heroInner} style={{ position: "relative", zIndex: 1, margin: "0 auto" }}>
            <h1
              className={styles.heroHeading}
              style={{ ...display, fontWeight: 800, lineHeight: 1.08, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em", textWrap: "balance" }}
            >
              Trusted Conveyancing Solicitors for the Move That Matters
            </h1>
            <p style={{ fontSize: 15, lineHeight: 1.6, color: TEXT_MUTED, maxWidth: 560, margin: "0 auto 30px" }}>
              Every firm is checked, reviewed and matched to your move. You get a short list of solicitors you can
              trust — with the legal fee, VAT and disbursements itemised, so you can choose with confidence.
            </p>

            <div className={styles.heroBarWrap}>
              <HeroQuoteWidget />
            </div>

            <div className={styles.tileRow} style={{ display: "grid", gap: 12, maxWidth: 640, margin: "28px auto 0" }}>
              {HERO_TILES.map((tile) => (
                <Link
                  key={tile.type}
                  href={`/get-a-quote?type=${tile.type}`}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: 10,
                    background: "white",
                    border: `1px solid ${BORDER}`,
                    borderRadius: RADIUS.lg,
                    padding: "18px 12px",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ width: 40, height: 40, borderRadius: 12, background: ICON_BADGE_BG, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <tile.icon size={18} color={TEAL} />
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 700, color: TEXT_HEADING }}>{tile.label}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* VERIFIED STRIP */}
        <section style={{ background: GRADIENT_TEAL, padding: "14px 24px", textAlign: "center" }}>
          <span style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase", color: "white" }}>
            Only SRA and CLC verified firms
          </span>
        </section>

        {/* HOW IT WORKS */}
        <section className={styles.sectionPad}>
          <h2 className={styles.sectionHeading} style={{ ...display, fontWeight: 700, color: NAVY, margin: "0 0 24px", textAlign: "center" }}>
            Find the Right Solicitor in Minutes
          </h2>
          <div className={styles.howGrid} style={{ display: "grid" }}>
            {HOW_IT_WORKS.map((s) => (
              <div key={s.n} style={{ background: CREAM, borderRadius: RADIUS.lg, padding: 24 }}>
                <span
                  style={{
                    display: "inline-flex",
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: ACCENT_BOLD,
                    color: NAVY,
                    fontWeight: 800,
                    fontSize: 14,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 14,
                  }}
                >
                  {s.n}
                </span>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontSize: 12.5, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ABOUT */}
        <section className={styles.sectionPad} style={{ background: CREAM }}>
          <div className={styles.aboutGrid} style={{ display: "grid", alignItems: "center" }}>
            <div>
              <h2 className={styles.sectionHeading} style={{ ...display, fontWeight: 700, color: NAVY, margin: "0 0 16px" }}>About Five Star</h2>
              <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.7, margin: "0 0 14px" }}>
                Five Star connects movers with conveyancing solicitors we&apos;ve checked ourselves. We started it
                after buying our own homes and being handed a single number with no explanation of what sat inside
                it.
              </p>
              <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.7, margin: 0 }}>
                Every firm must meet clear standards for regulation, insurance and complaints history before
                joining. You get a short, considered list — not an endless directory.
              </p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {ABOUT_CARDS.map((c) => (
                <div key={c.title} style={{ display: "flex", alignItems: "center", gap: 14, background: "white", border: `1px solid ${BORDER}`, borderRadius: RADIUS.lg, padding: "18px 20px" }}>
                  <span style={{ width: 42, height: 42, borderRadius: 12, background: c.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <c.icon size={19} color={TEAL} />
                  </span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 700, color: TEXT_HEADING }}>{c.title}</div>
                    <div style={{ fontSize: 12, color: TEXT_MUTED, marginTop: 2 }}>{c.body}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* GUIDES & TOOLS */}
        <section className={styles.sectionPad}>
          <h2 className={styles.sectionHeading} style={{ ...display, fontWeight: 700, color: NAVY, margin: "0 0 10px" }}>
            Guides &amp; Tools for the Decisions That Matter
          </h2>
          <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 600, margin: "0 0 26px" }}>
            Plain-English guides to help you understand what things cost and decide without guessing.
          </p>
          <div className={styles.guidesGrid} style={{ display: "grid" }}>
            {GUIDE_COLUMNS.map((col) => (
              <div key={col.heading} style={{ background: "white", border: `1px solid ${BORDER}`, borderRadius: RADIUS.lg, padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 800, color: TEXT_HEADING, margin: "0 0 14px" }}>{col.heading}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, fontSize: 13, fontWeight: 600 }}>
                  {col.links.map((l, i) => (
                    <Link key={i} href={l.href} style={{ color: TEAL, textDecoration: "none" }}>{l.label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className={styles.sectionPad} style={{ background: CREAM }}>
          <h2 className={styles.sectionHeading} style={{ ...display, fontWeight: 700, color: NAVY, margin: "0 0 22px" }}>What movers say</h2>
          <div className={styles.testimonialsGrid} style={{ display: "grid" }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.author} style={{ background: "white", border: `1px solid ${BORDER}`, borderRadius: RADIUS.lg, padding: 20 }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 10 }}>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <StarIcon key={i} size={12} color={GOLD} />
                  ))}
                </div>
                <p style={{ fontSize: 13, color: TEXT_MUTED, lineHeight: 1.55, margin: "0 0 14px" }}>&quot;{t.quote}&quot;</p>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 32, height: 32, borderRadius: "50%", background: ICON_BADGE_BG, color: TEAL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800 }}>
                    {initials(t.author)}
                  </div>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: TEXT_HEADING, margin: 0 }}>{t.author}</p>
                    <p style={{ fontSize: 11, color: TEXT_MUTED, margin: 0 }}>{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FIND NEAR YOU */}
        <section className={styles.sectionPad}>
          <h2 className={styles.sectionHeading} style={{ ...display, fontWeight: 700, color: NAVY, margin: "0 0 24px" }}>Find Conveyancers Near You</h2>
          <div className={styles.locationsGrid} style={{ display: "grid" }}>
            {LOCATIONS.map((loc) => (
              <div key={loc.slug}>
                <div style={{ fontSize: 14, fontWeight: 800, color: TEXT_HEADING, marginBottom: 8 }}>{loc.city}</div>
                <Link href={`/locations/${loc.slug}`} style={{ display: "block", fontSize: 12.5, color: TEXT_MUTED, textDecoration: "none" }}>
                  Conveyancing solicitors {loc.city}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* CTA BAND */}
        <section className={styles.sectionPad} style={{ textAlign: "center", background: GRADIENT_TEAL }}>
          <h2 className={styles.ctaHeading} style={{ ...display, fontWeight: 700, color: "white", margin: "0 0 14px" }}>See your quotes in about a minute</h2>
          <p style={{ fontSize: 14, color: "oklch(0.9 0.03 292)", margin: "0 0 26px" }}>Free to compare, no obligation, and no sales calls afterwards.</p>
          <Link
            href="/get-a-quote"
            style={{ display: "inline-block", background: ACCENT_BOLD, color: NAVY, fontWeight: 800, fontSize: 15, padding: "16px 36px", borderRadius: RADIUS.pill, textDecoration: "none" }}
          >
            Get my quotes →
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
