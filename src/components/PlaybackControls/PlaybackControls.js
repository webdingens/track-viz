import React from "react";
import { useSelector, useDispatch } from "react-redux";

import { FiPlay, FiSquare, FiRepeat } from "react-icons/fi";

import Player from "./Player";

import {
  selectIsPlaying,
  setIsPlaying,
} from "../../app/reducers/currentSequenceSlice";

import styles from "./PlaybackControls.module.scss";

const PlaybackControls = () => {
  const isPlaying = useSelector(selectIsPlaying);
  const dispatch = useDispatch();
  const onClick = () => dispatch(setIsPlaying(!isPlaying));

  return (
    <div className={styles.PlaybackControls}>
      <button onClick={onClick}>{isPlaying ? <FiSquare /> : <FiPlay />}</button>
      <button>
        <FiRepeat />
      </button>

      <Player />
    </div>
  );
};

export default PlaybackControls;
