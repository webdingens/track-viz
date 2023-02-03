import { useSelector, useDispatch } from "react-redux";
import { FiRotateCw, FiRotateCcw, FiSquare, FiXSquare } from "react-icons/fi";

import { reset as resetTrack } from "../../app/reducers/currentTrackSlice";
import {
  setOrientation,
  setShowRefLane,
  selectTrackOrientation,
  selectTrackShowRefLane,
} from "../../app/reducers/settingsTrackSlice";

import styles from "./TrackOverlay.module.scss";

function TrackOverlay() {
  const dispatch = useDispatch();
  const orientation = useSelector(selectTrackOrientation);
  const showRefLane = useSelector(selectTrackShowRefLane);

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
          <button
            className={styles.menuButton}
            onClick={() => dispatch(setShowRefLane(!showRefLane))}
          >
            {showRefLane ? <FiXSquare /> : <FiSquare />} <span>Ref Lane</span>
          </button>
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
