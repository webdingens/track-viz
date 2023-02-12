import classNames from "classnames";
import { useSelector } from "react-redux";
import {
  selectAnimatingSkaters,
  selectAnimationState,
  ANIMATION_STATE,
} from "../../app/reducers/animatingTrackSlice";
import { selectCurrentSkaters } from "../../app/reducers/currentTrackSlice";
import {
  selectTrackView,
  TRACK_VIEWS,
} from "../../app/reducers/settingsTrackSlice";
import { SKATER_ANNOTATION_COLORS } from "../../utils/colors";
import CirclePreview from "../Skater/CirclePreview";

import styles from "./Legend.module.scss";

function Legend() {
  const currentSkaters = useSelector(selectCurrentSkaters);
  const view = useSelector(selectTrackView);
  const animationState = useSelector(selectAnimationState);
  const animatingSkaters = useSelector(selectAnimatingSkaters);
  const skaters =
    animationState === ANIMATION_STATE.PLAYING
      ? animatingSkaters
      : currentSkaters;

  const legendSkaters = skaters.filter((skater) => {
    return (
      skater.color === SKATER_ANNOTATION_COLORS.ALTERNATE ||
      skater.description ||
      skater.pattern
    );
  });
  if (legendSkaters.length === 0) return null;
  return (
    <div
      className={classNames(styles.legend, {
        [styles.legendCorner]: view === TRACK_VIEWS.START,
      })}
    >
      <h2>Legend</h2>
      {legendSkaters.map((skater) => {
        return (
          <div key={skater.id} className={styles.circlePreview}>
            <CirclePreview skater={skater} ignoreTrackOrientation />
            <span>
              (<CirclePreview team={skater.team} />
              ):
            </span>
            {skater.description}
          </div>
        );
      })}
    </div>
  );
}

export default Legend;
