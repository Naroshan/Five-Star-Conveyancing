import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SERVICE_TYPES, getServiceType } from "@/lib/serviceTypes";
import { CheckCircleIcon } from "@/components/icons";
import { NAVY, CREAM, TEXT_HEADING, TEXT_BODY, TEXT_MUTED, TEAL, GRADIENT_CTA, RADIUS, SHADOW, display } from "@/lib/theme";
import contentStyles from "@/styles/contentPage.module.css";

export function generateStaticParams() {
  return SERVICE_TYPES.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const service = getServiceType(slug);
  if (!service) return {};
  return {
    title: `${service.title} conveyancing quotes — Five Star Conveyancing`,
    description: `Compare itemised ${service.title.toLowerCase()} conveyancing quotes from SRA-regulated firms. ${service.short}`,
  };
}

export default async function ServiceTypePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const service = getServiceType(slug);
  if (!service) notFound();

  const others = SERVICE_TYPES.filter((s) => s.slug !== slug);

  return (
    <>
      <SiteHeader />
      <div style={{ background: CREAM }}>
        <section className={contentStyles.hero}>
          <div style={{ fontSize: 12.5, fontWeight: 800, letterSpacing: "0.12em", textTransform: "uppercase", color: TEAL, marginBottom: 18 }}>
            Services
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18, marginBottom: 16 }}>
            <div
              style={{
                width: 56,
                height: 56,
                borderRadius: "50%",
                background: service.iconBg,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <service.icon size={26} color={service.iconColor} />
            </div>
            <h1 className={contentStyles.heroHeading} style={{ ...display, fontWeight: 600, lineHeight: 1.1, color: NAVY, margin: 0, letterSpacing: "-0.02em" }}>
              {service.title} conveyancing
            </h1>
          </div>
          <p style={{ fontSize: 16, lineHeight: 1.6, color: TEXT_BODY, maxWidth: 560, margin: 0 }}>{service.intro}</p>
        </section>

        <div className={contentStyles.list}>
          <div className={contentStyles.itemPad} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 14px" }}>What&apos;s involved</h2>
            <ul style={{ display: "flex", flexDirection: "column", gap: 10, margin: 0, padding: 0, listStyle: "none" }}>
              {service.whatsInvolved.map((item) => (
                <li key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.6 }}>
                  <span style={{ flexShrink: 0, marginTop: 2, color: TEAL }}>
                    <CheckCircleIcon size={16} />
                  </span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className={contentStyles.itemPad} style={{ background: "white", borderRadius: RADIUS.md, boxShadow: SHADOW.sm }}>
            <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>Who it&apos;s for</h2>
            <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, margin: 0 }}>{service.whoItsFor}</p>
          </div>
        </div>

        <section className={contentStyles.ctaSection} style={{ textAlign: "center", paddingTop: 0 }}>
          <Link
            href="/get-a-quote"
            style={{ display: "inline-block", background: GRADIENT_CTA, boxShadow: SHADOW.md, color: "white", fontWeight: 800, fontSize: 15.5, padding: "17px 34px", borderRadius: RADIUS.pill, textDecoration: "none" }}
          >
            Get my quote →
          </Link>
        </section>

        <section className={contentStyles.ctaSection} style={{ paddingTop: 0 }}>
          <h2 style={{ fontSize: 15, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 14px" }}>Other transaction types</h2>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {others.map((s) => (
              <Link
                key={s.slug}
                href={`/services/${s.slug}`}
                style={{
                  fontSize: 13.5,
                  fontWeight: 700,
                  color: TEXT_HEADING,
                  background: "white",
                  borderRadius: RADIUS.pill,
                  boxShadow: SHADOW.sm,
                  padding: "10px 18px",
                  textDecoration: "none",
                }}
              >
                {s.title}
              </Link>
            ))}
          </div>
        </section>
      </div>
      <SiteFooter />
    </>
  );
}
