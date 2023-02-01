import { useCallback, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import _ from "lodash";

import Preview from "./Preview";

import { FiPlusCircle } from "react-icons/fi";

import {
  addTrack,
  selectCurrentTracks,
} from "../../app/reducers/currentSequenceSlice";

import { setCurrentTrack } from "../../app/reducers/currentTrackSlice";

import styles from "./SequenceEditor.module.scss";
import TrackStill from "./TrackStill";

let previewId = 0;

const SequenceEditor = () => {
  const [state, setState] = useState({
    activeTrack: null,
    previews: [],
  });

  /* Redux */
  const dispatch = useDispatch();
  const tracks = useSelector(selectCurrentTracks);

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
            <li key={track.id}>
              <TrackStill
                active={track.id === state.activeTrack}
                track={track}
                listPosition={{
                  position: idx,
                  first: idx === 0,
                  last: idx === tracks.length - 1,
                }}
                onClickTrack={(evt) => {
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
                onDoubleClickTrack={() => {
                  if (!track.empty) dispatch(setCurrentTrack(track));
                }}
              />
            </li>
          ))}
        </ul>
        <button
          className={styles.AddTrack}
          onClick={() => dispatch(addTrack())}
          title="Add Track"
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
