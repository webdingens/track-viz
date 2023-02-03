import SkaterDragWrapper from "./SkaterDragWrapper";
import { useSelector } from "react-redux";
import SVGTextures from "react-svg-textures";

import styles from "./Skater.module.scss";

import classNames from "classnames";
import { selectTrackOrientation } from "../../app/reducers/settingsTrackSlice";

import {
  SkaterType,
  SKATER_ANNOTATION_PATTERNS,
} from "../../types/LibraryData";
import { selectGeneralSettings } from "../../app/reducers/settingsGeneralSlice";
import {
  getAlternateColor,
  hslToString,
  SKATER_ANNOTATION_COLORS,
} from "../../utils/colors";
import { useId } from "react";
const Paths = SVGTextures.Paths;

export type SkaterProps = SkaterType & {
  key: number;
  idx: number;
  preventDragUpdate: boolean;
};

const Skater = (props: SkaterProps) => {
  let {
    team,
    rotation,
    idx,
    hasFocus = false,
    isPivot = false,
    isJammer = false,
    inBounds = false,
    inPlay = false,
    packSkater = false, // TODO: show some feedback to indicate this person is a pack skater?
    color = SKATER_ANNOTATION_COLORS.ORIGINAL,
    pattern = false,
  } = props;

  const trackOrientation = useSelector(selectTrackOrientation);
  const settings = useSelector(selectGeneralSettings);
  const teamColor = team === "A" ? settings.colorTeamA : settings.colorTeamB;
  const id = useId();

  const usedColor =
    color === SKATER_ANNOTATION_COLORS.ORIGINAL
      ? teamColor
      : getAlternateColor(teamColor);

  return (
    <>
      {!!pattern && (
        <Paths
          id={`${id}-${pattern}`}
          d={pattern}
          strokeWidth={(2 * 0.3) / 14}
          stroke={usedColor.l > 0.5 ? "#000" : "#fff"}
          size={(8 * 0.3) / 14}
          background={usedColor ? hslToString(usedColor) : null}
        />
      )}
      <g
        className={classNames({
          [styles.skater]: true,
          [styles["skater-A"]]: team === "A",
          [styles["skater-B"]]: team === "B",
          [styles["skater--has-focus"]]: hasFocus,
          [styles["skater--in-bounds"]]: inBounds,
          [styles["skater--in-play"]]: inPlay,
        })}
        data-idx={idx}
      >
        <SkaterDragWrapper {...props}>
          <path className={styles.shield} d="M.1,.3 A.3 .3 90 1 0 .1,-.3" />
          <circle
            className={styles.skaterBackground}
            r=".3"
            style={{
              fill: pattern ? `url(#${id}-${pattern})` : hslToString(usedColor),
            }}
          />
          {isPivot ? (
            <>
              <path
                className={styles.pivotStripe}
                d="M-.3,0 L .3,0"
                style={{
                  stroke: usedColor.l > 0.7 ? "#000" : "#fff",
                }}
              />
              <circle className={styles.pivotOutline} r=".3" />
            </>
          ) : null}
          {isJammer ? (
            <>
              {/* Jammer Star */}
              <path
                className={styles.jammerStar}
                d="m55,237 74-228 74,228L9,96h240"
                transform={`rotate(-${trackOrientation}) translate(-.23, -.23) scale(.0018)`}
                style={{
                  fill: usedColor.l > 0.7 ? "#000" : "#fff",
                }}
              />
            </>
          ) : null}
          <g
            className={classNames({
              [styles.statusWrapper]: true,
              "js-status-icon": true,
            })}
            transform={`rotate(${-rotation - trackOrientation})`}
          >
            <g transform="translate(.22, -.22)">
              <text
                className={classNames({
                  [styles.status]: true,
                  [styles.statusOutOfPlay]: true,
                })}
                textAnchor="start"
                fontSize=".35"
                x="0"
                y="0"
              >
                OOP
              </text>
              <text
                className={classNames({
                  [styles.status]: true,
                  [styles.statusOutOfBounds]: true,
                })}
                textAnchor="start"
                fontSize=".35"
                x="0"
                y="0"
              >
                OOB
              </text>
            </g>
          </g>
        </SkaterDragWrapper>
      </g>
    </>
  );
};

export default Skater;
