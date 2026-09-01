import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, TEAL, GOLD, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, GRADIENT_CTA, RADIUS, SHADOW, ICON_BADGE_BG, ICON_BADGE_BG_ACCENT, ICON_BADGE_BG_GOLD, display } from "@/lib/theme";
import { PoundCoinIcon, ReceiptIcon, ClockIcon, DocumentExtendIcon } from "@/components/icons";
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
    body: "The solicitor's or conveyancer's own charge for their professional work on your transaction — reviewing contracts, running searches, liaising with the other side, handling exchange and completion, and everything in between. This is what you're paying them for their time and expertise, separate from any third-party costs they arrange on your behalf. It's usually the single biggest line item, and it's also the one that varies most between firms, which is exactly why it's worth comparing rather than instructing the first firm you find.",
  },
  {
    icon: ReceiptIcon,
    bg: ICON_BADGE_BG_ACCENT,
    iconColor: TEAL,
    title: "VAT",
    body: "Value Added Tax, charged on top of most legal fees at the standard rate, since solicitors' professional services are standard-rated for VAT purposes. Disbursements are more mixed — a genuine third-party pass-through cost (like a Land Registry fee) often carries no VAT, while a service the firm itself provides (like an ID check) usually does. A trustworthy breakdown shows VAT treatment per item rather than applying a blanket assumption across everything.",
  },
  {
    icon: PoundCoinIcon,
    bg: ICON_BADGE_BG_GOLD,
    iconColor: GOLD,
    title: "Disbursements",
    body: "Costs the firm pays to third parties on your behalf and passes on to you at cost — for example local authority and environmental search fees, Land Registry registration and priority search fees, bankruptcy searches, or telegraphic transfer fees for moving money on completion day. These aren't the firm's own charge for their time, so they're listed separately from the legal fee rather than folded into it. The exact disbursements that apply depend on your specific transaction — a purchase and a remortgage, for instance, don't need the same searches.",
  },
  {
    icon: ClockIcon,
    bg: ICON_BADGE_BG,
    iconColor: TEAL,
    title: "Estimated vs guaranteed",
    body: "Some charges are fixed and guaranteed up front, because the firm can commit to them regardless of how your specific transaction unfolds. Others are genuinely estimated — usually because the exact cost depends on something that isn't known until later, like which local authority's search fee applies or exactly how a third-party provider prices a particular check. A trustworthy comparison labels each line clearly as one or the other, rather than presenting an estimate as if it were a guaranteed, locked-in figure.",
  },
  {
    icon: DocumentExtendIcon,
    bg: ICON_BADGE_BG_ACCENT,
    iconColor: TEAL,
    title: "Stamp Duty Land Tax / Land Transaction Tax",
    body: "A tax on property purchases — Stamp Duty Land Tax (SDLT) in England, Land Transaction Tax (LTT) in Wales — shown as an indicative estimate alongside the legal fee, VAT, and disbursements where it applies. It's genuinely a tax owed to HM Revenue & Customs or the Welsh Revenue Authority, not a fee charged by the firm or by us, and it isn't payable on every transaction type (a remortgage, for example, doesn't trigger it). Because the exact amount can depend on details a short form can't always capture fully — additional-property surcharges or available reliefs, for instance — your conveyancer will confirm the precise figure once they have the complete picture.",
  },
];

export default function FeesExplainedPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>
            No hidden totals
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...display, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Fees explained
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: TEXT_BODY, maxWidth: 520, margin: 0 }}>
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
                <h2 style={{ fontSize: 16, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{t.title}</h2>
                <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, maxWidth: 640, margin: 0 }}>{t.body}</p>
              </div>
            </div>
          ))}
        </div>

        <section className={contentStyles.ctaSection} style={{ textAlign: "center", paddingTop: 0 }}>
          <Link
            href="/get-a-quote"
            className="cta-button"
            style={{ display: "inline-block", background: GRADIENT_CTA, boxShadow: SHADOW.md, color: NAVY, fontWeight: 800, fontSize: 14, padding: "13px 28px", borderRadius: RADIUS.pill, textDecoration: "none" }}
          >
            Get my quote →
          </Link>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
