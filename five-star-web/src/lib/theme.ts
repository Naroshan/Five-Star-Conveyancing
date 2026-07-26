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

export const RADIUS = { sm: 8, md: 14, pill: 999 };

export const SPACE = { xs: 8, sm: 16, md: 24, lg: 40, xl: 64 };

export const fraunces = { fontFamily: "var(--font-fraunces), 'Fraunces', serif" };
export const manrope = { fontFamily: "var(--font-manrope), 'Manrope', sans-serif" };
