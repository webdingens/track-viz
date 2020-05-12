import React from 'react';
import { connect } from 'react-redux';

import TrackMarkings from './TrackMarkings';
import TrackPackMarkings from './TrackPackMarkings';
import TrackSkaters from './TrackSkaters';

import {
  selectTrackOrientation,
  selectTrackShowRefLane,
  TRACK_ORIENTATIONS
} from '../../app/reducers/settingsTrackSlice';

import styles from './TrackGeometry.module.scss';

const REF_LANE_WIDTH = 3.05;

const getViewBox = (orientation = 0, showRefLane = true) => {
  let ded = showRefLane ? 0 : REF_LANE_WIDTH;

  if (orientation === TRACK_ORIENTATIONS.ORIENTATION_0_DEG || orientation === TRACK_ORIENTATIONS.ORIENTATION_180_DEG) {
    return `${-17 + ded},${-12 + ded} ${34 - 2*ded},${24 - 2*ded}`;
  } else {
    return `${-12 + ded},${-17 + ded} ${24 - 2*ded},${34 - 2*ded}`;
  }
}

const TrackGeometry = (props) => {
  return (
    <svg ref={props.trackContainerRef} className={styles.svg} viewBox={getViewBox(props.orientation, props.showRefLane)} preserveAspectRatio="xMidYMid meet">
      <g transform={`rotate(${props.orientation})`}>
        <TrackPackMarkings skaters={props.skaters} />
  
        <TrackMarkings showRefLane={props.showRefLane} />
  
        <TrackSkaters {...props} />
      </g>
    </svg>
  )
}

const mapStateToProps = (state) => {
  return {
    orientation: selectTrackOrientation(state),
    showRefLane: selectTrackShowRefLane(state),
  }
}

export default connect(mapStateToProps)(TrackGeometry);