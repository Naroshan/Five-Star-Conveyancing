import Link from "next/link";
import { Logo } from "./Logo";

export function SiteHeader() {
  return (
    <header
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "14px 24px",
        background: "var(--navy)",
        flexWrap: "wrap",
        gap: 10,
      }}
    >
      <Link href="/" style={{ textDecoration: "none", display: "flex" }}>
        <Logo variant="onDark" size={17} />
      </Link>
      <nav style={{ display: "flex", gap: 18, fontSize: 13, color: "var(--text-on-navy-body)" }}>
        <span>Compare</span>
        <span>Services</span>
        <span>Fees</span>
        <span>Knowledge hub</span>
      </nav>
      <Link
        href="/get-a-quote"
        style={{
          background: "var(--accent)",
          color: "#EAF3EE",
          fontSize: 13,
          padding: "9px 16px",
          borderRadius: 6,
          textDecoration: "none",
        }}
      >
        Get a quote
      </Link>
    </header>
  );
}
