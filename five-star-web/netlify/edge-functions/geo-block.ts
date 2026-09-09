// Five Star Conveyancing — restrict conversion to England & Wales visitors
// only, per explicit client instruction: the business only handles England &
// Wales conveyancing, so visitors from anywhere else — including Scotland,
// Northern Ireland, and every country outside the UK — must never be able to
// submit a quote, calculator lead, or panel application.
//
// This used to hard-block with an HTTP 451 response before the page ever
// rendered. That's been softened to a CTA-hiding approach instead, modeled
// on a comparable site (nationalscaffold.co.uk) that's proven this pattern
// works at scale: the page still renders fully (so it stays indexable and a
// wrongly-flagged real England/Wales visitor — geo-IP detection is never
// perfect — isn't shut out entirely), but every conversion surface (quote
// forms, phone/WhatsApp links, live chat) is replaced with an explanatory
// message instead of working. The actual business rule — never accept an
// instruction from outside England & Wales — is still enforced for real,
// server-side, on the API routes themselves (see src/lib/regionRestriction.ts
// and its use in /api/quotes, /api/quotes/[reference]/select,
// /api/sdlt-calculator/email, and /api/firm-recruitment); the client-side
// hiding here is a UX nicety on top of that, not the actual enforcement.
//
// Country-level geolocation (context.geo.country.code) separates the UK
// from the rest of the world; a GB visitor is then further checked against
// context.geo.subdivision.code (ISO 3166-2: ENG/WLS/SCT/NIR) to distinguish
// England/Wales from Scotland/Northern Ireland. Subdivision data is
// coarser and less reliable than country-level data, so a GB visitor with
// no subdivision code at all is allowed through rather than restricted — the
// fail-open principle below still applies at that finer resolution: only
// an explicit SCT/NIR reading restricts a GB visitor.
//
// This is a native Netlify Edge Function, not Next.js middleware/proxy —
// deliberately, after a real non-UK visitor (Ghana) reached the site
// despite an earlier attempt built as Next.js middleware. That version
// depended on @netlify/plugin-nextjs correctly translating Netlify's Deno
// edge Context.geo into a NextRequest.geo property inside the Next.js
// runtime — a translation layer that could not be directly verified from
// this environment. A native edge function reads Netlify's own Context.geo
// directly, removing that layer of uncertainty entirely.
//
// Search engine crawlers are exempted by user-agent — both from the
// restriction header (so the API layer never restricts a crawler that
// somehow POSTs) and from the HTML injection below, since hiding contact
// details from a crawler but not a human visitor is undetectable cloaking
// from Google's perspective and would break NAP consistency in search
// results, on top of eventually removing the site from search results
// entirely (undoing the location-page/SEO work already done).
//
// Wired up in netlify.toml via [[edge_functions]] rather than this file's
// own `config.path` export, so the path pattern lives in one visible place
// alongside the rest of this project's Netlify configuration.

import type { Context } from "@netlify/edge-functions";

const CRAWLER_USER_AGENT_PATTERN =
  /googlebot|bingbot|duckduckbot|slurp|yandexbot|baiduspider|applebot|facebookexternalhit|twitterbot|linkedinbot/i;

const BLOCKED_GB_SUBDIVISIONS = new Set(["SCT", "NIR"]);

// Must match REGION_RESTRICTED_HEADER in src/lib/regionRestriction.ts.
const REGION_RESTRICTED_HEADER = "x-fsc-region-restricted";

// Sets window.__FSC_REGION_RESTRICTED__ before anything else on the page
// runs — read client-side via src/lib/useRegionRestriction.ts's
// useSyncExternalStore hook to swap CTAs for an explanatory message. Placed
// as the very first thing after <head> so it executes before the page's own
// (deferred/module) scripts, including the React hydration bundle.
const REGION_RESTRICTED_FLAG_SCRIPT = "<script>window.__FSC_REGION_RESTRICTED__=true;</script>";

async function geoBlock(request: Request, context: Context) {
  const userAgent = request.headers.get("user-agent") ?? "";
  const countryCode = context.geo?.country?.code;
  const subdivisionCode = context.geo?.subdivision?.code;

  if (CRAWLER_USER_AGENT_PATTERN.test(userAgent)) {
    return context.next();
  }

  const isOutsideGb = countryCode !== undefined && countryCode !== "GB";
  const isBlockedGbRegion =
    countryCode === "GB" && subdivisionCode !== undefined && BLOCKED_GB_SUBDIVISIONS.has(subdivisionCode);
  const isRestricted = isOutsideGb || isBlockedGbRegion;

  if (!isRestricted) {
    return context.next();
  }

  // Forward the restriction to the origin (Next.js) so API routes can
  // reject a conversion attempt server-side, regardless of what the
  // client-side script above does or doesn't manage to hide.
  const forwardedHeaders = new Headers(request.headers);
  forwardedHeaders.set(REGION_RESTRICTED_HEADER, "1");
  const response = await context.next(new Request(request, { headers: forwardedHeaders }));

  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("text/html")) {
    // API responses, static assets, etc. — nothing to inject into a
    // non-HTML body, and the request header above already carries the
    // restriction through to the API handler.
    return response;
  }

  const html = await response.text();
  const modified = html.replace("<head>", `<head>${REGION_RESTRICTED_FLAG_SCRIPT}`);

  return new Response(modified, { status: response.status, headers: response.headers });
}

export default geoBlock;
