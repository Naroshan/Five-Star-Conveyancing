import { notFound } from "next/navigation";
import { getQuoteHandler } from "five-star-conveyancing-quote-engine/api/getQuote";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ResultsInteractive } from "@/components/ResultsInteractive";
import { db } from "@/lib/db";
import { NAVY, CREAM, BORDER, TEXT_BODY, ERROR, RADIUS, display } from "@/lib/theme";

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
      <main style={{ maxWidth: 700, margin: "0 auto", padding: "26px 24px 36px", background: CREAM }}>
        <h1 style={{ ...display, fontSize: 21, fontWeight: 600, color: NAVY, marginBottom: 14, letterSpacing: "-0.01em" }}>Your comparison</h1>

        {data.status === "expired" && (
          <div style={{ background: CREAM, border: `1px solid ${BORDER}`, borderRadius: RADIUS.md, padding: 20, textAlign: "center" }}>
            <p style={{ fontSize: 14, color: TEXT_BODY }}>{data.message}</p>
          </div>
        )}

        {response.ok && data.status !== "expired" && <ResultsInteractive quoteReference={data.quoteReference} results={data.results} />}

        {!response.ok && (
          <p style={{ fontSize: 14, color: ERROR }}>{data.error?.message ?? "Something went wrong loading this quote."}</p>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
