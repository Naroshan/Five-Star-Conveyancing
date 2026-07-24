import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "FAQ — Five Star Conveyancing",
  description: "Common questions about comparing conveyancing quotes with Five Star Conveyancing.",
};

const FAQS = [
  {
    q: "Is the comparison free to use?",
    a: "Yes. There's no charge for getting or comparing quotes through the site.",
  },
  {
    q: "Are the firms regulated?",
    a: "Yes — we only compare quotes from SRA-regulated firms.",
  },
  {
    q: "How long does a quote stay valid?",
    a: "It varies by firm — each participating firm sets how long their quote holds, and the results page shows the expiry date for your specific quote.",
  },
  {
    q: "What happens after I select a firm?",
    a: "We pass your details to that firm so they can get in touch with you directly. Selecting a firm this way isn't a binding contract — you're free to instruct a different firm if you change your mind.",
  },
  {
    q: "Why are fees shown as legal fee, VAT, and disbursements separately, rather than one total?",
    a: "So you can see exactly what you're paying for and to whom, rather than a single bundled number that hides how it's made up. See our fees explained page for what each term means.",
  },
];

export default function FaqPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-heading)", marginBottom: 8 }}>Frequently asked questions</h1>

        <div style={{ display: "flex", flexDirection: "column", gap: 20, marginTop: 24 }}>
          {FAQS.map((item) => (
            <div key={item.q}>
              <h2 style={{ fontSize: 15, fontWeight: 500, color: "var(--text-heading)", margin: "0 0 4px" }}>{item.q}</h2>
              <p style={{ fontSize: 14, color: "var(--text-body)", margin: 0 }}>{item.a}</p>
            </div>
          ))}
        </div>

        <p style={{ fontSize: 13, color: "var(--text-secondary)", marginTop: 32 }}>
          See also: <Link href="/how-it-works" style={{ color: "var(--accent)" }}>how it works</Link> and{" "}
          <Link href="/fees-explained" style={{ color: "var(--accent)" }}>fees explained</Link>.
        </p>

        <div style={{ marginTop: 24, textAlign: "center" }}>
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
