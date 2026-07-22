"use client";

import { useRouter } from "next/navigation";

export function AdminUserBar({ name, role }: { name: string; role: string }) {
  const router = useRouter();

  async function signOut() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 20 }}>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
        Signed in as {name} ({role})
      </p>
      <button
        onClick={signOut}
        style={{ background: "transparent", border: "none", color: "var(--accent)", fontSize: 12, padding: 0, textDecoration: "underline" }}
      >
        Sign out
      </button>
    </div>
  );
}
