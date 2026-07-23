const COLORS = {
  onLight: {
    five: "oklch(0.3 0.06 255)",
    star: "oklch(0.72 0.16 75)",
    conveyancing: "oklch(0.5 0.02 260)",
  },
  onDark: {
    five: "#FFFFFF",
    star: "oklch(0.75 0.15 75)",
    conveyancing: "oklch(0.85 0.02 260)",
  },
} as const;

interface LogoProps {
  variant?: keyof typeof COLORS;
  size?: number;
  className?: string;
}

// Wordmark-only lockup ("1E" from the logo exploration): merged condensed caps,
// three-color split (FIVE / STAR / CONVEYANCING) rather than an icon mark.
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
