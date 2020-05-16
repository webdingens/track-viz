import React from 'react';
import { connect } from 'react-redux';

import TrackDragging from '../Track/TrackDragging';
import TrackOverlay from '../Track/TrackOverlay';

import styles from './Track.module.scss';
import TrackAnimating from './TrackAnimating';
import { selectIsPlaying } from '../../app/reducers/currentSequenceSlice';

class Track extends React.PureComponent {

  render() {
    return (
      <div className={styles.track}>
        {this.props.isPlaying ?
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
    isPlaying: selectIsPlaying(state),
  }
}

export default connect(mapStateToProps)(Track);