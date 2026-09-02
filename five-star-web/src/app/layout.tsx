import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import { WhatsAppFloatButton } from "@/components/WhatsAppFloatButton";
import { CookieConsent } from "@/components/CookieConsent";
import "./globals.css";

// Single family for the whole site, matching every page in the
// "Five Star - Home.dc.html" Claude Design handoff (Round 7).
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plusjakarta",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://fivestarconveyancing.co.uk";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Five Star Conveyancing",
    template: "%s",
  },
  description: "Compare conveyancing solicitors, side by side.",
  openGraph: {
    siteName: "Five Star Conveyancing",
    locale: "en_GB",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

// Organization structured data — only facts already published elsewhere on
// the site (trading name from SiteFooter.tsx, phone number from
// SiteHeader.tsx). No address/ICO registration/company number: those are
// explicitly not yet published anywhere on the site (see About/Contact
// pages' "pending final review" notices), so they're deliberately left out
// here rather than invented.
const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Five Star Conveyancing",
  alternateName: "The Lead Gen Co LTD",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  telephone: "+442077902000",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={plusJakarta.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_JSON_LD) }} />
        {children}
        <WhatsAppFloatButton />
        {/* Google tag + LiveChat only load once the visitor accepts cookies — see CookieConsent.tsx */}
        <CookieConsent />
      </body>
    </html>
  );
}
