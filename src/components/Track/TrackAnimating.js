import React from 'react';
import { connect } from 'react-redux';

import TrackGeometry from './TrackGeometry';

import {
  selectAnimatingTrack,
} from '../../app/reducers/animatingTrackSlice';

const TrackAnimating = (props) => (
  <TrackGeometry skaters={props.animatingTrack.skaters} updatePack={true} />
)

const mapStateToProps = (state) => {
  return {
    animatingTrack: selectAnimatingTrack(state),
  }
}

export default connect(mapStateToProps)(TrackAnimating);