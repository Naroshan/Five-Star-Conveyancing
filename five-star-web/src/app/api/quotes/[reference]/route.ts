import { getQuoteHandler } from "five-star-conveyancing-quote-engine/api/getQuote";
import { db } from "@/lib/db";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> }
): Promise<Response> {
  const { reference } = await params;
  return getQuoteHandler(reference, db);
}
