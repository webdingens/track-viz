import classNames from "classnames";
import { FiMinusCircle } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  selectAnimatingSkaters,
  selectAnimationState,
  ANIMATION_STATE,
} from "../../app/reducers/animatingTrackSlice";
import { selectCurrentSkaters } from "../../app/reducers/currentTrackSlice";
import {
  selectLegendCollapsed,
  setLegendCollapsed,
} from "../../app/reducers/interactionStateSlice";
import {
  selectTrackView,
  TRACK_VIEWS,
} from "../../app/reducers/settingsTrackSlice";
import { SKATER_ANNOTATION_COLORS } from "../../utils/colors";
import CirclePreview from "../Skater/CirclePreview";

import styles from "./Legend.module.scss";

function Legend() {
  const currentSkaters = useSelector(selectCurrentSkaters);
  const dispatch = useDispatch();
  const view = useSelector(selectTrackView);
  const animationState = useSelector(selectAnimationState);
  const animatingSkaters = useSelector(selectAnimatingSkaters);
  const legendCollapsed = useSelector(selectLegendCollapsed);
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
        [styles.legendCollapsed]: legendCollapsed && view === TRACK_VIEWS.START,
      })}
    >
      {view === TRACK_VIEWS.START && (
        <button
          type="button"
          title="Toggle Legend"
          aria-expanded={!legendCollapsed}
          onClick={() => dispatch(setLegendCollapsed(!legendCollapsed))}
        >
          {legendCollapsed ? "L" : <FiMinusCircle />}
        </button>
      )}
      <div className={styles.collapsible}>
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
    </div>
  );
}

export default Legend;
