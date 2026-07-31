import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, TEAL, GRADIENT_CTA, GRADIENT_TEAL, ACCENT_BOLD, ICON_BADGE_BG_GOLD, RADIUS, SHADOW, display } from "@/lib/theme";
import { ShieldCheckIcon, PoundCoinIcon, CheckCircleIcon, StarIcon } from "@/components/icons";
import contentStyles from "@/styles/contentPage.module.css";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "About — Five Star Conveyancing",
  description: "Why Five Star Conveyancing shows itemised fees from SRA-regulated firms, rather than one bundled quote.",
};

const PRINCIPLES = [
  { icon: PoundCoinIcon, title: "Itemised, not bundled", body: "Legal fee, VAT and disbursements shown separately on every quote, so you can see exactly what you're paying for and to whom — not a single number that hides how it's actually made up, or that's cheaper on paper only because it excludes costs a competitor included." },
  { icon: ShieldCheckIcon, title: "SRA-regulated only", body: "Every firm compared is regulated by the Solicitors Regulation Authority, with their SRA number shown on the results page so you can check it independently. We don't list unregulated 'conveyancing providers' or claims-management-style middlemen alongside genuine solicitors." },
  { icon: CheckCircleIcon, title: "No obligation", body: "Comparing is free, however many quotes you look at, and choosing a firm through the comparison isn't a binding commitment — you're free to instruct someone else if you change your mind, right up until you've formally engaged a firm." },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>
            About us
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...display, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Conveyancing quotes you can actually compare
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: TEXT_BODY, maxWidth: 560, margin: 0 }}>
            Five Star Conveyancing exists to fix one specific problem: conveyancing quotes that bundle legal fee, VAT
            and disbursements into a single number, making it hard to tell what you&apos;re actually being charged for
            until you&apos;re already committed.
          </p>
        </section>

        <section className={styles.introSection}>
          <div className={styles.introCard} style={{ background: ICON_BADGE_BG_GOLD, borderRadius: RADIUS.lg }}>
            <div>
              <h2 style={{ ...display, fontSize: 26, fontWeight: 600, color: NAVY, margin: "0 0 18px" }}>
                About Five Star Conveyancing
              </h2>
              <p style={{ fontSize: 14.5, color: TEXT_BODY, lineHeight: 1.7, margin: "0 0 16px" }}>
                We show quotes from SRA-regulated conveyancing firms side by side, with legal fee, VAT and
                disbursements itemised for each one — rather than a single bundled total that hides how it&apos;s
                made up. You compare, choose the firm that&apos;s right for you, and we pass your details on so
                they can get in touch directly.
              </p>
              <p style={{ fontSize: 14.5, color: TEXT_BODY, lineHeight: 1.7, margin: 0 }}>
                We don&apos;t act as your conveyancer ourselves, take a cut hidden inside the quote you see, or
                charge you anything to compare or to select a firm. The firm you choose handles your actual
                transaction.
              </p>
            </div>

            <div className={styles.introPanel}>
              <div
                style={{
                  background: GRADIENT_TEAL,
                  borderRadius: RADIUS.lg,
                  aspectRatio: "1 / 1",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: SHADOW.md,
                }}
              >
                <ShieldCheckIcon size={72} color="white" />
              </div>

              <div
                className={styles.introBadgeAccent}
                style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.md, padding: "14px 18px", maxWidth: 220 }}
              >
                <p style={{ fontSize: 13.5, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 2px" }}>SRA-regulated only</p>
                <p style={{ fontSize: 12, color: TEXT_MUTED, margin: 0 }}>100% of firms compared are regulated</p>
              </div>

              <div
                className={styles.introBadgeCircle}
                style={{
                  background: ACCENT_BOLD,
                  color: "white",
                  borderRadius: "50%",
                  width: 92,
                  height: 92,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: SHADOW.md,
                  textAlign: "center",
                }}
              >
                <StarIcon size={16} color="white" />
                <span style={{ fontSize: 14, fontWeight: 800, marginTop: 2 }}>4.8/5</span>
                <span style={{ fontSize: 9, fontWeight: 700 }}>Trustpilot</span>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className={styles.sectionLabel}>
            <h2 style={{ fontSize: 20, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 20px" }}>What we stand for</h2>
          </div>
          <div className={styles.principlesGrid} style={{ display: "grid", gap: 20, padding: "0 48px 56px" }}>
            {PRINCIPLES.map((p) => (
              <div key={p.title} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm, padding: 24 }}>
                <div style={{ marginBottom: 14, color: TEAL }}>
                  <p.icon size={22} />
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{p.title}</h3>
                <p style={{ fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{p.body}</p>
              </div>
            ))}
          </div>
        </section>

        <div className={contentStyles.list}>
          <div className={contentStyles.itemPad} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>Regulatory information</h2>
            <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 680, margin: 0 }}>
              Full regulatory disclosures, our complaints procedure, and company ownership information are pending
              final review before publication. In the meantime, every firm shown in a comparison is independently
              regulated by the Solicitors Regulation Authority.
            </p>
          </div>
        </div>

        <section className={contentStyles.ctaSection} style={{ textAlign: "center", paddingTop: 0 }}>
          <Link
            href="/get-a-quote"
            style={{ display: "inline-block", background: GRADIENT_CTA, boxShadow: SHADOW.md, color: "white", fontWeight: 800, fontSize: 15.5, padding: "17px 34px", borderRadius: RADIUS.pill, textDecoration: "none" }}
          >
            Compare quotes →
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
