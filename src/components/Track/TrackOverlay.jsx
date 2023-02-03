import { useSelector, useDispatch } from "react-redux";
import {
  FiRotateCw,
  FiRotateCcw,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { reset as resetTrack } from "../../app/reducers/currentTrackSlice";
import {
  setOrientation,
  selectTrackOrientation,
  selectTrackView,
  TRACK_VIEWS,
  VIEW_LABELS,
  setView,
} from "../../app/reducers/settingsTrackSlice";

import styles from "./TrackOverlay.module.scss";

function TrackOverlay() {
  const dispatch = useDispatch();
  const orientation = useSelector(selectTrackOrientation);
  const currentView = useSelector(selectTrackView);

  const nextView = () => {
    let tmp;
    switch (currentView) {
      case TRACK_VIEWS.FULL:
        tmp = TRACK_VIEWS.TRACK;
        break;
      case TRACK_VIEWS.TRACK:
        tmp = TRACK_VIEWS.START;
        break;
      case TRACK_VIEWS.START:
        tmp = TRACK_VIEWS.FULL;
        break;
    }

    dispatch(setView(tmp));
  };

  const prevView = () => {
    let tmp;
    switch (currentView) {
      case TRACK_VIEWS.FULL:
        tmp = TRACK_VIEWS.START;
        break;
      case TRACK_VIEWS.START:
        tmp = TRACK_VIEWS.TRACK;
        break;
      case TRACK_VIEWS.TRACK:
        tmp = TRACK_VIEWS.FULL;
        break;
    }

    dispatch(setView(tmp));
  };

  return (
    <div className={styles.trackOverlay}>
      <ul className={styles.trackMenu}>
        <li>
          <div className={styles.orientationSetter}>
            <button
              className={styles.menuButtonLeft}
              onClick={() => {
                dispatch(setOrientation((orientation - 90 + 360) % 360));
              }}
            >
              <FiRotateCcw />
            </button>
            <span>{orientation}°</span>
            <button
              className={styles.menuButtonRight}
              onClick={() => {
                dispatch(setOrientation((orientation + 90) % 360));
              }}
            >
              <FiRotateCw />
            </button>
          </div>
        </li>
        <li>
          <div className={styles.viewSetter}>
            <button className={styles.menuButtonLeft} onClick={nextView}>
              <FiChevronLeft />
            </button>
            <span>View: {VIEW_LABELS[currentView]}</span>
            <button className={styles.menuButtonRight} onClick={prevView}>
              <FiChevronRight />
            </button>
          </div>
        </li>
        <li>
          <button
            className={styles.menuButton}
            onClick={() => dispatch(resetTrack())}
          >
            Reset Track
          </button>
        </li>
      </ul>
    </div>
  );
}

export default TrackOverlay;
