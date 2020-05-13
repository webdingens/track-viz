import React from 'react';
import { connect } from 'react-redux';
import {
  FiSquare,
  FiXSquare,
} from "react-icons/fi";

import {
  selectTrack3DGraphicsQuality,
  selectTrack3DUse3DModels,
  setGraphicsQuality,
  setUse3DModels,
} from '../../app/reducers/settingsTrack3DSlice';

import styles from './Track3DOverlay.module.scss';

const Track3DOverlay = (props) => (
  <div className={styles.overlay}>
    <ul className={styles.controls}>
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
  </div>
)

const mapStateToProps = (state) => {
  return {
    graphicsQuality: selectTrack3DGraphicsQuality(state),
    use3DModels: selectTrack3DUse3DModels(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setGraphicsQuality: (val) => dispatch(setGraphicsQuality(val)),
    setUse3DModels: (val) => dispatch(setUse3DModels(val))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Track3DOverlay);