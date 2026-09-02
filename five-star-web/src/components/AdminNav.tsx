import Link from "next/link";
import { TEXT_HEADING, TEXT_MUTED } from "@/lib/theme";

export function AdminNav({ current }: { current: "fee-rules" | "fee-bands" | "disbursements" | "leads" }) {
  const items = [
    { key: "fee-rules", label: "Fee rules", href: "/admin/fee-rules" },
    { key: "fee-bands", label: "Value bands", href: "/admin/fee-bands" },
    { key: "disbursements", label: "Disbursements", href: "/admin/disbursements" },
    { key: "leads", label: "Leads", href: "/admin/leads" },
  ] as const;

  return (
    <nav style={{ display: "flex", gap: 14, fontSize: 13, marginBottom: 4 }}>
      {items.map((item) => (
        <Link
          key={item.key}
          href={item.href}
          style={{
            color: item.key === current ? TEXT_HEADING : TEXT_MUTED,
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
