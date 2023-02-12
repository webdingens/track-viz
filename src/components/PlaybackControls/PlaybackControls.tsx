import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiPlay, FiSquare, FiRepeat } from "react-icons/fi";
import Player from "./Player";
import {
  selectIsPlaying,
  setIsPlaying,
} from "../../app/reducers/animatingTrackSlice";

import styles from "./PlaybackControls.module.scss";
import { Sequence } from "../../types/LibraryData";

type PlaybackControlsProps = {
  sequence: Sequence;
};

const PlaybackControls = ({ sequence }: PlaybackControlsProps) => {
  const isPlaying = useSelector(selectIsPlaying);
  const dispatch = useDispatch();
  const onClick = () => dispatch(setIsPlaying(!isPlaying));

  return (
    <div className={styles.PlaybackControls}>
      <button onClick={onClick}>{isPlaying ? <FiSquare /> : <FiPlay />}</button>
      <button>
        <FiRepeat />
      </button>

      <Player sequence={sequence} />
    </div>
  );
};

export default PlaybackControls;
