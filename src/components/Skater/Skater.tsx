import SkaterDragWrapper from "./SkaterDragWrapper";
import { useSelector } from "react-redux";

import styles from "./Skater.module.scss";

import classNames from "classnames";
import { selectTrackOrientation } from "../../app/reducers/settingsTrackSlice";

import { SkaterType } from "../../types/Skater";

export type SkaterProps = SkaterType & {
  key: number;
  idx: number;
  label: string;
  preventDragUpdate: boolean;
};

const Skater = (props: SkaterProps) => {
  const trackOrientation = useSelector(selectTrackOrientation);
  let {
    team,
    rotation,
    idx,
    label,
    hasFocus = false,
    isPivot = false,
    isJammer = false,
    inBounds = false,
    inPlay = false,
    packSkater = false, // TODO: can this be removed? when is this used? overlaps with inPlay
  } = props;

  return (
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
        <circle className={styles.skaterBackground} r=".3" fill="green" />
        {label ? (
          <text
            className={classNames({
              [styles.blockerNumber]: true,
              "js-blocker-number": true,
            })}
            y=".32em"
            fontSize=".4"
            textAnchor="middle"
            transform={`rotate(${-rotation - trackOrientation})`}
          >
            {label}
          </text>
        ) : null}
        {isPivot ? (
          <>
            <path className={styles.pivotStripe} d="M-.3,0 L .3,0" />
            <circle className={styles.pivotOutline} r=".3" />
          </>
        ) : null}
        {isJammer ? (
          <>
            {/* Jammer Star */}
            <path
              d="m55,237 74-228 74,228L9,96h240"
              transform={`rotate(-${trackOrientation}) translate(-.23, -.23) scale(.0018)`}
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
  );
};

export default Skater;
