import React from 'react';
import { connect } from 'react-redux';

import TrackDragging from '../Track/TrackDragging';
import TrackOverlay from '../Track/TrackOverlay';

import styles from './Track.module.scss';
import TrackAnimating from './TrackAnimating';
import {
  ANIMATION_STATE,
  selectAnimationState,
} from '../../app/reducers/currentSequenceSlice';

class Track extends React.PureComponent {

  render() {
    const trackIsAnimating = [ANIMATION_STATE.PLAYING, ANIMATION_STATE.PAUSED].indexOf(this.props.animationState) !== -1;

    return (
      <div className={styles.track}>
        {trackIsAnimating ?
          <TrackAnimating /> :
          <TrackDragging />
        }

        <TrackOverlay />
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    animationState: selectAnimationState(state),
  }
}

export default connect(mapStateToProps)(Track);