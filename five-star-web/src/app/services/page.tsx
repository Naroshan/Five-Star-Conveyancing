import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "Services — Five Star Conveyancing",
  description: "Conveyancing transaction types we compare quotes for: sale, purchase, remortgage, transfer of equity, and lease extension.",
};

const TRANSACTION_TYPES = [
  { title: "Purchase", body: "Buying a property, freehold or leasehold, with or without a mortgage." },
  { title: "Sale", body: "Selling a property you own." },
  { title: "Sale and purchase", body: "Selling your current property and buying your next one at the same time." },
  { title: "Remortgage", body: "Switching mortgage lender or deal on a property you already own." },
  { title: "Transfer of equity", body: "Adding or removing a name from the title of a property — for example after marriage, divorce, or a change in ownership share." },
  { title: "Lease extension", body: "Extending the remaining term of a leasehold property." },
];

export default function ServicesPage() {
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 22, fontWeight: 500, color: "var(--text-heading)", marginBottom: 8 }}>Services</h1>
        <p style={{ fontSize: 14, color: "var(--text-secondary)", marginBottom: 32 }}>
          We compare conveyancing quotes across these transaction types.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {TRANSACTION_TYPES.map((t) => (
            <div key={t.title} style={{ border: "0.5px solid var(--border)", borderRadius: 8, padding: 16 }}>
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
