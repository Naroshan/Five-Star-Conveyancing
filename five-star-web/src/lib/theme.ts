// Shared color/type tokens for the editorial redesign (from the
// "Five Star - Home.dc.html" design handoff), used by SiteHeader,
// SiteFooter, and every page migrated to the new look. Values match the
// design source's oklch() literals exactly — don't round them.
//
// Breakpoints used across the site's CSS Modules: mobile <=640px,
// tablet <=1024px. (Can't be expressed as JS constants — @media
// conditions live directly in each .module.css file.)
export const NAVY = "oklch(0.2 0.02 240)";
export const TEAL = "oklch(0.45 0.1 190)";
export const GOLD = "oklch(0.75 0.15 80)";
export const CREAM = "oklch(0.97 0.012 80)";
export const CREAM_ALT = "oklch(0.94 0.015 80)";
export const BORDER = "oklch(0.88 0.01 80)";
export const BORDER_ALT = "oklch(0.85 0.01 80)";
export const TEXT_HEADING = "oklch(0.22 0.03 240)";
export const TEXT_BODY = "oklch(0.4 0.02 240)";
export const TEXT_MUTED = "oklch(0.5 0.02 240)";
export const TEXT_ON_NAVY_MUTED = "oklch(0.75 0.02 240)";
export const ERROR = "oklch(0.5 0.18 25)";

// MoneySuperMarket-style bold accent — used sparingly, for primary CTAs
// and category-tile color-blocking, against the calm Konnect-You-style
// navy/cream/teal/gold base above.
export const ACCENT_BOLD = "oklch(0.5 0.22 350)";
export const ACCENT_BOLD_DARK = "oklch(0.4 0.2 350)";

export const RADIUS = { sm: 8, md: 14, lg: 22, pill: 999 };

export const SPACE = { xs: 8, sm: 16, md: 24, lg: 40, xl: 64 };

// Bold gradients — the direct MoneySuperMarket/Konnect-You visual language
// this site was missing: elevated cards and gradient bands instead of flat
// fills and thin borders. Built only from the hues already declared above.
export const GRADIENT_HERO = "linear-gradient(135deg, oklch(0.22 0.06 260) 0%, oklch(0.34 0.14 290) 45%, oklch(0.5 0.22 350) 100%)";
export const GRADIENT_CTA = "linear-gradient(120deg, oklch(0.5 0.22 350) 0%, oklch(0.4 0.2 350) 100%)";
export const GRADIENT_GOLD_BAND = "linear-gradient(120deg, oklch(0.8 0.14 85) 0%, oklch(0.72 0.16 70) 100%)";
export const GRADIENT_TEAL = "linear-gradient(135deg, oklch(0.48 0.1 190) 0%, oklch(0.38 0.09 200) 100%)";

// Card elevation scale — nothing in this codebase had a shadow before this;
// every new elevated card/button uses one of these three.
export const SHADOW = {
  sm: "0 1px 2px oklch(0.2 0.02 240 / 0.06), 0 1px 1px oklch(0.2 0.02 240 / 0.04)",
  md: "0 4px 16px oklch(0.2 0.02 240 / 0.10), 0 1px 3px oklch(0.2 0.02 240 / 0.08)",
  lg: "0 12px 32px oklch(0.2 0.02 240 / 0.14), 0 2px 6px oklch(0.2 0.02 240 / 0.08)",
};

// Pale wash backgrounds for icon badge circles — icon drawn in the matching
// saturated color (TEAL / ACCENT_BOLD / GOLD) on top.
export const ICON_BADGE_BG = "oklch(0.95 0.03 190)";
export const ICON_BADGE_BG_ACCENT = "oklch(0.94 0.05 350)";
export const ICON_BADGE_BG_GOLD = "oklch(0.94 0.04 80)";

// Bold rounded display font (Baloo 2) — used for every headline and the
// logo. Replaces the earlier Fraunces-serif "editorial" treatment, which
// read as generic AI-template output rather than matching the bold
// confident headline character of the Konnect You / MoneySuperMarket
// reference sites this redesign is based on.
export const display = { fontFamily: "var(--font-display), 'Baloo 2', sans-serif" };
export const manrope = { fontFamily: "var(--font-manrope), 'Manrope', sans-serif" };
