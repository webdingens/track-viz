import React, { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";
import _ from "lodash";

import Preview from "./Preview";

import {
  FiPlusCircle,
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
  addTrack,
  selectCurrentTracks,
  setTrack,
  removeTrack,
  moveTrackRight,
  moveTrackLeft,
} from "../../app/reducers/currentSequenceSlice";

import styles from "./SequenceEditor.module.scss";

let previewId = 0;

const SequenceEditor = () => {
  const [state, setState] = useState({
    activeTrack: null,
    previews: [],
  });

  /* Redux */
  const dispatch = useDispatch();
  const tracks = useSelector(selectCurrentTracks);
  const currentTrack = useSelector(selectCurrentTrack);

  const onPreviewShown = useCallback(
    (id) => {
      setState((state) => {
        let previews = state.previews.filter((preview) => preview.id !== id);
        return {
          ...state,
          previews,
        };
      });
    },
    [setState]
  );

  return (
    <div className={styles.SequenceEditor}>
      <div className={styles.Tracks}>
        <ul>
          {tracks.map((track, idx) => (
            <li
              className={classNames({
                [styles.Track]: true,
                [styles.TrackActive]: track.id === state.activeTrack,
              })}
              key={track.id}
            >
              <label>
                <input
                  type="radio"
                  name="tracks[]"
                  onClick={(evt) => {
                    let previews = state.previews;
                    if (!track.empty) {
                      previews = _.cloneDeep(previews);
                      previews.push({
                        bbox: evt.target.getBoundingClientRect(),
                        track,
                        id: previewId++,
                      });
                    }
                    setState({
                      activeTrack: track.id,
                      previews,
                    });
                  }}
                  onDoubleClick={() => {
                    if (!track.empty) dispatch(setCurrentTrack(track));
                  }}
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
              {track.id === state.activeTrack ? (
                <>
                  {idx > 0 ? (
                    <button
                      className={styles.MoveLeft}
                      onClick={() => dispatch(moveTrackLeft({ id: track.id }))}
                    >
                      <span>Move Left</span>
                      <FiChevronLeft />
                    </button>
                  ) : null}

                  {idx < tracks.length - 1 ? (
                    <button
                      className={styles.MoveRight}
                      onClick={() => dispatch(moveTrackRight({ id: track.id }))}
                    >
                      <span>Move Right</span>
                      <FiChevronRight />
                    </button>
                  ) : null}

                  <button
                    className={styles.Remove}
                    onClick={() => dispatch(removeTrack({ id: track.id }))}
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
                  >
                    <span>Save</span>
                    <FiDownload />
                  </button>

                  {/* Show Button only when we have data to load */}
                  {track.empty ? null : (
                    <button
                      className={styles.Load}
                      onClick={() => dispatch(setCurrentTrack(track))}
                    >
                      <span>Load</span>
                      <FiUpload />
                    </button>
                  )}
                </>
              ) : null}
            </li>
          ))}
        </ul>
        <button
          className={styles.AddTrack}
          onClick={() => dispatch(addTrack())}
        >
          <FiPlusCircle />
          <span>Add Track</span>
        </button>
      </div>

      <div>
        {state.previews.map((preview) => (
          <Preview
            key={preview.id}
            onShown={() => onPreviewShown(preview.id)}
            {...preview}
          />
        ))}
      </div>
    </div>
  );
};

export default SequenceEditor;
