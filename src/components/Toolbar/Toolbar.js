import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";

import ImportField from "../ImportField/ImportField";
import ExportButton from "../ExportButton/ExportButton";

import {
  setTrackEditorVisibility,
  setTrack3DVisibility,
  selectGeneralSettings,
  setSetting,
} from "../../app/reducers/settingsGeneralSlice";

import {
  CONTROL_MODES,
  setControlMode,
  selectTrack3DControlMode,
} from "../../app/reducers/settingsTrack3DSlice";

import styles from "./Toolbar.module.scss";

const Toolbar = () => {
  const [state, setState] = useState({
    open: false,
    openedOnce: false,
  });

  const settings = useSelector(selectGeneralSettings);
  const controlMode = useSelector(selectTrack3DControlMode);
  const dispatch = useDispatch();

  return (
    <div
      className={classNames({
        [styles.toolbar]: true,
        [styles.toolbarOpen]: state.open,
        [styles.toolbarClosed]: state.openedOnce && !state.open,
      })}
    >
      <ul>
        <li>
          <span className={styles.headline}>Editor Layout</span>
          <ul>
            <li>
              <button
                className={classNames({
                  [styles.button]: true,
                  [styles["button--active"]]:
                    settings.trackEditorVisible && !settings.track3DVisible,
                })}
                onClick={() => {
                  dispatch(setTrackEditorVisibility(true));
                  dispatch(setTrack3DVisibility(false));
                }}
              >
                Track Editor
              </button>
            </li>
            <li>
              <button
                className={classNames({
                  [styles.button]: true,
                  [styles["button--active"]]:
                    settings.track3DVisible && !settings.trackEditorVisible,
                })}
                onClick={() => {
                  dispatch(setTrackEditorVisibility(false));
                  dispatch(setTrack3DVisibility(true));
                }}
              >
                3D View
              </button>
            </li>
            <li>
              <button
                className={classNames({
                  [styles.button]: true,
                  [styles["button--active"]]:
                    settings.trackEditorVisible && settings.track3DVisible,
                })}
                onClick={() => {
                  dispatch(setTrackEditorVisibility(true));
                  dispatch(setTrack3DVisibility(true));
                }}
              >
                Split View
              </button>
            </li>
            <li>
              <button
                className={styles.button}
                onClick={() => {
                  dispatch(
                    setSetting({
                      key: "settingsVisible",
                      value: true,
                    })
                  );
                  setState({ open: false });
                }}
              >
                Settings
              </button>
            </li>
          </ul>
        </li>

        {settings.track3DVisible ? (
          <li>
            <span className={styles.headline}>Track3D Controls</span>
            <ul>
              {Object.keys(CONTROL_MODES).map((mode, idx) => (
                <li key={idx}>
                  <button
                    className={classNames({
                      [styles.button]: true,
                      [styles["button--active"]]:
                        controlMode === CONTROL_MODES[mode],
                    })}
                    onClick={() =>
                      dispatch(setControlMode(CONTROL_MODES[mode]))
                    }
                  >
                    {CONTROL_MODES[mode]}
                  </button>
                </li>
              ))}
            </ul>
          </li>
        ) : null}

        <li>
          <span className={styles.headline}>Import / Export</span>
          <ul>
            <li>
              <ImportField />
            </li>
            <li>
              <ExportButton />
            </li>
          </ul>
        </li>
      </ul>

      <button
        className={styles.toggleButton}
        onClick={() => {
          setState({
            open: !state.open,
            openedOnce: true,
          });
        }}
      >
        <span></span>
        <span></span>
        <span></span>
        <span className={styles.buttonLabel}>
          {state.open ? "Close Menu" : "Open Menu"}
        </span>
      </button>
    </div>
  );
};

export default Toolbar;
