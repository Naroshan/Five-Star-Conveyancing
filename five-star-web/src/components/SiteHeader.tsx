"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { CREAM, TEXT_HEADING, GRADIENT_CTA, RADIUS, SHADOW } from "@/lib/theme";
import { interceptQuoteLinkClick } from "@/lib/quoteExitGuard";
import styles from "./SiteHeader.module.css";

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

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <header
      className={styles.header}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "22px 44px",
        background: CREAM,
        boxShadow: SHADOW.sm,
        position: "relative",
        zIndex: 10,
        gap: 16,
      }}
    >
      <Link href="/" style={{ textDecoration: "none", display: "flex" }} onClick={() => setOpen(false)}>
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
        <Link
          href="/get-a-quote"
          style={{
            fontWeight: 800,
            color: "white",
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
  );
}
