// Illustrative wiring only — shows exactly how the tested handler in
// src/api/createQuote.ts drops into a Next.js App Router project. This file
// isn't compiled or run by this package's own test suite (Next.js isn't a
// dependency here); copy it into an actual Next.js app's app/api/quotes/
// directory once that project exists.
//
// import { createQuoteHandler } from 'five-star-conveyancing-quote-engine/api/createQuote';
// import { RateLimiter } from 'five-star-conveyancing-quote-engine/api/rateLimiter';
// import { db } from '@/lib/db'; // the app's shared Kysely instance from createDb()
//
// const rateLimiter = new RateLimiter({ maxRequests: 10, windowMs: 60_000 });
//
// export async function POST(request: Request) {
//   return createQuoteHandler(request, { db, rateLimiter });
// }
