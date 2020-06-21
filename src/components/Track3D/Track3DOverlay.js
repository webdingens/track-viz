import React from 'react';
import { connect } from 'react-redux';
import {
  FiSquare,
  FiXSquare,
} from "react-icons/fi";

import Track3DMapControlButtons from './Track3DMapControlButtons';

import {
  selectTrack3DGraphicsQuality,
  selectTrack3DUse3DModels,
  setGraphicsQuality,
  setUse3DModels,
  selectTrack3DShowWalls,
  setShowWalls,
  setUseTextures,
  selectTrack3DUseTextures,
  CONTROL_MODES,
  selectTrack3DControlMode,
} from '../../app/reducers/settingsTrack3DSlice';

import styles from './Track3DOverlay.module.scss';
import { selectTouchEnabledDevice } from '../../app/reducers/currentTransientsSlice';

const Track3DOverlay = (props) => (
  <div className={styles.overlay}>
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
          {props.useTextures ? <FiXSquare /> : <FiSquare />} <span>Textures</span>
        </button>
      </li>
      <li>
        <button
          className={styles.menuButton}
          onClick={() => props.setUse3DModels(!props.use3DModels)}
        >
          {props.use3DModels ? <FiXSquare /> : <FiSquare />} <span>3D Models</span>
        </button>
      </li>
      <li>
        <label>
          <span>Graphics Quality {(props.graphicsQuality * 10000) / 100}%</span>
          <input
            className={styles.rangeSlider}
            type="range"
            value={props.graphicsQuality}
            step=".05"
            min=".3"
            max="1"
            onChange={(evt) => props.setGraphicsQuality((+evt.target.value).toFixed(2))}
          />
        </label>
      </li>
    </ul>

    {props.touchEnabledDevice && props.controlMode === CONTROL_MODES.MAP ? (
      <Track3DMapControlButtons />
    ) : null}
    
  </div>
)

const mapStateToProps = (state) => {
  return {
    graphicsQuality: selectTrack3DGraphicsQuality(state),
    use3DModels: selectTrack3DUse3DModels(state),
    showWalls: selectTrack3DShowWalls(state),
    useTextures: selectTrack3DUseTextures(state),
    touchEnabledDevice: selectTouchEnabledDevice(state),
    controlMode: selectTrack3DControlMode(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setGraphicsQuality: (val) => dispatch(setGraphicsQuality(val)),
    setUse3DModels: (val) => dispatch(setUse3DModels(val)),
    setShowWalls: (val) => dispatch(setShowWalls(val)),
    setUseTextures: (val) => dispatch(setUseTextures(val)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Track3DOverlay);