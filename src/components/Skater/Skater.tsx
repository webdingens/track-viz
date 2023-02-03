import SkaterDragWrapper from "./SkaterDragWrapper";
import { useSelector } from "react-redux";

import styles from "./Skater.module.scss";

import classNames from "classnames";
import { selectTrackOrientation } from "../../app/reducers/settingsTrackSlice";

import { SkaterType } from "../../types/LibraryData";

export type SkaterProps = SkaterType & {
  key: number;
  idx: number;
  preventDragUpdate: boolean;
};

const Skater = (props: SkaterProps) => {
  const trackOrientation = useSelector(selectTrackOrientation);
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
  } = props;

  // console.log(`render: ${props.id}, ${props.idx}`);

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
              className={styles.jammerStar}
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
