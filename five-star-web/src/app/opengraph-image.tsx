import { ImageResponse } from "next/og";

export const alt = "Five Star Conveyancing — compare conveyancing quotes, side by side";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori (the renderer behind ImageResponse) doesn't support oklch(), which
// src/lib/theme.ts's colors use — these are hex approximations of the same
// brand colors (NAVY/TEAL/GOLD/CREAM) for this one image, not a separate
// palette.
const NAVY = "#26243a";
const TEAL = "#3d3a6b";
const GOLD = "#e0a83e";
const CREAM = "#f7f6fb";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: `linear-gradient(135deg, ${NAVY} 0%, ${TEAL} 100%)`,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "baseline", fontSize: 72, fontWeight: 800, color: CREAM }}>
          <span>FIVE</span>
          <span style={{ color: GOLD }}>STAR</span>
          <span style={{ fontWeight: 500 }}>CONVEYANCING</span>
        </div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 32, color: CREAM, opacity: 0.85 }}>
          Compare conveyancing quotes, side by side
        </div>
      </div>
    ),
    { ...size }
  );
}
