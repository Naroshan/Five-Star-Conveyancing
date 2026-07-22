// Five Star Conveyancing — shared design tokens (Stage 5)
// Plain constants, not a CSS framework dependency — these components are
// meant to drop into any Next.js app regardless of its styling setup.

export const theme = {
  color: {
    navy: '#0F1B2A',
    navyDark: '#0B141F',
    offWhite: '#F7F5F0',
    surfaceWhite: '#FFFFFF',
    accent: '#2F6F5E', // muted teal — the one accent colour, per the Stage 5 "no gold stars" decision
    border: '#E4E1D8',
    textOnNavyHeading: '#F5F3EC',
    textOnNavyBody: '#B9C2CE',
    textHeading: '#111111',
    textBody: '#3D3D3A',
    textSecondary: '#6B6A63',
    excludedBg: '#F7F5F0',
    excludedText: '#4A4A45',
  },
  radius: { card: '12px', control: '6px' },
} as const;
