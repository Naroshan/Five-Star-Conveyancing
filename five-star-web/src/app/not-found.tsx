import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { TEXT_HEADING, TEXT_MUTED, GRADIENT_CTA, SHADOW, RADIUS, NAVY } from "@/lib/theme";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 480, margin: "0 auto", padding: "48px 24px", textAlign: "center" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: TEXT_HEADING, marginBottom: 8 }}>
          We couldn&apos;t find that page
        </h1>
        <p style={{ fontSize: 14, color: TEXT_MUTED, marginBottom: 24 }}>
          The page or quote reference you&apos;re looking for doesn&apos;t exist, or the link may have expired.
        </p>
        <Link
          href="/get-a-quote"
          className="cta-button"
          style={{ display: "inline-block", background: GRADIENT_CTA, boxShadow: SHADOW.sm, color: NAVY, fontWeight: 700, fontSize: 14, padding: "12px 24px", borderRadius: RADIUS.pill, textDecoration: "none" }}
        >
          Start a new quote
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
