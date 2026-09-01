// Five Star Conveyancing — geo-restrict the whole site to the United
// Kingdom, per explicit client instruction: the business only handles
// England & Wales conveyancing, so visitors from outside the UK are
// blocked entirely (Scotland/Northern Ireland are deliberately still
// allowed even though the service doesn't cover their conveyancing law —
// confirmed with the client).
//
// Search engine crawlers are exempted by user-agent so the site stays
// indexable — a blanket block would also stop Googlebot, which crawls
// from non-UK IPs, and would eventually remove the site from search
// results entirely (undoing the location-page/SEO work already done).
//
// Netlify injects geolocation onto the request when this middleware runs
// as a Netlify Edge Function (see the Next.js Middleware on Netlify docs)
// — NOT available in local `next dev`, and not present in the NextRequest
// type this Next.js version ships, hence the runtime shape-check below
// instead of a typed property access. If geo data is missing or malformed
// for any reason, this fails OPEN (allows the request) — a geolocation
// hiccup should never lock out every real visitor.

import { NextResponse, type NextRequest } from "next/server";

const CRAWLER_USER_AGENT_PATTERN =
  /googlebot|bingbot|duckduckbot|slurp|yandexbot|baiduspider|applebot|facebookexternalhit|twitterbot|linkedinbot/i;

function getCountryCode(request: NextRequest): string | undefined {
  const geo = (request as unknown as { geo?: { country?: { code?: string } | string } }).geo;
  if (!geo?.country) return undefined;
  return typeof geo.country === "string" ? geo.country : geo.country.code;
}

export function middleware(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const countryCode = getCountryCode(request);

  // TEMPORARY diagnostic — visible in browser devtools (Network tab -> any
  // request -> Response Headers). Lets us confirm what Netlify's edge is
  // actually detecting without needing server log access, after a report
  // that a non-UK visitor reached the site despite this middleware. Remove
  // once confirmed working.
  const debugHeaders = { "x-debug-geo-country": countryCode ?? "undefined" };

  if (CRAWLER_USER_AGENT_PATTERN.test(userAgent)) {
    const response = NextResponse.next();
    for (const [k, v] of Object.entries(debugHeaders)) response.headers.set(k, v);
    return response;
  }

  if (!countryCode || countryCode === "GB") {
    const response = NextResponse.next();
    for (const [k, v] of Object.entries(debugHeaders)) response.headers.set(k, v);
    return response;
  }

  return new NextResponse("This site is only available to visitors in the United Kingdom.", {
    status: 451,
    headers: { "content-type": "text/plain", ...debugHeaders },
  });
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
