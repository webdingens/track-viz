import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { FiPlay, FiSquare, FiRepeat } from "react-icons/fi";
import Player from "./Player";
import {
  selectIsPlaying,
  setIsPlaying,
} from "../../app/reducers/animatingTrackSlice";

import { Sequence } from "../../types/LibraryData";

import buttonStyles from "../../styles/Buttons.module.scss";
import classNames from "classnames";

type PlaybackControlsProps = {
  sequence: Sequence;
};

const PlaybackControls = ({ sequence }: PlaybackControlsProps) => {
  const isPlaying = useSelector(selectIsPlaying);
  const dispatch = useDispatch();
  const onClick = () => dispatch(setIsPlaying(!isPlaying));

  return (
    <>
      <button
        onClick={onClick}
        className={classNames(buttonStyles.menuButton, {
          [buttonStyles.menuButtonActive]: isPlaying,
        })}
        title={isPlaying ? "Stop sequence" : "Play sequence"}
      >
        {isPlaying ? <FiSquare /> : <FiPlay />}
      </button>
      <Player sequence={sequence} />
    </>
  );
};

export default PlaybackControls;
