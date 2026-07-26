// Five Star Conveyancing — shared design tokens (Stage 5)
// Plain constants, not a CSS framework dependency — these components are
// meant to drop into any Next.js app regardless of its styling setup.
//
// Values below are literal copies of the tokens in
// five-star-web/src/lib/theme.ts (the Konnect-You-base +
// MoneySuperMarket-accent editorial redesign) — this package can't import
// from its consumer app, so keep these in sync by hand when that file
// changes.

export const theme = {
  color: {
    navy: 'oklch(0.2 0.02 240)',
    navyDark: 'oklch(0.15 0.02 240)',
    offWhite: 'oklch(0.97 0.012 80)',
    surfaceWhite: '#FFFFFF',
    accent: 'oklch(0.5 0.22 350)', // MoneySuperMarket-style bold accent — primary actions only
    teal: 'oklch(0.45 0.1 190)', // Konnect-You-style calm accent
    border: 'oklch(0.88 0.01 80)',
    textOnNavyHeading: '#FFFFFF',
    textOnNavyBody: 'oklch(0.75 0.02 240)',
    textHeading: 'oklch(0.22 0.03 240)',
    textBody: 'oklch(0.4 0.02 240)',
    textSecondary: 'oklch(0.5 0.02 240)',
    excludedBg: 'oklch(0.94 0.015 80)',
    excludedText: 'oklch(0.4 0.02 240)',
  },
  radius: { card: '18px', control: '999px' },
  gradient: {
    cta: 'linear-gradient(120deg, oklch(0.5 0.22 350) 0%, oklch(0.4 0.2 350) 100%)',
  },
  shadow: {
    sm: '0 1px 2px oklch(0.2 0.02 240 / 0.06), 0 1px 1px oklch(0.2 0.02 240 / 0.04)',
    md: '0 4px 16px oklch(0.2 0.02 240 / 0.10), 0 1px 3px oklch(0.2 0.02 240 / 0.08)',
    lg: '0 12px 32px oklch(0.2 0.02 240 / 0.14), 0 2px 6px oklch(0.2 0.02 240 / 0.08)',
  },
} as const;
