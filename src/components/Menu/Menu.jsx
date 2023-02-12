import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import classNames from "classnames";

import ImportField from "../ImportField/ImportField";
import ExportButton from "../ExportButton/ExportButton";

import {
  setLayoutMode,
  selectGeneralSettings,
  selectLayoutMode,
  LAYOUT_MODES,
  setSetting,
} from "../../app/reducers/settingsGeneralSlice";

import {
  CONTROL_MODES,
  setControlMode,
  selectTrack3DControlMode,
} from "../../app/reducers/settingsTrack3DSlice";

import {
  reset as resetLibrary,
  selectLibrary,
} from "../../app/reducers/currentLibrarySlice";

import styles from "./Menu.module.scss";
import buttonStyles from "../../styles/Buttons.module.scss";
import Breadcrumb from "../Breadcrumb/Breadcrumb";
import { FiMenu, FiX } from "react-icons/fi";
import ImportLibraryField from "../ImportField/ImportLibraryField";

const Menu = () => {
  const [state, setState] = useState({
    open: false,
    openedOnce: false, // prevent spinning on load
  });

  const settings = useSelector(selectGeneralSettings);
  const controlMode = useSelector(selectTrack3DControlMode);
  const layoutMode = useSelector(selectLayoutMode);
  const library = useSelector(selectLibrary);
  const dispatch = useDispatch();

  return (
    <div
      className={classNames({
        [styles.menu]: true,
        [styles.menuOpen]: state.open,
        [styles.menuClosed]: state.openedOnce && !state.open,
      })}
    >
      <div className={styles.controls}>
        <button
          className={buttonStyles.menuButton}
          onClick={() => {
            setState({
              open: !state.open,
              openedOnce: true,
            });
          }}
          type="button"
          style={{ float: "left" }}
          title={state.open ? "Close Menu" : "Menu"}
        >
          {state.open ? <FiX /> : <FiMenu />}
        </button>
        <Breadcrumb />
      </div>

      <ul className={styles.menuList}>
        <li>
          <span className={styles.headline}>Editor Layout</span>
          <ul>
            <li>
              <button
                className={classNames({
                  [styles.button]: true,
                  [styles["button--active"]]:
                    layoutMode === LAYOUT_MODES.LAYOUT_TRACK,
                })}
                onClick={() => {
                  dispatch(setLayoutMode(LAYOUT_MODES.LAYOUT_TRACK));
                }}
              >
                Track
              </button>
            </li>
            <li>
              <button
                className={classNames({
                  [styles.button]: true,
                  [styles["button--active"]]:
                    layoutMode === LAYOUT_MODES.LAYOUT_3D,
                })}
                onClick={() => {
                  dispatch(setLayoutMode(LAYOUT_MODES.LAYOUT_3D));
                }}
              >
                3D
              </button>
            </li>
            <li>
              <button
                className={classNames({
                  [styles.button]: true,
                  [styles["button--active"]]:
                    layoutMode === LAYOUT_MODES.LAYOUT_TRACK_3D,
                })}
                onClick={() => {
                  dispatch(setLayoutMode(LAYOUT_MODES.LAYOUT_TRACK_3D));
                }}
              >
                Track | 3D
              </button>
            </li>
            <li>
              <button
                className={classNames({
                  [styles.button]: true,
                  [styles["button--active"]]:
                    layoutMode === LAYOUT_MODES.LAYOUT_TRACK_LIBRARY,
                })}
                onClick={() => {
                  dispatch(setLayoutMode(LAYOUT_MODES.LAYOUT_TRACK_LIBRARY));
                }}
              >
                Track | Library Editor
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
              <ImportField buttonClassName={styles.button} />
            </li>
            <li>
              <ExportButton buttonClassName={styles.button} />
            </li>
          </ul>
        </li>

        <li>
          <span className={styles.headline}>Library</span>
          <ul>
            <li>
              <ImportLibraryField
                onLoad={() => {
                  setState({ open: false });
                }}
                buttonClassName={styles.button}
              >
                Load Library
              </ImportLibraryField>
            </li>
            {library.sequences.length > 0 && (
              <li>
                <button
                  type="button"
                  onClick={() => {
                    dispatch(resetLibrary());
                    setState({ open: false });
                  }}
                  className={styles.button}
                >
                  Close Library
                </button>
              </li>
            )}
          </ul>
        </li>
      </ul>
    </div>
  );
};

export default Menu;
