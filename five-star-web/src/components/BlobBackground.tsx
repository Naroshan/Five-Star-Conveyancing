// Soft organic blob/circle decoration behind gradient hero sections —
// mirrors the circular background texture visible on both Konnect You
// (peach concentric rings) and MoneySuperMarket (purple blob shapes on the
// indigo hero). Render as the first child of a `position: relative;
// overflow: hidden` container, with sibling content given
// `position: relative; z-index: 1` to sit above it.
export function BlobBackground() {
  return (
    <div
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      <div
        style={{
          position: "absolute",
          top: "-18%",
          right: "-8%",
          width: "46%",
          paddingBottom: "46%",
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.6 0.2 350 / 0.35) 0%, oklch(0.6 0.2 350 / 0) 70%)",
          filter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          bottom: "-24%",
          left: "-10%",
          width: "40%",
          paddingBottom: "40%",
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(0.75 0.15 80 / 0.22) 0%, oklch(0.75 0.15 80 / 0) 70%)",
          filter: "blur(2px)",
        }}
      />
      <div
        style={{
          position: "absolute",
          top: "20%",
          left: "38%",
          width: "26%",
          paddingBottom: "26%",
          borderRadius: "50%",
          background: "radial-gradient(circle, oklch(1 0 0 / 0.10) 0%, oklch(1 0 0 / 0) 70%)",
          filter: "blur(2px)",
        }}
      />
    </div>
  );
}
