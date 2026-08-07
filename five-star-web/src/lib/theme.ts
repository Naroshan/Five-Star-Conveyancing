// Shared color/type tokens for the "Five Star - Home.dc.html" Claude
// Design handoff (Round 7), re-hued from the original mint-green/forest-
// green palette to a purple family (Round 8) at the user's request — same
// lightness/chroma structure, hue rotated from ~155 to ~292. Plus Jakarta
// Sans throughout. Token NAMES are kept stable from earlier rounds so
// every page importing them picks up the new look with no per-file edits;
// only the underlying values changed.
//
// Breakpoints used across the site's CSS Modules: mobile <=640px,
// tablet <=1024px. (Can't be expressed as JS constants — @media
// conditions live directly in each .module.css file.)
export const NAVY = "oklch(0.26 0.03 292)"; // heading/dark text
export const TEAL = "oklch(0.4 0.09 292)"; // deep purple — primary accent (links, icons, foreground uses)
export const GOLD = "oklch(0.77 0.16 75)"; // star/rating accent, unchanged role
export const CREAM = "oklch(0.98 0.01 292)"; // pale lavender-white section bg
export const CREAM_ALT = "oklch(1 0 0)"; // #FFFFFF — page base background
export const BORDER = "oklch(0.91 0.015 292)";
export const BORDER_ALT = "oklch(0.88 0.015 292)";
export const TEXT_HEADING = "oklch(0.26 0.03 292)";
export const TEXT_BODY = "oklch(0.48 0.02 292)";
export const TEXT_MUTED = "oklch(0.58 0.015 292)";
export const TEXT_ON_NAVY_MUTED = "oklch(0.78 0.03 292)";
export const ERROR = "oklch(0.5 0.18 25)";

// Bold light-purple accent — background/fill role ONLY (pills, badges,
// active-step highlights). Not readable as text/icon foreground on white —
// those usages are repointed to TEAL instead (see components using
// ACCENT_BOLD with `color:`/`stroke:` rather than `background:`).
export const ACCENT_BOLD = "oklch(0.86 0.14 292)";
export const ACCENT_BOLD_DARK = "oklch(0.78 0.16 292)"; // hover/pressed

export const RADIUS = { sm: 8, md: 14, lg: 20, pill: 999 };

export const SPACE = { xs: 8, sm: 16, md: 24, lg: 40, xl: 64 };

// Gradients — Home.dc.html's actual bands: a soft light hero wash, a bold
// deep-purple CTA band, and a shallow light-purple gradient for pill
// buttons (keeps existing `background: GRADIENT_CTA` call sites reading as
// solid-with-depth instead of requiring every button site to switch to a
// flat fill).
export const GRADIENT_HERO = "linear-gradient(180deg, oklch(0.96 0.02 292) 0%, oklch(1 0 0) 100%)";
export const GRADIENT_CTA = "linear-gradient(120deg, oklch(0.86 0.14 292) 0%, oklch(0.78 0.16 292) 100%)";
export const GRADIENT_GOLD_BAND = "linear-gradient(120deg, oklch(0.82 0.14 80) 0%, oklch(0.75 0.16 72) 100%)";
export const GRADIENT_TEAL = "linear-gradient(135deg, oklch(0.4 0.09 292) 0%, oklch(0.46 0.1 292) 100%)"; // dark-purple CTA band

// Card elevation scale — Home.dc.html's cards mostly rely on a 1px BORDER
// at rest and only add shadow on hover, so these read lighter than before.
export const SHADOW = {
  sm: "0 1px 2px oklch(0.26 0.03 292 / 0.05), 0 1px 1px oklch(0.26 0.03 292 / 0.03)",
  md: "0 8px 24px oklch(0.26 0.03 292 / 0.08), 0 1px 3px oklch(0.26 0.03 292 / 0.06)",
  lg: "0 18px 40px oklch(0.26 0.03 292 / 0.1), 0 2px 6px oklch(0.26 0.03 292 / 0.06)",
};

// Pale wash backgrounds for icon badge circles — icon drawn in the matching
// saturated color (TEAL / ACCENT_BOLD / GOLD) on top.
export const ICON_BADGE_BG = "oklch(0.95 0.03 292)";
export const ICON_BADGE_BG_ACCENT = "oklch(0.95 0.03 292)";
export const ICON_BADGE_BG_GOLD = "oklch(0.95 0.03 80)";

// Plus Jakarta Sans — single family for both headings and body, matching
// every page in the "Five Star - Home.dc.html" handoff. Both token names
// kept (rather than collapsing to one) so the ~15 files already spreading
// `...display`/`...manrope` don't need touching.
export const display = { fontFamily: "var(--font-plusjakarta), 'Plus Jakarta Sans', system-ui, sans-serif" };
export const manrope = { fontFamily: "var(--font-plusjakarta), 'Plus Jakarta Sans', system-ui, sans-serif" };
