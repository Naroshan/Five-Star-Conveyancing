import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ALL_LOCATIONS, getLocation, getNearbyLocations } from "@/lib/locations";
import { TRANSACTION_MODIFIERS, getTransactionModifier } from "@/lib/transactionModifiers";
import { NAVY, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, TEAL, BORDER, GRADIENT_CTA, RADIUS, SHADOW, display } from "@/lib/theme";
import contentStyles from "@/styles/contentPage.module.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fivestarconveyancing.co.uk";

export function generateStaticParams() {
  return TRANSACTION_MODIFIERS.flatMap((m) => ALL_LOCATIONS.map((l) => ({ slug: m.slug, town: l.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; town: string }>;
}): Promise<Metadata> {
  const { slug: modifierSlug, town: townSlug } = await params;
  const modifier = getTransactionModifier(modifierSlug);
  const location = getLocation(townSlug);
  if (!modifier || !location) return {};
  const title = `${modifier.heading} in ${location.city} — Conveyancing Quotes | Five Star Conveyancing`;
  const description = `Compare itemised conveyancing quotes for ${modifier.activity} in ${location.city}${location.county ? `, ${location.county}` : ""} from SRA-regulated firms.`;
  const url = `${SITE_URL}/locations/${modifierSlug}/${townSlug}`;
  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: { title, description, url },
  };
}

export default async function LocationModifierPage({
  params,
}: {
  params: Promise<{ slug: string; town: string }>;
}) {
  const { slug: modifierSlug, town: townSlug } = await params;
  const modifier = getTransactionModifier(modifierSlug);
  const location = getLocation(townSlug);
  if (!modifier || !location) notFound();

  const nearby = getNearbyLocations(location);
  const pageUrl = `${SITE_URL}/locations/${modifierSlug}/${townSlug}`;

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Locations", item: `${SITE_URL}/locations` },
        { "@type": "ListItem", position: 2, name: location.city, item: `${SITE_URL}/locations/${townSlug}` },
        { "@type": "ListItem", position: 3, name: modifier.heading, item: pageUrl },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      name: `${modifier.heading} — ${location.city}`,
      serviceType: modifier.heading,
      areaServed: { "@type": "City", name: location.city },
      provider: { "@type": "Organization", name: "Five Star Conveyancing" },
      description: `Compare itemised conveyancing quotes for ${modifier.activity} in ${location.city} from SRA-regulated firms.`,
      url: pageUrl,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: modifier.faqs.map((f) => ({
        "@type": "Question",
        name: f.question,
        acceptedAnswer: { "@type": "Answer", text: f.answer },
      })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>
            {location.county ? `${location.county}, ${location.jurisdiction}` : location.jurisdiction}
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...display, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            {modifier.heading} in {location.city}
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: TEXT_BODY, maxWidth: 620, margin: "0 0 10px" }}>{location.intro}</p>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: TEXT_BODY, maxWidth: 620, margin: 0 }}>{modifier.intro}</p>
        </section>

        <section className={contentStyles.ctaSection} style={{ paddingTop: 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 12px" }}>
            What&apos;s involved
          </h2>
          <ul style={{ margin: 0, padding: "0 0 0 18px", maxWidth: 640 }}>
            {modifier.whatsInvolved.map((item) => (
              <li key={item} style={{ fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.65, marginBottom: 6 }}>
                {item}
              </li>
            ))}
          </ul>
        </section>

        <section className={contentStyles.ctaSection} style={{ textAlign: "center", paddingTop: 0 }}>
          <Link
            href="/get-a-quote"
            className="cta-button"
            style={{ display: "inline-block", background: GRADIENT_CTA, boxShadow: SHADOW.md, color: NAVY, fontWeight: 800, fontSize: 14, padding: "13px 28px", borderRadius: RADIUS.pill, textDecoration: "none" }}
          >
            Get my quote →
          </Link>
        </section>

        <section className={contentStyles.ctaSection} style={{ paddingTop: 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 14px" }}>
            Frequently asked questions
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 14, maxWidth: 680 }}>
            {modifier.faqs.map((faq) => (
              <div key={faq.question} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm, padding: "16px 18px" }}>
                <p style={{ fontSize: 14, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{faq.question}</p>
                <p style={{ fontSize: 13.5, color: TEXT_MUTED, lineHeight: 1.65, margin: 0 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={contentStyles.ctaSection} style={{ paddingTop: 0, maxWidth: 640, margin: "0 auto" }}>
          <p style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>
            Other services in {location.city}
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {TRANSACTION_MODIFIERS.filter((m) => m.slug !== modifier.slug).map((m) => (
              <Link
                key={m.slug}
                href={`/locations/${m.slug}/${townSlug}`}
                style={{ fontSize: 13, color: TEAL, textDecoration: "none", border: `1px solid ${BORDER}`, borderRadius: RADIUS.pill, padding: "6px 14px", background: "white" }}
              >
                {m.heading}
              </Link>
            ))}
          </div>
        </section>

        {nearby.length > 0 && (
          <section className={contentStyles.ctaSection} style={{ paddingTop: 0, maxWidth: 640, margin: "0 auto" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>
              {modifier.heading} in other parts of {location.county}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {nearby.map((n) => (
                <Link
                  key={n.slug}
                  href={`/locations/${modifierSlug}/${n.slug}`}
                  style={{ fontSize: 13, color: TEAL, textDecoration: "none", border: `1px solid ${BORDER}`, borderRadius: RADIUS.pill, padding: "6px 14px", background: "white" }}
                >
                  {n.city}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={contentStyles.ctaSection} style={{ paddingTop: 0 }}>
          <p style={{ fontSize: 13.5, color: TEXT_BODY, margin: 0 }}>
            Looking for something else?{" "}
            <Link href={`/locations/${townSlug}`} style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
              See all {location.city} conveyancing
            </Link>{" "}
            or{" "}
            <Link href="/locations" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
              browse all locations
            </Link>
            .
          </p>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
