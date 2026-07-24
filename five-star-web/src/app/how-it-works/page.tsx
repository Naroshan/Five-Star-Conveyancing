import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "How it works — Five Star Conveyancing",
  description: "How our conveyancing comparison works: answer a few questions, see a real itemised comparison, choose a firm.",
};

const STEPS = [
  {
    title: "Answer a few questions",
    body: "Tell us about the property and the transaction — value, tenure, whether a mortgage is involved, and anything unusual about the situation.",
  },
  {
    title: "See a real comparison",
    body: "We show you an itemised breakdown for each participating firm — legal fee, VAT, and disbursements listed separately, never bundled into one number.",
  },
  {
    title: "Choose a firm",
    body: "Pick the firm that's right for you directly from the comparison. There's no obligation, and no fee to use the comparison itself.",
  },
];

export default function HowItWorksPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-heading)", marginBottom: 8 }}>How it works</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32 }}>
          Three steps between you and a genuine, itemised conveyancing comparison.
        </p>

        <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "flex", flexDirection: "column", gap: 24 }}>
          {STEPS.map((step, i) => (
            <li key={step.title} style={{ display: "flex", gap: 16 }}>
              <span
                style={{
                  flexShrink: 0,
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--navy)",
                  color: "var(--text-on-navy-heading)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                {i + 1}
              </span>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 500, color: "var(--text-heading)", margin: "0 0 4px" }}>{step.title}</h2>
                <p style={{ fontSize: 14, color: "var(--text-body)", margin: 0 }}>{step.body}</p>
              </div>
            </li>
          ))}
        </ol>

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
