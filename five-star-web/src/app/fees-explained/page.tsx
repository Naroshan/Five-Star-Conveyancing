import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Fees explained — Five Star Conveyancing",
  description: "What legal fees, VAT, and disbursements actually mean in a conveyancing quote, and why we show them separately.",
};

const TERMS = [
  {
    title: "Legal fee",
    body: "The solicitor's or conveyancer's own charge for their professional work on your transaction. This is what you're paying them for their time and expertise — separate from any third-party costs.",
  },
  {
    title: "VAT",
    body: "Value Added Tax, charged on top of most legal fees at the standard rate. Some disbursements attract VAT and some don't, depending on what they are — a genuine breakdown shows this per item rather than guessing.",
  },
  {
    title: "Disbursements",
    body: "Costs the firm pays to third parties on your behalf and passes on to you — for example search fees, Land Registry fees, or telegraphic transfer fees. These aren't the firm's own charge, so they're listed separately from the legal fee.",
  },
  {
    title: "Estimated vs guaranteed",
    body: "Some charges are fixed and guaranteed up front. Others are genuinely estimated — usually because the exact cost depends on something that isn't known until later in the transaction. A trustworthy comparison should tell you which is which, not present an estimate as if it were guaranteed.",
  },
];

export default function FeesExplainedPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-heading)", marginBottom: 8 }}>Fees explained</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32 }}>
          What the terms on your comparison actually mean, and why we show them separately rather than as one bundled number.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {TERMS.map((t) => (
            <div key={t.title}>
              <h2 style={{ fontSize: 15, fontWeight: 500, color: "var(--text-heading)", margin: "0 0 4px" }}>{t.title}</h2>
              <p style={{ fontSize: 14, color: "var(--text-body)", margin: 0 }}>{t.body}</p>
            </div>
          ))}
        </div>

        <div style={{ marginTop: 40, textAlign: "center" }}>
          <Link
            href="/get-a-quote"
            style={{
              display: "inline-block",
              background: "var(--accent)",
              color: "#EAF3EE",
              fontSize: 14,
              padding: "12px 24px",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Get my quote
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
