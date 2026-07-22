"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function MfaSetupClient() {
  const router = useRouter();
  const [enrollment, setEnrollment] = useState<{ secret: string; otpauthUri: string } | null>(null);
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function begin() {
    setError(null);
    const response = await fetch("/api/admin/mfa/begin", { method: "POST" });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Something went wrong starting MFA setup.");
      return;
    }
    setEnrollment(data);
  }

  async function confirm() {
    setError(null);
    const response = await fetch("/api/admin/mfa/confirm", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ code }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error ?? "Something went wrong confirming the code.");
      return;
    }
    setDone(true);
    setTimeout(() => router.push("/admin/fee-rules"), 1500);
  }

  if (done) {
    return <p style={{ fontSize: 14, color: "var(--text-body)" }}>MFA is now enabled on your account. Redirecting…</p>;
  }

  if (!enrollment) {
    return (
      <button
        onClick={begin}
        style={{ background: "var(--accent)", color: "#EAF3EE", border: "none", borderRadius: 6, padding: "11px 18px", fontSize: 14 }}
      >
        Start MFA setup
      </button>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <p style={{ fontSize: 13, fontWeight: 500, marginBottom: 4 }}>1. Add this account to your authenticator app</p>
        <p style={{ fontSize: 12, color: "var(--text-secondary)", marginBottom: 8 }}>
          No QR scanner here — paste this secret into your app&apos;s &quot;enter a setup key manually&quot; option, or use the full URI:
        </p>
        <code style={{ display: "block", background: "var(--off-white)", border: "0.5px solid var(--border)", borderRadius: 6, padding: 10, fontSize: 12, wordBreak: "break-all" }}>
          {enrollment.secret}
        </code>
      </div>

      <label style={{ fontSize: 13, fontWeight: 500 }}>
        2. Enter the 6-digit code it shows
        <input
          type="text"
          inputMode="numeric"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          style={{ display: "block", width: "100%", marginTop: 4 }}
        />
      </label>

      {error && <p style={{ fontSize: 13, color: "var(--error)", background: "#FCEBEB", padding: "10px 12px", borderRadius: 6 }}>{error}</p>}

      <button
        onClick={confirm}
        style={{ background: "var(--accent)", color: "#EAF3EE", border: "none", borderRadius: 6, padding: "11px 18px", fontSize: 14 }}
      >
        Confirm and enable MFA
      </button>
    </div>
  );
}
