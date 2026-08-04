import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Single family for the whole site, matching every page in the
// "Five Star - Home.dc.html" Claude Design handoff (Round 7).
const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-plusjakarta",
  display: "swap",
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
    <html lang="en" className={plusJakarta.variable}>
      <body>{children}</body>
    </html>
  );
}
