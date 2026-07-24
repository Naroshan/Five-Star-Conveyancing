import type { MetadataRoute } from "next";

// Only genuinely public, indexable, canonical pages belong here. Admin
// pages are excluded (see robots.ts) and per-quote results pages are
// excluded because they're single-user, expiring, non-canonical content —
// not something a search engine should index.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fivestarconveyancing.co.uk";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: SITE_URL,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${SITE_URL}/get-a-quote`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
