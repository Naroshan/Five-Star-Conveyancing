const COLORS = {
  onLight: {
    five: "oklch(0.2 0.02 240)",
    star: "oklch(0.45 0.1 190)",
    conveyancing: "oklch(0.5 0.02 240)",
  },
  onDark: {
    five: "#FFFFFF",
    star: "oklch(0.75 0.15 80)",
    conveyancing: "oklch(0.75 0.02 240)",
  },
} as const;

interface LogoProps {
  variant?: keyof typeof COLORS;
  size?: number;
  className?: string;
}

// Wordmark-only lockup: merged condensed caps, three-color split
// (FIVE / STAR / CONVEYANCING) rather than an icon mark. Colors match the
// editorial redesign (see src/lib/theme.ts) — navy/teal on light
// backgrounds, white/gold on dark ones.
export function Logo({ variant = "onLight", size = 26, className }: LogoProps) {
  const c = COLORS[variant];
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-manrope), 'Manrope', sans-serif",
        fontStretch: "condensed",
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
