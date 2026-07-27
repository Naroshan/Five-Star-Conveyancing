import type { Metadata, Viewport } from "next";
import { Manrope, Baloo_2 } from "next/font/google";
import "./globals.css";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
});

// Bold, rounded, confident display type for headlines and the logo — the
// direct opposite of a thin editorial serif, chosen to match the bold
// geometric/rounded headline character of both Konnect You and
// MoneySuperMarket rather than reading as a generic template.
const display = Baloo_2({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Five Star Conveyancing",
  description: "Compare conveyancing solicitors, side by side.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${manrope.variable} ${display.variable}`}>
      <body>{children}</body>
    </html>
  );
}
