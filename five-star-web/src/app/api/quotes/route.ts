import { createQuoteHandler } from "five-star-conveyancing-quote-engine/api/createQuote";
import { db } from "@/lib/db";
import { quoteRateLimiter } from "@/lib/rateLimiter";
import { isRegionRestricted, REGION_RESTRICTED_MESSAGE } from "@/lib/regionRestriction";

export async function POST(request: Request): Promise<Response> {
  if (isRegionRestricted(request)) {
    return Response.json({ error: { message: REGION_RESTRICTED_MESSAGE } }, { status: 403 });
  }
  return createQuoteHandler(request, { db, rateLimiter: quoteRateLimiter });
}
