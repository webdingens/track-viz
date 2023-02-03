export const SKATER_ANNOTATION_COLORS = {
  ORIGINAL: "ORIGINAL",
  ALTERNATE: "ALTERNATE",
} as const;

export const getAlternateLightness = (l: number) => {
  return l + (l > 0.5 ? -0.3 : 0.3);
};

export const getAlternateColor = (hsl: { h: number; s: number; l: number }) => {
  return {
    ...hsl,
    l: getAlternateLightness(hsl.l),
  };
};

export const hslToString = ({
  h,
  s,
  l,
}: {
  h: number;
  s: number;
  l: number;
}) => {
  return `hsl(${h}, ${s * 100}%, ${l * 100}%)`;
};
