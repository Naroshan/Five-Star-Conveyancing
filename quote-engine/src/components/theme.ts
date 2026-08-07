// Five Star Conveyancing — shared design tokens (Round 8)
// Plain constants, not a CSS framework dependency — these components are
// meant to drop into any Next.js app regardless of its styling setup.
//
// Values below are literal copies of the tokens in
// five-star-web/src/lib/theme.ts (the "Five Star - Home.dc.html" layout,
// re-hued to a purple palette in Round 8) — this package can't import from
// its consumer app, so keep these in sync by hand when that file changes.

export const theme = {
  color: {
    navy: 'oklch(0.26 0.03 292)',
    navyDark: 'oklch(0.2 0.03 292)',
    offWhite: 'oklch(0.98 0.01 292)',
    surfaceWhite: '#FFFFFF',
    accent: 'oklch(0.86 0.14 292)', // light purple — backgrounds/fills only, not text (too pale for contrast)
    teal: 'oklch(0.4 0.09 292)', // deep purple — primary accent, safe for text/icons
    border: 'oklch(0.91 0.015 292)',
    textOnNavyHeading: '#FFFFFF',
    textOnNavyBody: 'oklch(0.78 0.03 292)',
    textHeading: 'oklch(0.26 0.03 292)',
    textBody: 'oklch(0.48 0.02 292)',
    textSecondary: 'oklch(0.58 0.015 292)',
    excludedBg: 'oklch(1 0 0)',
    excludedText: 'oklch(0.48 0.02 292)',
  },
  radius: { card: '20px', control: '999px' },
  gradient: {
    cta: 'linear-gradient(120deg, oklch(0.86 0.14 292) 0%, oklch(0.78 0.16 292) 100%)',
  },
  shadow: {
    sm: '0 1px 2px oklch(0.26 0.03 292 / 0.05), 0 1px 1px oklch(0.26 0.03 292 / 0.03)',
    md: '0 8px 24px oklch(0.26 0.03 292 / 0.08), 0 1px 3px oklch(0.26 0.03 292 / 0.06)',
    lg: '0 18px 40px oklch(0.26 0.03 292 / 0.1), 0 2px 6px oklch(0.26 0.03 292 / 0.06)',
  },
} as const;
