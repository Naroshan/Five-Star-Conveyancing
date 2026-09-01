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
// Named/located as proxy.ts, not middleware.ts — Next.js 16 deprecated and
// renamed the "middleware" file convention to "proxy" (same underlying
// mechanism, see next/dist/docs/01-app/getting-started/16-proxy.md, which
// this project's own AGENTS.md flags as required reading before writing
// code against this Next.js version). The original middleware.ts version
// of this file was silently ineffective — a real non-UK visitor reached the
// site — and this rename is one confirmed, concrete fix for that, alongside
// the temporary debug header below to verify the geo data itself.
//
// Netlify injects geolocation onto the request when this proxy runs as a
// Netlify Edge Function (see @netlify/plugin-nextjs's own
// edge-runtime/lib/next-request.ts, which builds request.geo.country as a
// plain string from its Deno Context.geo.country.code) — NOT available in
// local `next dev`, and not present in the NextRequest type this Next.js
// version ships, hence the runtime shape-check below instead of a typed
// property access. If geo data is missing or malformed for any reason,
// this fails OPEN (allows the request) — a geolocation hiccup should never
// lock out every real visitor.

import { NextResponse, type NextRequest } from "next/server";

const CRAWLER_USER_AGENT_PATTERN =
  /googlebot|bingbot|duckduckbot|slurp|yandexbot|baiduspider|applebot|facebookexternalhit|twitterbot|linkedinbot/i;

function getCountryCode(request: NextRequest): string | undefined {
  const geo = (request as unknown as { geo?: { country?: { code?: string } | string } }).geo;
  if (!geo?.country) return undefined;
  return typeof geo.country === "string" ? geo.country : geo.country.code;
}

export function proxy(request: NextRequest) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const countryCode = getCountryCode(request);

  // TEMPORARY diagnostic — visible in browser devtools (Network tab -> any
  // request -> Response Headers). Lets us confirm what Netlify's edge is
  // actually detecting without needing server log access, after a report
  // that a non-UK visitor reached the site despite this proxy. Remove once
  // confirmed working.
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
