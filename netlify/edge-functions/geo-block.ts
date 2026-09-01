// Five Star Conveyancing — geo-restrict the whole site to the United
// Kingdom, per explicit client instruction: the business only handles
// England & Wales conveyancing, so visitors from outside the UK are
// blocked entirely (Scotland/Northern Ireland are deliberately still
// allowed even though the service doesn't cover their conveyancing law —
// confirmed with the client).
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

export default async (request: Request, context: Context) => {
  const userAgent = request.headers.get("user-agent") ?? "";
  const countryCode = context.geo?.country?.code;

  // TEMPORARY diagnostic — visible in browser devtools (Network tab -> any
  // request -> Response Headers) — confirms what Netlify's edge is
  // actually detecting for a given request. Remove once confirmed working.
  const debugHeaders = { "x-debug-geo-country": countryCode ?? "undefined" };

  if (CRAWLER_USER_AGENT_PATTERN.test(userAgent)) {
    const response = await context.next();
    for (const [k, v] of Object.entries(debugHeaders)) response.headers.set(k, v);
    return response;
  }

  if (!countryCode || countryCode === "GB") {
    const response = await context.next();
    for (const [k, v] of Object.entries(debugHeaders)) response.headers.set(k, v);
    return response;
  }

  return new Response("This site is only available to visitors in the United Kingdom.", {
    status: 451,
    headers: { "content-type": "text/plain", ...debugHeaders },
  });
};
