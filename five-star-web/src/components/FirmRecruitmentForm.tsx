"use client";

import { useState, type CSSProperties, type FormEvent } from "react";
import { NAVY, TEAL, TEXT_HEADING, TEXT_MUTED, BORDER, GRADIENT_CTA, RADIUS, SHADOW } from "@/lib/theme";
import { UserIcon, MailIcon, PhoneIcon, MapPinIcon } from "@/components/icons";
import styles from "./ContactForm.module.css";

const cssVars = {
  "--contact-border": BORDER,
  "--contact-accent": TEAL,
  "--contact-text": TEXT_HEADING,
  "--contact-radius": `${RADIUS.sm}px`,
} as CSSProperties;

type Status = "idle" | "submitting" | "succeeded" | "failed";

export function FirmRecruitmentForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorMessage(null);

    const form = new FormData(event.currentTarget);
    const body = {
      contactName: String(form.get("contactName") ?? ""),
      firmName: String(form.get("firmName") ?? ""),
      sraOrClcNumber: String(form.get("sraOrClcNumber") ?? "").trim() || undefined,
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      coverageArea: String(form.get("coverageArea") ?? ""),
      message: String(form.get("message") ?? "").trim() || undefined,
    };

    try {
      const res = await fetch("/api/firm-recruitment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("request failed");
      setStatus("succeeded");
    } catch {
      setStatus("failed");
      setErrorMessage("Something went wrong submitting your application. Please try again, or email us directly.");
    }
  }

  if (status === "succeeded") {
    return (
      <div style={{ padding: 8 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>Application received</h2>
        <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, margin: 0 }}>
          Thanks — we&apos;ve received your firm&apos;s details and will be in touch about next steps.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...cssVars, display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Your name
        <div className={styles.field} style={{ marginTop: 6 }}>
          <span className={styles.icon}>
            <UserIcon size={16} color={TEAL} />
          </span>
          <input type="text" name="contactName" required autoComplete="name" className={styles.input} />
        </div>
      </label>

      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Firm name
        <div className={styles.field} style={{ marginTop: 6 }}>
          <input type="text" name="firmName" required autoComplete="organization" className={styles.input} />
        </div>
      </label>

      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        SRA or CLC number <span style={{ fontWeight: 500, color: TEXT_MUTED }}>(optional)</span>
        <div className={styles.field} style={{ marginTop: 6 }}>
          <input type="text" name="sraOrClcNumber" className={styles.input} />
        </div>
      </label>

      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Email
        <div className={styles.field} style={{ marginTop: 6 }}>
          <span className={styles.icon}>
            <MailIcon size={16} color={TEAL} />
          </span>
          <input type="email" name="email" required autoComplete="email" className={styles.input} />
        </div>
      </label>

      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Phone number
        <div className={styles.field} style={{ marginTop: 6 }}>
          <span className={styles.icon}>
            <PhoneIcon size={16} color={TEAL} />
          </span>
          <input type="tel" name="phone" required autoComplete="tel" className={styles.input} />
        </div>
      </label>

      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Coverage area
        <div className={styles.field} style={{ marginTop: 6 }}>
          <span className={styles.icon}>
            <MapPinIcon size={16} color={TEAL} />
          </span>
          <input
            type="text"
            name="coverageArea"
            required
            placeholder="e.g. Greater Manchester, or England & Wales"
            className={styles.input}
          />
        </div>
      </label>

      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Anything else we should know? <span style={{ fontWeight: 500, color: TEXT_MUTED }}>(optional)</span>
        <div className={styles.field} style={{ marginTop: 6, alignItems: "flex-start" }}>
          <textarea name="message" rows={4} className={styles.textarea} />
        </div>
      </label>

      {status === "failed" && errorMessage && (
        <p style={{ fontSize: 13, color: "oklch(0.5 0.15 30)", margin: 0 }}>{errorMessage}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="cta-button"
        style={{
          alignSelf: "flex-start",
          background: GRADIENT_CTA,
          boxShadow: SHADOW.sm,
          color: NAVY,
          fontWeight: 800,
          border: "none",
          borderRadius: RADIUS.pill,
          padding: "13px 30px",
          fontSize: 14.5,
          opacity: status === "submitting" ? 0.7 : 1,
          cursor: status === "submitting" ? "default" : "pointer",
        }}
      >
        {status === "submitting" ? "Submitting…" : "Apply to join"}
      </button>
    </form>
  );
}
