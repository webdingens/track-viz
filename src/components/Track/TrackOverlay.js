import React from 'react';

import { connect } from 'react-redux';
import { reset as resetTrack } from '../../app/reducers/currentTrackSlice';

import TrackDragging from './TrackDragging';

import styles from './TrackOverlay.module.scss';

class TrackOverlay extends React.PureComponent {

  render() {
    return (
      <div className={styles.trackOverlay}>
        <TrackDragging />

        <button className={styles.resetButton} onClick={this.props.resetTrack}>Reset</button>
      </div>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    resetTrack: () => {
      dispatch(resetTrack())
    }
  }
}


export default connect(null, mapDispatchToProps)(TrackOverlay);