"use client";

import type { CSSProperties } from "react";
import { useForm, ValidationError } from "@formspree/react";
import { NAVY, TEAL, TEXT_HEADING, TEXT_MUTED, BORDER, GRADIENT_CTA, RADIUS, SHADOW } from "@/lib/theme";
import { UserIcon, MailIcon, PhoneIcon } from "@/components/icons";
import styles from "./ContactForm.module.css";

const FORMSPREE_FORM_ID = "xjgnakev";

const cssVars = {
  "--contact-border": BORDER,
  "--contact-accent": TEAL,
  "--contact-text": TEXT_HEADING,
  "--contact-radius": `${RADIUS.sm}px`,
} as CSSProperties;

export function ContactForm() {
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID);

  if (state.succeeded) {
    return (
      <div style={{ padding: 8 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>Message sent</h2>
        <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, margin: 0 }}>
          Thanks — we&apos;ve received your message, including your contact details, and will get back to you as
          soon as we can.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ ...cssVars, display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Name
        <div className={styles.field} style={{ marginTop: 6 }}>
          <span className={styles.icon}>
            <UserIcon size={16} color={TEAL} />
          </span>
          <input type="text" name="name" required autoComplete="name" className={styles.input} />
        </div>
        <ValidationError prefix="Name" field="name" errors={state.errors} />
      </label>

      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Email
        <div className={styles.field} style={{ marginTop: 6 }}>
          <span className={styles.icon}>
            <MailIcon size={16} color={TEAL} />
          </span>
          <input type="email" name="email" required autoComplete="email" className={styles.input} />
        </div>
        <ValidationError prefix="Email" field="email" errors={state.errors} />
      </label>

      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Phone number
        <div className={styles.field} style={{ marginTop: 6 }}>
          <span className={styles.icon}>
            <PhoneIcon size={16} color={TEAL} />
          </span>
          <input type="tel" name="phone" required autoComplete="tel" className={styles.input} />
        </div>
        <ValidationError prefix="Phone" field="phone" errors={state.errors} />
      </label>

      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Message
        <div className={styles.field} style={{ marginTop: 6, alignItems: "flex-start" }}>
          <textarea name="message" required rows={5} className={styles.textarea} />
        </div>
        <ValidationError prefix="Message" field="message" errors={state.errors} />
      </label>

      <ValidationError errors={state.errors} />

      <button
        type="submit"
        disabled={state.submitting}
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
          opacity: state.submitting ? 0.7 : 1,
          cursor: state.submitting ? "default" : "pointer",
        }}
      >
        {state.submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
