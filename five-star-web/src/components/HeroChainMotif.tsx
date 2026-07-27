// Signature hero motif, replacing the generic blurred-blob decoration
// (the frontend-design skill calls blurred gradient blobs out by name as
// an AI-generated default). Grounded in the subject instead of an
// abstract shape: UK conveyancing has its own real vernacular for a
// linked run of buyers/sellers waiting on each other — "the chain" — so
// the hero background is a thin line-art run of house rooflines linked
// by a single unbroken line, literally drawing a property chain.
// Render as the first child of a `position: relative; overflow: hidden`
// container, with sibling content given `position: relative; z-index: 1`.
export function HeroChainMotif() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1200 220"
      preserveAspectRatio="xMidYMax slice"
      style={{
        position: "absolute",
        left: 0,
        right: 0,
        bottom: 0,
        width: "100%",
        height: 180,
        opacity: 0.16,
      }}
    >
      <polyline
        points="-40,220 -40,150 60,150 60,90 140,20 220,90 220,150 320,150 320,60 410,-30 500,60 500,150 600,150 600,100 690,10 780,100 780,150 880,150 880,70 970,-20 1060,70 1060,150 1160,150 1160,220"
        fill="none"
        stroke="white"
        strokeWidth="2.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      {[[60, 150], [320, 150], [600, 150], [880, 150], [1160, 150]].map(([cx, cy]) => (
        <circle key={cx} cx={cx} cy={cy} r="6" fill="white" />
      ))}
    </svg>
  );
}
