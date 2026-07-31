import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { GetAQuoteForm } from "@/components/GetAQuoteForm";
import { CREAM } from "@/lib/theme";
import type { TransactionType } from "five-star-conveyancing-quote-engine/types";

// Service pages link here with ?type=<slug> (slugs are hyphenated, e.g.
// "sale-and-purchase"; TransactionType values are snake_case) so visitors
// land on the form already set to the transaction they came from.
const VALID_TRANSACTION_TYPES: TransactionType[] = [
  "purchase",
  "sale",
  "sale_and_purchase",
  "remortgage",
  "transfer_of_equity",
  "lease_extension",
];

function parseTransactionType(type: string | undefined): TransactionType {
  const normalized = type?.replaceAll("-", "_");
  const match = VALID_TRANSACTION_TYPES.find((t) => t === normalized);
  return match ?? "purchase";
}

export default async function GetAQuotePage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  const initialTransactionType = parseTransactionType(type);

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 720, margin: "0 auto", padding: "28px 24px 40px", background: CREAM }}>
        <GetAQuoteForm initialTransactionType={initialTransactionType} />
      </main>
      <SiteFooter />
    </>
  );
}
