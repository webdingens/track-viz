import React, { useState } from "react";
import { connect } from "react-redux";
import classNames from "classnames";
import { FiSquare, FiXSquare, FiSettings } from "react-icons/fi";

import Track3DMapControlButtons from "./Track3DMapControlButtons";

import {
  setGraphicsQuality,
  setUseModelType,
  setShowWalls,
  setUseTextures,
  selectTrack3DGraphicsQuality,
  selectTrack3DUseModelType,
  selectTrack3DShowWalls,
  selectTrack3DUseTextures,
  selectTrack3DControlMode,
  CONTROL_MODES,
  MODEL_TYPES,
} from "../../app/reducers/settingsTrack3DSlice";

import styles from "./Track3DOverlay.module.scss";
import { selectTouchEnabledDevice } from "../../app/reducers/currentTransientsSlice";

const Track3DOverlay = (props) => {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={classNames({
        [styles.overlay]: true,
        [styles["overlay--open"]]: open,
      })}
    >
      <button className={styles.toggleButton} onClick={() => setOpen(!open)}>
        <FiSettings />
        <span>Track 3D Settings</span>
      </button>

      <ul className={styles.controls}>
        <li>
          <button
            className={styles.menuButton}
            onClick={() => props.setShowWalls(!props.showWalls)}
          >
            {props.showWalls ? <FiXSquare /> : <FiSquare />} <span>Walls</span>
          </button>
        </li>
        <li>
          <button
            className={styles.menuButton}
            onClick={() => props.setUseTextures(!props.useTextures)}
          >
            {props.useTextures ? <FiXSquare /> : <FiSquare />}{" "}
            <span>Textures</span>
          </button>
        </li>
        <li>
          <p className={styles.menuSelectTitle}>Skater Model</p>
          <select
            className={styles.menuSelect}
            onChange={(evt) => props.setUseModelType(evt.currentTarget.value)}
            value={props.useModelType}
          >
            {Object.keys(MODEL_TYPES).map((key, idx) => (
              <option key={idx} value={MODEL_TYPES[key]}>
                {key}
              </option>
            ))}
          </select>
        </li>
        <li>
          <label>
            <span className={styles.rangeSliderLabel}>
              Graphics Quality {(props.graphicsQuality * 10000) / 100}%
            </span>
            <input
              className={styles.rangeSlider}
              type="range"
              value={props.graphicsQuality}
              step=".05"
              min=".3"
              max="1"
              onChange={(evt) =>
                props.setGraphicsQuality((+evt.target.value).toFixed(2))
              }
            />
          </label>
        </li>
      </ul>

      {props.touchEnabledDevice && props.controlMode === CONTROL_MODES.MAP ? (
        <Track3DMapControlButtons />
      ) : null}
    </div>
  );
};

const mapStateToProps = (state) => {
  return {
    graphicsQuality: selectTrack3DGraphicsQuality(state),
    useModelType: selectTrack3DUseModelType(state),
    showWalls: selectTrack3DShowWalls(state),
    useTextures: selectTrack3DUseTextures(state),
    touchEnabledDevice: selectTouchEnabledDevice(state),
    controlMode: selectTrack3DControlMode(state),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    setGraphicsQuality: (val) => dispatch(setGraphicsQuality(val)),
    setUseModelType: (val) => dispatch(setUseModelType(val)),
    setShowWalls: (val) => dispatch(setShowWalls(val)),
    setUseTextures: (val) => dispatch(setUseTextures(val)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Track3DOverlay);
