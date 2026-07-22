import { notFound } from "next/navigation";
import { getQuoteHandler } from "five-star-conveyancing-quote-engine/api/getQuote";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ResultsInteractive } from "@/components/ResultsInteractive";
import { db } from "@/lib/db";

// This page reads a quote by reference from the database on every request, so
// it must never be statically prerendered at build time (when no database
// connection is available). Force dynamic rendering to keep DB access at
// request time.
export const dynamic = "force-dynamic";

// Server Component: calls the same tested handler used by GET /api/quotes/:reference
// directly (a function call, not a self-fetch over HTTP — this app already runs
// server-side, so there's no reason to round-trip through its own API route).
// This means firm names and prices are present in the initial HTML, not only
// after client-side JS runs.
export default async function QuoteResultsPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const response = await getQuoteHandler(reference, db);

  // notFound() actually sets the HTTP status to 404 and renders the
  // not-found boundary — returning JSX with a status check in it does not;
  // Server Component pages return 200 by default regardless of what's
  // rendered inside them. Caught by testing the 404 case directly, not
  // assumed from the conditional compiling cleanly.
  if (response.status === 404) {
    notFound();
  }

  const data = await response.json();

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 680, margin: "0 auto", padding: "32px 24px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: "var(--text-heading)", marginBottom: 16 }}>Your comparison</h1>

        {data.status === "expired" && (
          <div style={{ background: "var(--off-white)", border: "0.5px solid var(--border)", borderRadius: 12, padding: 20, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: "var(--text-body)" }}>{data.message}</p>
          </div>
        )}

        {response.ok && data.status !== "expired" && <ResultsInteractive results={data.results} />}

        {!response.ok && (
          <p style={{ fontSize: 14, color: "var(--error)" }}>{data.error?.message ?? "Something went wrong loading this quote."}</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
