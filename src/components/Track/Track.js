import React from 'react';

import TrackDragging from '../Track/TrackDragging';
import TrackOverlay from '../Track/TrackOverlay';

import styles from './Track.module.scss';

class Track extends React.PureComponent {

  render() {
    return (
      <div className={styles.track}>
        <TrackDragging />

        <TrackOverlay />
      </div>
    )
  }
}


export default Track;