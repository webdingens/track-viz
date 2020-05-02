import React from 'react';

import TrackMarkings from './TrackMarkings';
import TrackPackMarkings from './TrackPackMarkings';
import TrackSkaters from './TrackSkaters';

import styles from './Track.module.scss';

const Track = (props) => (
  <svg ref={props.trackContainerRef} className={styles.svg} viewBox="-17,-12 34,24" preserveAspectRatio="xMidYMid meet">

    <TrackPackMarkings skaters={props.skaters} />

    <TrackMarkings />

    <TrackSkaters {...props} />

  </svg>
)

export default Track;