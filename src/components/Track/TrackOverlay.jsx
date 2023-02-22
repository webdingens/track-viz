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
import buttonStyles from "../../styles/Buttons.module.scss";
import classNames from "classnames";

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
          <div
            className={classNames(
              styles.orientationSetter,
              buttonStyles.leftRightButton
            )}
          >
            <button
              className={buttonStyles.menuButtonLeft}
              onClick={() => {
                dispatch(setOrientation((orientation - 90 + 360) % 360));
              }}
            >
              <FiRotateCcw />
            </button>
            <span>{orientation}°</span>
            <button
              className={buttonStyles.menuButtonRight}
              onClick={() => {
                dispatch(setOrientation((orientation + 90) % 360));
              }}
            >
              <FiRotateCw />
            </button>
          </div>
        </li>
        <li>
          <div
            className={classNames(
              styles.viewSetter,
              buttonStyles.leftRightButton
            )}
          >
            <button className={buttonStyles.menuButtonLeft} onClick={nextView}>
              <FiChevronLeft />
            </button>
            <span>
              <span className="hidden--xs">View: </span>
              {VIEW_LABELS[currentView]}
            </span>
            <button className={buttonStyles.menuButtonRight} onClick={prevView}>
              <FiChevronRight />
            </button>
          </div>
        </li>
        <li>
          <button
            className={buttonStyles.menuButton}
            onClick={() => dispatch(resetTrack())}
          >
            Reset<span className="hidden--xs"> Track</span>
          </button>
        </li>
      </ul>
    </div>
  );
}

export default TrackOverlay;
