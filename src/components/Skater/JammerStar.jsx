function JammerStar({ color, scale = 1 }) {
  return (
    <path
      d="m55,237 74-228 74,228L9,96h240"
      transform={`translate(${scale * -0.23}, ${scale * -0.23}) scale(${
        scale * 0.0018
      })`}
      style={{
        fill: color.l > 0.7 ? "#000" : "#fff",
        pointerEvents: "none",
      }}
    />
  );
}

export default JammerStar;
