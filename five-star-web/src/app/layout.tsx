import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Five Star Conveyancing",
  description: "Compare conveyancing solicitors, side by side.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
