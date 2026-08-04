import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { LOCATIONS, LOCATION_ICONS, getLocation } from "@/lib/locations";
import { NAVY, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, TEAL, GRADIENT_CTA, RADIUS, SHADOW, display } from "@/lib/theme";
import contentStyles from "@/styles/contentPage.module.css";
import styles from "@/styles/tileGrid.module.css";

export function generateStaticParams() {
  return LOCATIONS.map((l) => ({ slug: l.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) return {};
  return {
    title: `Conveyancing quotes in ${location.city} — Five Star Conveyancing`,
    description: `Compare itemised conveyancing quotes from SRA-regulated firms for a move in ${location.city}.`,
  };
}

export default async function LocationPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const location = getLocation(slug);
  if (!location) notFound();

  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 12 }}>
            {location.jurisdiction}
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...display, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Conveyancing quotes in {location.city}
          </h1>
          <p style={{ fontSize: 14, lineHeight: 1.55, color: TEXT_BODY, maxWidth: 560, margin: 0 }}>{location.intro}</p>
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
            style={{ display: "inline-block", background: GRADIENT_CTA, boxShadow: SHADOW.md, color: NAVY, fontWeight: 800, fontSize: 15.5, padding: "17px 34px", borderRadius: RADIUS.pill, textDecoration: "none" }}
          >
            Get my quote →
          </Link>
        </section>

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
