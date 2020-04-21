import React from 'react';

import TrackMarkings from './TrackMarkings';
import Skater from '../Skater/Skater';

import styles from './Track.module.scss';

class Track extends React.Component {
  renderSkaters() {
    let skaters = [];
    let idxA = 0;
    let idxB = 0;
    this.props.skaters.forEach((el, i) => {
      let labelIdx;
      if (el.team === 'A') labelIdx = ++idxA;
      else labelIdx = ++idxB;
      skaters.push(<Skater
        key={i}
        idx={i}
        label={!(el.isJammer || el.isPivot) ? labelIdx : ''}
        {...el}
      />)
    });

    return skaters;
  }

  render() {
    return (
      <svg ref={this.props.trackContainerRef} className={styles.svg} viewBox="-17,-12 34,24" preserveAspectRatio="xMidYMid meet">
        <TrackMarkings />

        {/* Skaters */}
        {this.renderSkaters()}
      </svg>
    );
  } 
}

export default Track;