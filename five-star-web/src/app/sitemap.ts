import type { MetadataRoute } from "next";
import { SERVICE_TYPES } from "@/lib/serviceTypes";
import { GUIDES } from "@/lib/guides";
import { ALL_LOCATIONS } from "@/lib/locations";

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
    {
      url: `${SITE_URL}/how-it-works`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/services`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...SERVICE_TYPES.map((s) => ({
      url: `${SITE_URL}/services/${s.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    {
      url: `${SITE_URL}/fees-explained`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/sdlt-calculator`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/guides`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...GUIDES.map((g) => ({
      url: `${SITE_URL}/guides/${g.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    {
      url: `${SITE_URL}/locations`,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    ...ALL_LOCATIONS.map((l) => ({
      url: `${SITE_URL}/locations/${l.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    {
      url: `${SITE_URL}/faq`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${SITE_URL}/about`,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/contact`,
      changeFrequency: "monthly",
      priority: 0.3,
    },
    {
      url: `${SITE_URL}/privacy-policy`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/complaints-procedure`,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
