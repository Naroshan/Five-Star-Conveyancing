"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "./Logo";
import { NAVY, TEAL, TEXT_HEADING, GRADIENT_CTA, GRADIENT_TEAL, RADIUS, SHADOW, BORDER } from "@/lib/theme";
import { interceptQuoteLinkClick, confirmQuoteExit } from "@/lib/quoteExitGuard";
import { PhoneIcon } from "./icons";
import styles from "./SiteHeader.module.css";

// Set to true once PHONE_NUMBER_DISPLAY/PHONE_NUMBER_TEL below are the real
// business number — keeps the button out of production until then, rather
// than shipping a fake number visitors could actually dial.
const PHONE_NUMBER_READY = true;
const PHONE_NUMBER_DISPLAY = "0800 000 0000";
const PHONE_NUMBER_TEL = "+448000000000";

const NAV_LINKS = [
  { href: "/how-it-works", label: "How it works" },
  { href: "/services", label: "Services" },
  { href: "/fees-explained", label: "Fees" },
  { href: "/guides", label: "Guides" },
  { href: "/locations", label: "Locations" },
  { href: "/faq", label: "FAQ" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <div
        style={{
          background: GRADIENT_TEAL,
          color: "white",
          textAlign: "center",
          padding: "10px 16px",
          fontSize: 13,
          fontWeight: 600,
        }}
      >
        Buying, selling, remortgaging or extending a lease — every firm on our panel is SRA or CLC checked before it lists.{" "}
        <Link href="/faq" style={{ color: "white", fontWeight: 800, textDecoration: "underline" }}>
          See how we verify
        </Link>
      </div>
      <header
        className={styles.header}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "18px 44px",
          background: "oklch(1 0 0 / 0.94)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid oklch(0.91 0.015 292)",
          position: "sticky",
          top: 0,
          zIndex: 10,
          gap: 16,
        }}
      >
      <Link
        href="/"
        style={{ textDecoration: "none", display: "flex" }}
        onClick={(e) => {
          if (!confirmQuoteExit("You're partway through getting a quote. Are you sure you want to go to the home page?")) {
            e.preventDefault();
            return;
          }
          setOpen(false);
          // Already home — a same-URL Link click is a no-op navigation, so
          // scroll to the top ourselves rather than doing nothing.
          if (pathname === "/") {
            e.preventDefault();
            window.scrollTo({ top: 0, behavior: "smooth" });
          }
        }}
      >
        <Logo variant="onLight" size={20} />
      </Link>

      <button
        type="button"
        className={styles.hamburger}
        aria-expanded={open}
        aria-controls="mobile-nav"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        style={{
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          gap: 5,
          width: 40,
          height: 40,
          background: "none",
          border: "none",
          padding: 0,
        }}
      >
        <span style={{ width: 22, height: 2, background: TEXT_HEADING, display: "block" }} />
        <span style={{ width: 22, height: 2, background: TEXT_HEADING, display: "block" }} />
        <span style={{ width: 22, height: 2, background: TEXT_HEADING, display: "block" }} />
      </button>

      <nav id="mobile-nav" className={styles.nav} data-open={open} style={{ fontSize: 14 }}>
        {NAV_LINKS.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            style={{ fontWeight: 700, color: TEXT_HEADING, textDecoration: "none" }}
            onClick={() => setOpen(false)}
          >
            {link.label}
          </Link>
        ))}
        {PHONE_NUMBER_READY && (
          <a
            href={`tel:${PHONE_NUMBER_TEL}`}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 7,
              fontWeight: 800,
              color: TEAL,
              border: `1.5px solid ${BORDER}`,
              padding: "10px 18px",
              borderRadius: RADIUS.pill,
              whiteSpace: "nowrap",
              textDecoration: "none",
            }}
          >
            <PhoneIcon size={15} color={TEAL} />
            {PHONE_NUMBER_DISPLAY}
          </a>
        )}
        <Link
          href="/get-a-quote"
          className="cta-button"
          style={{
            fontWeight: 800,
            color: NAVY,
            background: GRADIENT_CTA,
            boxShadow: SHADOW.sm,
            padding: "12px 26px",
            borderRadius: RADIUS.pill,
            whiteSpace: "nowrap",
            textDecoration: "none",
          }}
          onClick={(e) => {
            if (!interceptQuoteLinkClick()) e.preventDefault();
            setOpen(false);
          }}
        >
          Get a quote
        </Link>
      </nav>
      </header>
    </>
  );
}
