// Five Star Conveyancing — server-side half of the England & Wales
// restriction. netlify/edge-functions/geo-block.ts sets this header on every
// request from a visitor outside England & Wales before forwarding it to
// the Next.js origin; API routes that accept an instruction, lead, or
// application must check it and refuse, rather than relying on the
// client-side CTA-hiding (see useRegionRestriction.ts) to have worked. A
// visitor who bypasses or disables JavaScript, or calls the API directly,
// must still be refused here — that's the actual business rule; the
// client-side hiding is a UX nicety on top of it, not the enforcement.
export const REGION_RESTRICTED_HEADER = "x-fsc-region-restricted";

export function isRegionRestricted(request: Request): boolean {
  return request.headers.get(REGION_RESTRICTED_HEADER) === "1";
}

export const REGION_RESTRICTED_MESSAGE =
  "Five Star Conveyancing is only able to accept instructions for properties in England and Wales.";
