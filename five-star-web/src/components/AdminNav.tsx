import Link from "next/link";

export function AdminNav({ current }: { current: "fee-rules" | "fee-bands" | "disbursements" }) {
  const items = [
    { key: "fee-rules", label: "Fee rules", href: "/admin/fee-rules" },
    { key: "fee-bands", label: "Value bands", href: "/admin/fee-bands" },
    { key: "disbursements", label: "Disbursements", href: "/admin/disbursements" },
  ] as const;

  return (
    <nav style={{ display: "flex", gap: 14, fontSize: 13, marginBottom: 4 }}>
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          style={{
            color: item.key === current ? "var(--text-heading)" : "var(--text-secondary)",
            fontWeight: item.key === current ? 500 : 400,
            textDecoration: item.key === current ? "underline" : "none",
          }}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}
