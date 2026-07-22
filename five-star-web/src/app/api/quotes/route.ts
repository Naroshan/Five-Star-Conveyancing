import { createQuoteHandler } from "five-star-conveyancing-quote-engine/api/createQuote";
import { db } from "@/lib/db";
import { quoteRateLimiter } from "@/lib/rateLimiter";

export async function POST(request: Request): Promise<Response> {
  return createQuoteHandler(request, { db, rateLimiter: quoteRateLimiter });
}
