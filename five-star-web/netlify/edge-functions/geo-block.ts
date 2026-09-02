// Five Star Conveyancing — geo-restrict the whole site to England & Wales
// only, per explicit client instruction: the business only handles
// England & Wales conveyancing, so visitors from anywhere else — including
// Scotland, Northern Ireland, and every country outside the UK — are
// blocked entirely.
//
// Country-level geolocation (context.geo.country.code) separates the UK
// from the rest of the world; a GB visitor is then further checked against
// context.geo.subdivision.code (ISO 3166-2: ENG/WLS/SCT/NIR) to distinguish
// England/Wales from Scotland/Northern Ireland. Subdivision data is
// coarser and less reliable than country-level data, so a GB visitor with
// no subdivision code at all is allowed through rather than blocked — the
// fail-open principle below still applies at that finer resolution: only
// an explicit SCT/NIR reading blocks a GB visitor.
//
// This is a native Netlify Edge Function, not Next.js middleware/proxy —
// deliberately, after a real non-UK visitor (Ghana) reached the site
// despite an earlier attempt built as Next.js middleware. That version
// depended on @netlify/plugin-nextjs correctly translating Netlify's Deno
// edge Context.geo into a NextRequest.geo property inside the Next.js
// runtime — a translation layer that could not be directly verified from
// this environment. A native edge function reads Netlify's own Context.geo
// directly, removing that layer of uncertainty entirely: this either runs
// on Netlify's edge with real geo data, or Netlify's own edge functions
// feature itself is broken — there's no intermediate translation left to
// silently misbehave.
//
// Search engine crawlers are exempted by user-agent so the site stays
// indexable — a blanket block would also stop Googlebot, which crawls from
// non-UK IPs, and would eventually remove the site from search results
// entirely (undoing the location-page/SEO work already done).
//
// Wired up in netlify.toml via [[edge_functions]] rather than this file's
// own `config.path` export, so the path pattern lives in one visible place
// alongside the rest of this project's Netlify configuration.

import type { Context } from "@netlify/edge-functions";

const CRAWLER_USER_AGENT_PATTERN =
  /googlebot|bingbot|duckduckbot|slurp|yandexbot|baiduspider|applebot|facebookexternalhit|twitterbot|linkedinbot/i;

const BLOCKED_GB_SUBDIVISIONS = new Set(["SCT", "NIR"]);

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

  if (!isOutsideGb && !isBlockedGbRegion) {
    return context.next();
  }

  return new Response("This site is only available to visitors in England and Wales.", {
    status: 451,
    headers: { "content-type": "text/plain" },
  });
}

export default geoBlock;
