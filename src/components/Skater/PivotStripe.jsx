function PivotStripe({ color, scale = 1 }) {
  return (
    <>
      <path
        d={`M${-0.3 * scale},0 L ${0.3 * scale},0`}
        style={{
          stroke: color.l > 0.7 ? "#000" : "#fff",
          strokeWidth: 0.15 * scale,
          pointerEvents: "none",
        }}
      />
      <circle
        r={0.3 * scale}
        style={{
          stroke: "var(--skater-rim-color, #000)",
          strokeWidth: 0.05 * scale,
          fill: "none",
        }}
      />
    </>
  );
}

export default PivotStripe;
