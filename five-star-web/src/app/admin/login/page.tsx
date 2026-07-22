"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { SiteHeader } from "@/components/SiteHeader";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [mfaRequired, setMfaRequired] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email, password, totpCode: totpCode || undefined }),
      });
      const data = await response.json();

      if (data.status === "mfa_required") {
        setMfaRequired(true);
        setSubmitting(false);
        return;
      }
      if (!response.ok) {
        setError(data.error ?? "Something went wrong signing in.");
        setSubmitting(false);
        return;
      }
      router.push("/admin/fee-rules");
      router.refresh();
    } catch {
      setError("Something went wrong reaching the sign-in service.");
      setSubmitting(false);
    }
  }

  return (
    <>
      <SiteHeader />
      <main style={{ maxWidth: 400, margin: "0 auto", padding: "48px 24px" }}>
        <h1 style={{ fontSize: 20, fontWeight: 500, color: "var(--text-heading)", marginBottom: 20 }}>Admin sign in</h1>

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <label style={{ fontSize: 13, fontWeight: 500 }}>
            Email
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 4 }}
              disabled={mfaRequired}
            />
          </label>

          <label style={{ fontSize: 13, fontWeight: 500 }}>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ display: "block", width: "100%", marginTop: 4 }}
              disabled={mfaRequired}
            />
          </label>

          {mfaRequired && (
            <label style={{ fontSize: 13, fontWeight: 500 }}>
              Authenticator app code
              <input
                type="text"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                autoFocus
                required
                value={totpCode}
                onChange={(e) => setTotpCode(e.target.value)}
                style={{ display: "block", width: "100%", marginTop: 4 }}
              />
            </label>
          )}

          {error && (
            <p style={{ fontSize: 13, color: "var(--error)", background: "#FCEBEB", padding: "10px 12px", borderRadius: 6 }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{ background: "var(--accent)", color: "#EAF3EE", border: "none", borderRadius: 6, padding: "11px 18px", fontSize: 14, opacity: submitting ? 0.7 : 1 }}
          >
            {submitting ? "Signing in…" : mfaRequired ? "Verify and sign in" : "Sign in"}
          </button>
        </form>
      </main>
    </>
  );
}
