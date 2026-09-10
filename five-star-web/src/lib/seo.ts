import type { Metadata } from "next";

// Every indexable page should set a self-referencing canonical and its own
// OpenGraph title/description/url — without an explicit `openGraph` object,
// Next.js emits no og: tags at all beyond what the root layout sets
// (siteName/locale/type), which has no page-specific title or description.
// This one helper keeps that consistent across every static page instead of
// repeating the same three lines with room for a typo'd URL in each file.
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fivestarconveyancing.co.uk";

export function pageMetadata({
  path,
  title,
  description,
}: {
  path: string;
  title: string;
  description: string;
}): Metadata {
  const url = `${SITE_URL}${path}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}
