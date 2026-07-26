import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, TEAL, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, GRADIENT_CTA, RADIUS, SHADOW, ICON_BADGE_BG, ICON_BADGE_BG_ACCENT, ICON_BADGE_BG_GOLD, fraunces } from "@/lib/theme";
import { PoundCoinIcon, ReceiptIcon, ClockIcon } from "@/components/icons";
import contentStyles from "@/styles/contentPage.module.css";

export const metadata: Metadata = {
  title: "Fees explained — Five Star Conveyancing",
  description: "What legal fees, VAT, and disbursements actually mean in a conveyancing quote, and why we show them separately.",
};

const TERMS = [
  {
    icon: PoundCoinIcon,
    bg: ICON_BADGE_BG,
    iconColor: TEAL,
    title: "Legal fee",
    body: "The solicitor's or conveyancer's own charge for their professional work on your transaction. This is what you're paying them for their time and expertise — separate from any third-party costs.",
  },
  {
    icon: ReceiptIcon,
    bg: ICON_BADGE_BG_ACCENT,
    iconColor: "oklch(0.5 0.22 350)",
    title: "VAT",
    body: "Value Added Tax, charged on top of most legal fees at the standard rate. Some disbursements attract VAT and some don't, depending on what they are — a genuine breakdown shows this per item rather than guessing.",
  },
  {
    icon: PoundCoinIcon,
    bg: ICON_BADGE_BG_GOLD,
    iconColor: "oklch(0.6 0.14 80)",
    title: "Disbursements",
    body: "Costs the firm pays to third parties on your behalf and passes on to you — for example search fees, Land Registry fees, or telegraphic transfer fees. These aren't the firm's own charge, so they're listed separately from the legal fee.",
  },
  {
    icon: ClockIcon,
    bg: ICON_BADGE_BG,
    iconColor: TEAL,
    title: "Estimated vs guaranteed",
    body: "Some charges are fixed and guaranteed up front. Others are genuinely estimated — usually because the exact cost depends on something that isn't known until later in the transaction. A trustworthy comparison should tell you which is which, not present an estimate as if it were guaranteed.",
  },
];

export default function FeesExplainedPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
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

        <div className={contentStyles.list}>
          {TERMS.map((t) => (
            <div
              key={t.title}
              className={contentStyles.itemPad}
              style={{ display: "flex", gap: 18, alignItems: "flex-start", background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: "50%",
                  background: t.bg,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <t.icon size={20} color={t.iconColor} />
              </div>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>{t.title}</h2>
                <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 640, margin: 0 }}>{t.body}</p>
              </div>
            </div>
          ))}
        </div>

        <section className={contentStyles.ctaSection} style={{ textAlign: "center", paddingTop: 0 }}>
          <Link
            href="/get-a-quote"
            style={{ display: "inline-block", background: GRADIENT_CTA, boxShadow: SHADOW.md, color: "white", fontWeight: 800, fontSize: 15.5, padding: "17px 34px", borderRadius: RADIUS.pill, textDecoration: "none" }}
          >
            Get my quote →
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
