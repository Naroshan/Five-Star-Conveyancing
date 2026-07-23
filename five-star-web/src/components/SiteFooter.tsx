import { Logo } from "./Logo";

export function SiteFooter() {
  return (
    <footer
      style={{
        background: "var(--navy-dark)",
        color: "var(--text-on-navy-body)",
        fontSize: 12,
        padding: "24px",
        marginTop: 40,
        textAlign: "center",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 10 }}>
        <Logo variant="onDark" size={15} />
      </div>
      <p style={{ margin: 0 }}>
        Comparison service. Regulatory disclosures, complaints procedure, and firm ownership information: pending
        final review before publication.
      </p>
    </footer>
  );
}
