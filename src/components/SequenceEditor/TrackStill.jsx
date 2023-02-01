import classNames from "classnames";
import { useDispatch, useSelector } from "react-redux";

import {
  FiDownload,
  FiUpload,
  FiTrash2,
  FiChevronLeft,
  FiChevronRight,
} from "react-icons/fi";

import { ReactComponent as StoreNub } from "../../images/storeNub.svg";

import {
  setCurrentTrack,
  selectCurrentTrack,
} from "../../app/reducers/currentTrackSlice";

import {
  setTrack,
  removeTrack,
  moveTrackRight,
  moveTrackLeft,
} from "../../app/reducers/currentSequenceSlice";

import styles from "./TrackStill.module.scss";

function TrackStill({
  track,
  active,
  onClickTrack,
  onDoubleClickTrack,
  listPosition,
}) {
  const dispatch = useDispatch();
  const currentTrack = useSelector(selectCurrentTrack);

  return (
    <div
      className={classNames({
        [styles.Track]: true,
        [styles.TrackActive]: active,
      })}
    >
      <label>
        <input
          type="radio"
          name="tracks[]"
          onClick={onClickTrack}
          onDoubleClick={onDoubleClickTrack}
        />
        <span>Track {track.id}</span>
        <StoreNub
          className={classNames({
            [styles.StoreNub]: true,
            [styles.StoreNubEmpty]: track.empty,
          })}
        />
      </label>

      {/* Controls for this track if active */}
      {active && (
        <>
          {!listPosition.first ? (
            <button
              className={styles.MoveLeft}
              onClick={() => dispatch(moveTrackLeft({ id: track.id }))}
              title="Move Left"
            >
              <span>Move Left</span>
              <FiChevronLeft />
            </button>
          ) : null}

          {!listPosition.last ? (
            <button
              className={styles.MoveRight}
              onClick={() => dispatch(moveTrackRight({ id: track.id }))}
              title="Move Right"
            >
              <span>Move Right</span>
              <FiChevronRight />
            </button>
          ) : null}

          <button
            className={styles.Remove}
            onClick={() => dispatch(removeTrack({ id: track.id }))}
            title="Remove"
          >
            <span>Remove</span>
            <FiTrash2 />
          </button>
          <button
            className={styles.Save}
            onClick={() =>
              dispatch(
                setTrack({
                  id: track.id,
                  track: currentTrack,
                })
              )
            }
            title="Save"
          >
            <span>Save</span>
            <FiDownload />
          </button>

          {/* Show Button only when we have data to load */}
          {!track.empty && (
            <button
              className={styles.Load}
              onClick={() => dispatch(setCurrentTrack(track))}
              title="Load"
            >
              <span>Load</span>
              <FiUpload />
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default TrackStill;
