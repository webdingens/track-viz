import React, { useMemo, Suspense } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";

import Track from "../Track/Track";
// import SequenceEditor from "../SequenceEditor/SequenceEditor";
// import PlaybackControls from "../PlaybackControls/PlaybackControls";

import {
  selectGeneralSettings,
  selectLayoutMode,
  setSequenceEditorVisibility,
  LAYOUT_MODES,
} from "../../app/reducers/settingsGeneralSlice";

import { FiChevronsDown, FiChevronsUp } from "react-icons/fi";

import styles from "./SplitView.module.scss";

const Library = React.lazy(() => import("../Library/Library"));
const Track3D = React.lazy(() => import("../Track3D/Track3D"));

const SplitView = () => {
  const settings = useSelector(selectGeneralSettings) || {};
  const dispatch = useDispatch();
  const layoutMode = useSelector(selectLayoutMode);

  const layout = useMemo(() => {
    let layout = 0;
    switch (layoutMode) {
      case LAYOUT_MODES.LAYOUT_TRACK_3D:
        layout = "split";
        break;
      case LAYOUT_MODES.LAYOUT_TRACK_LIBRARY:
        layout = "library";
        break;
      default:
        layout = "full";
    }
    return layout;
  }, [layoutMode]);

  return (
    <div
      className={classNames({
        [styles.splitView]: true,
        [styles[`splitView--${layout}`]]: true,
        [styles["splitView--sequence-editor-visible"]]:
          settings.sequenceEditorVisible,
      })}
    >
      <div className={styles.viewColumns}>
        {settings.trackEditorVisible && (
          <div className={styles.column}>
            <Track />
          </div>
        )}

        {settings.track3DVisible && (
          <div className={styles.column}>
            <Suspense fallback={<p>Loading</p>}>
              <Track3D />
            </Suspense>
          </div>
        )}

        {settings.libraryVisible && (
          <div className={classNames(styles.column, styles.columnLibrary)}>
            <div className={styles.scrollWrapper}>
              <Suspense fallback={<p>Loading</p>}>
                <Library />
              </Suspense>
            </div>
          </div>
        )}
      </div>

      {/* <div className={styles.LowerSection}>
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
      </div> */}
    </div>
  );
};

export default SplitView;
