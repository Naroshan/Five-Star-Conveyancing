"use client";

// UK PECR/GDPR requires consent before non-essential cookies (analytics,
// live chat) are set. Both the Google tag and LiveChat scripts previously
// loaded unconditionally on every page load — this component gates them
// behind an explicit accept/reject choice instead, remembered in
// localStorage so the banner doesn't reappear on every visit.

import { useState, useSyncExternalStore } from "react";
import Script from "next/script";
import Link from "next/link";
import { NAVY, TEAL, CREAM, BORDER, RADIUS, SHADOW, GRADIENT_CTA } from "@/lib/theme";

const STORAGE_KEY = "cookie_consent";
type Consent = "accepted" | "rejected";

function readStoredConsent(): Consent | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return stored === "accepted" || stored === "rejected" ? stored : null;
  } catch {
    // localStorage unavailable (private browsing, blocked storage) — treat
    // as no choice made yet rather than crashing.
    return null;
  }
}

// localStorage has no built-in subscription mechanism for same-tab writes,
// so there's nothing to subscribe to beyond re-reading on demand — but
// useSyncExternalStore is still the right tool here (over an effect calling
// setState) because it has a real server snapshot (null, since there's no
// window during SSR), which is exactly what avoids a hydration mismatch.
function subscribe() {
  return () => {};
}
function getServerSnapshot(): Consent | null {
  return null;
}

export function CookieConsent() {
  const stored = useSyncExternalStore(subscribe, readStoredConsent, getServerSnapshot);
  // A choice made this page load (from clicking a button) always wins over
  // the stored value, so the banner/scripts update immediately without
  // waiting on useSyncExternalStore to notice the localStorage write.
  const [choice, setChoice] = useState<Consent | null>(null);
  const consent = choice ?? stored;

  function choose(next: Consent) {
    setChoice(next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Ignore — the choice still applies for this page load either way.
    }
  }

  return (
    <>
      {consent === "accepted" && (
        <>
          {/* Google tag (gtag.js) */}
          <Script src="https://www.googletagmanager.com/gtag/js?id=GT-5MCNDKRF" strategy="afterInteractive" />
          <Script id="google-tag-init" strategy="afterInteractive">
            {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', 'GT-5MCNDKRF');`}
          </Script>
          {/* LiveChat widget — license 19914263 */}
          <Script id="livechat-init" strategy="afterInteractive">
            {`window.__lc = window.__lc || {};
window.__lc.license = 19914263;
window.__lc.integration_name = "manual_channels";
window.__lc.product_name = "livechat";
;(function(n,t,c){function i(n){return e._h?e._h.apply(null,n):e._q.push(n)}var e={_q:[],_h:null,_v:"2.0",on:function(){i(["on",c.call(arguments)])},once:function(){i(["once",c.call(arguments)])},off:function(){i(["off",c.call(arguments)])},get:function(){if(!e._h)throw new Error("[LiveChatWidget] You can't use getters before load.");return i(["get",c.call(arguments)])},call:function(){i(["call",c.call(arguments)])},init:function(){var n=t.createElement("script");n.async=!0,n.type="text/javascript",n.src="https://cdn.livechatinc.com/tracking.js",t.head.appendChild(n)}};!n.__lc.asyncInit&&e.init(),n.LiveChatWidget=n.LiveChatWidget||e}(window,document,[].slice))`}
          </Script>
          <noscript>
            <a href="https://www.livechat.com/chat-with/19914263/" rel="nofollow">
              Chat with us
            </a>
            , powered by{" "}
            <a href="https://www.livechat.com/?welcome" rel="noopener nofollow" target="_blank">
              LiveChat
            </a>
          </noscript>
        </>
      )}

      {consent === null && (
        <div
          role="region"
          aria-label="Cookie consent"
          style={{
            position: "fixed",
            left: 16,
            right: 16,
            bottom: 16,
            zIndex: 2000,
            maxWidth: 640,
            margin: "0 auto",
            background: CREAM,
            border: `1px solid ${BORDER}`,
            borderRadius: RADIUS.md,
            boxShadow: SHADOW.lg,
            padding: "16px 20px",
            display: "flex",
            flexWrap: "wrap",
            alignItems: "center",
            gap: 14,
          }}
        >
          <p style={{ fontSize: 13, color: NAVY, margin: 0, flex: "1 1 320px" }}>
            We use cookies for analytics and live chat so we can understand how the site is used and let you talk to
            us. These only run if you accept.{" "}
            <Link href="/contact" style={{ color: TEAL, fontWeight: 700, textDecoration: "none" }}>
              Find out more
            </Link>
            .
          </p>
          <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
            <button
              type="button"
              onClick={() => choose("rejected")}
              style={{
                background: "transparent",
                border: `1px solid ${BORDER}`,
                borderRadius: RADIUS.pill,
                color: NAVY,
                fontWeight: 700,
                fontSize: 13,
                padding: "9px 18px",
                cursor: "pointer",
              }}
            >
              Reject
            </button>
            <button
              type="button"
              onClick={() => choose("accepted")}
              style={{
                background: GRADIENT_CTA,
                border: "none",
                borderRadius: RADIUS.pill,
                color: NAVY,
                fontWeight: 800,
                fontSize: 13,
                padding: "9px 18px",
                cursor: "pointer",
                boxShadow: SHADOW.md,
              }}
            >
              Accept
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// Exported for other components (e.g. a future "cookie settings" link) that
// might want to know whether analytics/chat are currently active.
export function hasAnalyticsConsent(): boolean {
  return readStoredConsent() === "accepted";
}
