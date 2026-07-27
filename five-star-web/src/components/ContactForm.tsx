"use client";

import { useForm, ValidationError } from "@formspree/react";
import { TEXT_HEADING, TEXT_MUTED, GRADIENT_CTA, RADIUS, SHADOW } from "@/lib/theme";

const FORMSPREE_FORM_ID = "xjgnakev";

export function ContactForm() {
  const [state, handleSubmit] = useForm(FORMSPREE_FORM_ID);

  if (state.succeeded) {
    return (
      <div style={{ padding: 8 }}>
        <h2 style={{ fontSize: 17, fontWeight: 700, color: TEXT_HEADING, margin: "0 0 10px" }}>Message sent</h2>
        <p style={{ fontSize: 14.5, color: TEXT_MUTED, lineHeight: 1.65, margin: 0 }}>
          Thanks — we&apos;ve received your message and will get back to you as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Name
        <input type="text" name="name" required style={{ width: "100%", marginTop: 6 }} />
      </label>

      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Email
        <input type="email" name="email" required style={{ width: "100%", marginTop: 6 }} />
        <ValidationError prefix="Email" field="email" errors={state.errors} />
      </label>

      <label style={{ fontSize: 13, fontWeight: 700, color: TEXT_HEADING }}>
        Message
        <textarea name="message" required rows={5} style={{ width: "100%", marginTop: 6, resize: "vertical" }} />
        <ValidationError prefix="Message" field="message" errors={state.errors} />
      </label>

      <ValidationError errors={state.errors} />

      <button
        type="submit"
        disabled={state.submitting}
        style={{
          alignSelf: "flex-start",
          background: GRADIENT_CTA,
          boxShadow: SHADOW.sm,
          color: "white",
          fontWeight: 800,
          border: "none",
          borderRadius: RADIUS.pill,
          padding: "13px 30px",
          fontSize: 14.5,
          opacity: state.submitting ? 0.7 : 1,
        }}
      >
        {state.submitting ? "Sending…" : "Send message"}
      </button>
    </form>
  );
}
