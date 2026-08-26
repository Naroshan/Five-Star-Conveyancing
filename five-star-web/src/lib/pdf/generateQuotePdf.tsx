// Five Star Conveyancing — renders a single firm's quote result to a PDF buffer
import { renderToBuffer } from "@react-pdf/renderer";
import type { PublicQuoteResult } from "five-star-conveyancing-quote-engine/api/publicResult";
import { QuotePdfDocument } from "./QuotePdfDocument";

export async function generateQuotePdf(quoteReference: string, result: PublicQuoteResult): Promise<Buffer> {
  return renderToBuffer(<QuotePdfDocument quoteReference={quoteReference} result={result} generatedAt={new Date()} />);
}
