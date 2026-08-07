import { NAVY, TEAL } from "@/lib/theme";

const COLORS = {
  onLight: {
    five: NAVY,
    star: TEAL,
    conveyancing: "oklch(0.58 0.015 292)",
  },
  onDark: {
    five: "#FFFFFF",
    star: TEAL,
    conveyancing: "oklch(0.78 0.03 292)",
  },
} as const;

interface LogoProps {
  variant?: keyof typeof COLORS;
  size?: number;
  className?: string;
}

// Wordmark-only lockup: Plus Jakarta Sans, three-color split (FIVE / STAR /
// CONVEYANCING). "STAR" is always TEAL (deep purple — the primary accent
// used for text/icon foregrounds across the site, since the light-purple
// ACCENT_BOLD is a fill-only color with too little contrast for text) on
// both light and dark backgrounds.
export function Logo({ variant = "onLight", size = 26, className }: LogoProps) {
  const c = COLORS[variant];
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-plusjakarta), 'Plus Jakarta Sans', sans-serif",
        letterSpacing: "-0.01em",
        fontSize: size,
        lineHeight: 1,
        whiteSpace: "nowrap",
      }}
    >
      <span style={{ fontWeight: 800, color: c.five }}>FIVE</span>
      <span style={{ fontWeight: 800, color: c.star }}>STAR</span>
      <span style={{ fontWeight: 600, color: c.conveyancing }}>CONVEYANCING</span>
    </span>
  );
}
