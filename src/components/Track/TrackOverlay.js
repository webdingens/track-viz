import React from 'react';
import { connect } from 'react-redux';
import {
  FiRotateCw,
  FiRotateCcw,
  FiSquare,
  FiXSquare,
} from "react-icons/fi";

import { reset as resetTrack } from '../../app/reducers/currentTrackSlice';
import {
  setOrientation,
  setShowRefLane,
  selectTrackOrientation,
  selectTrackShowRefLane,
} from '../../app/reducers/settingsTrackSlice';

import styles from './TrackOverlay.module.scss';

class TrackOverlay extends React.PureComponent {

  render() {
    return (
      <div className={styles.trackOverlay}>
        <ul className={styles.trackMenu}>
          <li>
            <div className={styles.orientationSetter}>
              <button
                className={styles.menuButtonLeft}
                onClick={() => {
                  this.props.setOrientation((this.props.orientation - 90 + 360) % 360)
                }}
              ><FiRotateCcw /></button>
              <span>{this.props.orientation}°</span>
              <button
                className={styles.menuButtonRight}
                onClick={() => {
                  this.props.setOrientation((this.props.orientation + 90) % 360)
                }}
              ><FiRotateCw/></button>
            </div>
          </li>
          <li>
            <button
              className={styles.menuButton}
              onClick={() => this.props.setShowRefLane(!this.props.showRefLane)}
            >
              {this.props.showRefLane ? <FiXSquare /> : <FiSquare />} <span>Ref Lane</span>
            </button>
          </li>
          <li>
            <button className={styles.menuButton} onClick={this.props.resetTrack}>Reset Positions</button>
          </li>
        </ul>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    orientation: selectTrackOrientation(state),
    showRefLane: selectTrackShowRefLane(state),
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    resetTrack: () => dispatch(resetTrack()),
    setOrientation: (val) => dispatch(setOrientation(val)),
    setShowRefLane: (val) => dispatch(setShowRefLane(val))
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(TrackOverlay);