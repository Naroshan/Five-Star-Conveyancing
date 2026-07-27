const COLORS = {
  onLight: {
    five: "oklch(0.2 0.02 240)",
    star: "oklch(0.5 0.22 350)",
    conveyancing: "oklch(0.5 0.02 240)",
  },
  onDark: {
    five: "#FFFFFF",
    star: "oklch(0.5 0.22 350)",
    conveyancing: "oklch(0.75 0.02 240)",
  },
} as const;

interface LogoProps {
  variant?: keyof typeof COLORS;
  size?: number;
  className?: string;
}

// Wordmark-only lockup: merged Baloo 2 display-font caps, three-color split
// (FIVE / STAR / CONVEYANCING). "STAR" is always ACCENT_BOLD (the one
// magenta used on every CTA/gradient across the site) on both light and
// dark backgrounds, so the logo always matches the site's actual brand
// color instead of drifting between different accents depending on where
// it's rendered.
export function Logo({ variant = "onLight", size = 26, className }: LogoProps) {
  const c = COLORS[variant];
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-display), 'Baloo 2', sans-serif",
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
