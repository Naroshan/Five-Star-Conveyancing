import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <section style={{ background: "var(--navy)", padding: "56px 24px", textAlign: "center" }}>
          <h1 style={{ color: "var(--text-on-navy-heading)", fontSize: 26, fontWeight: 500, margin: "0 0 10px" }}>
            Compare conveyancing solicitors, side by side
          </h1>
          <p style={{ color: "var(--text-on-navy-body)", fontSize: 15, margin: "0 0 24px" }}>
            See the full cost — legal fees, VAT and disbursements — before you choose.
          </p>
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
        </section>

        <section
          style={{
            display: "flex",
            justifyContent: "center",
            gap: 28,
            padding: "16px 24px",
            background: "var(--navy-dark)",
            flexWrap: "wrap",
          }}
        >
          <span style={{ color: "var(--text-on-navy-body)", fontSize: 12 }}>SRA-regulated firms only</span>
          <span style={{ color: "var(--text-on-navy-body)", fontSize: 12 }}>No hidden fees</span>
          <span style={{ color: "var(--text-on-navy-body)", fontSize: 12 }}>Full breakdown before you choose</span>
        </section>

        <section style={{ maxWidth: 680, margin: "40px auto", padding: "0 24px" }}>
          <h2 style={{ fontSize: 18, fontWeight: 500, color: "var(--text-heading)" }}>How it works</h2>
          <p style={{ fontSize: 14, color: "var(--text-body)" }}>
            Answer a few questions about your purchase, and we&apos;ll show you a real, itemised comparison from our
            participating firms — legal fee, VAT, and disbursements broken out separately, never bundled into one
            number.
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
