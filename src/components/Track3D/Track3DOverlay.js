import React from 'react';
import { connect } from 'react-redux';

import {
  selectTrack3DGraphicsQuality,
  setGraphicsQuality,
} from '../../app/reducers/settingsTrack3DSlice';

import styles from './Track3DOverlay.module.scss';

const Track3DOverlay = (props) => (
  <div className={styles.overlay}>
    <ul className={styles.controls}>
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
    graphicsQuality: selectTrack3DGraphicsQuality(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    setGraphicsQuality: (val) => dispatch(setGraphicsQuality(val))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Track3DOverlay);