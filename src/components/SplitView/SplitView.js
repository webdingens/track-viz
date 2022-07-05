import React, { useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";

import Track from "../Track/Track";
import Track3D from "../Track3D/Track3D";
import SequenceEditor from "../SequenceEditor/SequenceEditor";
import PlaybackControls from "../PlaybackControls/PlaybackControls";

import {
  selectGeneralSettings,
  setSequenceEditorVisibility,
} from "../../app/reducers/settingsGeneralSlice";

import { FiChevronsDown, FiChevronsUp } from "react-icons/fi";

import styles from "./SplitView.module.scss";

const SplitView = () => {
  const settings = useSelector(selectGeneralSettings) || {};
  const dispatch = useDispatch();

  const columns = useMemo(() => {
    let columns = 0;
    if (settings.trackEditorVisible) columns++;
    if (settings.track3DVisible) columns++;
    return columns;
  }, [settings.trackEditorVisible, settings.track3DVisible]);

  return (
    <div
      className={classNames({
        [styles.splitView]: true,
        [styles[`splitView--${columns}`]]: true,
        [styles["splitView--sequence-editor-visible"]]:
          settings.sequenceEditorVisible,
      })}
    >
      <div className={styles.viewColumns}>
        {settings.trackEditorVisible ? (
          <div className={styles.column}>
            <Track />
          </div>
        ) : null}

        {settings.track3DVisible ? (
          <div className={styles.column}>
            <Track3D />
          </div>
        ) : null}
      </div>

      <div className={styles.LowerSection}>
        <button
          className={styles.SequenceEditorToggleButton}
          onClick={() =>
            dispatch(
              setSequenceEditorVisibility(!settings.sequenceEditorVisible)
            )
          }
        >
          {settings.sequenceEditorVisible ? (
            <FiChevronsDown />
          ) : (
            <FiChevronsUp />
          )}
          <span>
            {settings.sequenceEditorVisible ? "Close" : "Open"} Sequence Editor
          </span>
          {settings.sequenceEditorVisible ? (
            <FiChevronsDown />
          ) : (
            <FiChevronsUp />
          )}
        </button>
        {settings.sequenceEditorVisible ? (
          <div className={styles.SequenceEditorWrapper}>
            <PlaybackControls />
            <SequenceEditor />
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default SplitView;
