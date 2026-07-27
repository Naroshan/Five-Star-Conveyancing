import type { Metadata } from "next";
import Link from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { NAVY, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, TEAL, RADIUS, SHADOW, display } from "@/lib/theme";
import { LOCATIONS } from "@/lib/locations";
import { HomeIcon } from "@/components/icons";
import contentStyles from "@/styles/contentPage.module.css";
import styles from "@/styles/tileGrid.module.css";

export const metadata: Metadata = {
  title: "Locations — Five Star Conveyancing",
  description: "Compare conveyancing quotes wherever you're buying or selling in England and Wales.",
};

export default function LocationsPage() {
  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 18 }}>
            Wherever you&apos;re moving
          </div>
          <h1 className={contentStyles.heroHeading} style={{ ...display, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: "0 0 16px", letterSpacing: "-0.02em" }}>
            Locations
          </h1>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: TEXT_BODY, maxWidth: 520, margin: 0 }}>
            Conveyancing works the same way everywhere in England and Wales — SRA-regulated firms, itemised quotes,
            no obligation. Here&apos;s what to know for a few specific places.
          </p>
        </section>

        <section className={styles.gridSection}>
          <div className={styles.grid} style={{ display: "grid" }}>
            {LOCATIONS.map((l) => (
              <Link
                key={l.slug}
                href={`/locations/${l.slug}`}
                className={styles.item}
                style={{ display: "block", background: "white", borderRadius: RADIUS.lg, boxShadow: SHADOW.md, textDecoration: "none" }}
              >
                <div
                  style={{
                    width: 52,
                    height: 52,
                    borderRadius: "50%",
                    background: "oklch(0.95 0.03 190)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  <HomeIcon size={24} color={TEAL} />
                </div>
                <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 8px" }}>{l.city}</h2>
                <p style={{ fontSize: 14, color: TEXT_MUTED, lineHeight: 1.6, margin: 0 }}>{l.jurisdiction} · {l.taxName}</p>
              </Link>
            ))}
          </div>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
