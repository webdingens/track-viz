import { useId } from "react";
import { useSelector } from "react-redux";
import { selectGeneralSettings } from "../../app/reducers/settingsGeneralSlice";
import {
  SkaterType,
  SKATER_ANNOTATION_PATTERNS,
} from "../../types/LibraryData";
import {
  getAlternateColor,
  hslToString,
  SKATER_ANNOTATION_COLORS,
} from "../../utils/colors";
import JammerStar from "./JammerStar";
import PivotStripe from "./PivotStripe";
import Paths from "../Textures/Paths";

function CirclePreview({
  skater,
  team,
  color,
  pattern,
}: {
  skater?: SkaterType;
  team?: "A" | "B";
  color?: typeof SKATER_ANNOTATION_COLORS;
  pattern?: typeof SKATER_ANNOTATION_PATTERNS;
}) {
  const settings = useSelector(selectGeneralSettings);
  const id = useId();
  let usedColor;
  if (color) {
    usedColor = color;
  } else if (!skater && team) {
    usedColor = team === "A" ? settings.colorTeamA : settings.colorTeamB;
  } else if (skater) {
    const teamColor =
      skater.team === "A" ? settings.colorTeamA : settings.colorTeamB;

    usedColor =
      (skater.color ?? SKATER_ANNOTATION_COLORS.ORIGINAL) ===
      SKATER_ANNOTATION_COLORS.ORIGINAL
        ? teamColor
        : getAlternateColor(teamColor);
  }

  let usedPattern;
  if (pattern) {
    usedPattern = pattern;
  } else if (skater?.pattern) {
    usedPattern = skater.pattern;
  }
  if (!usedColor && !usedPattern) return null;
  return (
    <svg width="32" height="32" viewBox="-16,-16 32,32">
      {usedPattern && (
        <Paths
          id={`${id}-${usedPattern}`}
          d={usedPattern}
          strokeWidth={2}
          stroke={usedColor.l > 0.5 ? "#000" : "#fff"}
          size={8}
          background={usedColor ? hslToString(usedColor) : null}
        />
      )}
      <circle
        r="14"
        strokeWidth="2.5"
        stroke="#000"
        style={{
          fill: usedPattern
            ? `url(#${id}-${usedPattern})`
            : hslToString(usedColor),
        }}
      />
      {skater && (skater.isPivot ?? false) && (
        <PivotStripe color={usedColor} scale={14 / 0.3} />
      )}
      {skater && (skater.isJammer ?? false) && (
        <JammerStar color={usedColor} scale={14 / 0.3} />
      )}
    </svg>
  );
}

export default CirclePreview;
