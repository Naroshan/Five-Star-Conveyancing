import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ALL_LOCATIONS, LOCATION_ICONS, getLocation, getNearbyLocations } from "@/lib/locations";
import { buildExtendedContent } from "@/lib/locationExtendedContent";
import { NAVY, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, TEAL, BORDER, GRADIENT_CTA, RADIUS, SHADOW, display } from "@/lib/theme";
import contentStyles from "@/styles/contentPage.module.css";
import styles from "@/styles/tileGrid.module.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fivestarconveyancing.co.uk";

export function generateStaticParams() {
  return ALL_LOCATIONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) return {};
  const title = `Conveyancing quotes in ${location.city} — Five Star Conveyancing`;
  const description = `Compare itemised conveyancing quotes from SRA-regulated firms for a move in ${location.city}${location.county ? `, ${location.county}` : ""}.`;
  return {
    title,
    description,
    alternates: { canonical: `${SITE_URL}/locations/${slug}` },
    openGraph: { title, description, url: `${SITE_URL}/locations/${slug}` },
  };
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();

  const nearby = getNearbyLocations(location);
  const extendedContent = buildExtendedContent(location.city, location.jurisdiction);
  const calculatorLabel = location.jurisdiction === "Wales" ? "LTT calculator" : "SDLT calculator";
  const [beforeCalculatorLink, afterCalculatorLink] = extendedContent.split(calculatorLabel);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Locations", item: `${SITE_URL}/locations` },
      { "@type": "ListItem", position: 2, name: location.city, item: `${SITE_URL}/locations/${slug}` },
    ],
  };

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
            Conveyancing quotes in {location.city}
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: TEXT_BODY, maxWidth: 560, margin: 0 }}>{location.intro}</p>
        </section>

        <section className={contentStyles.ctaSection} style={{ paddingTop: 0 }}>
          <p style={{ fontSize: 13.5, lineHeight: 1.7, color: TEXT_BODY, maxWidth: 640, margin: 0 }}>
            {beforeCalculatorLink}
            <Link href="/sdlt-calculator" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
              {calculatorLabel}
            </Link>
            {afterCalculatorLink}
          </p>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.grid} style={{ display: "grid" }}>
            {LOCATION_ICONS.map((item) => (
              <div key={item.label} className={styles.item} style={{ background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.md }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: item.bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 10,
                  }}
                >
                  <item.icon size={18} color={item.color} />
                </div>
                <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{item.label}</h2>
                <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{item.body}</p>
              </div>
            ))}
          </div>
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

        {nearby.length > 0 && (
          <section className={contentStyles.ctaSection} style={{ paddingTop: 0, maxWidth: 640, margin: "0 auto" }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>
              Other areas in {location.county}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {nearby.map((n) => (
                <Link
                  key={n.slug}
                  href={`/locations/${n.slug}`}
                  style={{
                    fontSize: 13,
                    color: TEAL,
                    textDecoration: "none",
                    border: `1px solid ${BORDER}`,
                    borderRadius: RADIUS.pill,
                    padding: "6px 14px",
                    background: "white",
                  }}
                >
                  {n.city}
                </Link>
              ))}
            </div>
          </section>
        )}

        <section className={contentStyles.ctaSection} style={{ paddingTop: 0 }}>
          <p style={{ fontSize: 13.5, color: TEXT_BODY, margin: 0 }}>
            Moving elsewhere?{" "}
            <Link href="/locations" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
              See all locations
            </Link>
          </p>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
