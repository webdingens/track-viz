import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { selectSortedPackBoundaries } from '../../app/reducers/currentTrackSlice';

import {
  computePartialTrackShape,
  ENGAGEMENT_ZONE_DISTANCE_TO_PACK
} from '../../utils/packFunctions';

import styles from './TrackPackMarkings.module.scss';


const PartialTrackShape = ({bounds, ...props}) => {
  return (
    <g {...props}>
      <path d={computePartialTrackShape({
        p1: bounds[0],
        p2: bounds[1],
        trackIs2D: true
      })} />
    </g>
  );
}

const TrackPackMarkings = ({sortedPackBoundaries}) => {
  let packBounds = sortedPackBoundaries;
  let engagementZoneBounds;

  if (packBounds) {
    engagementZoneBounds = [packBounds[0] - ENGAGEMENT_ZONE_DISTANCE_TO_PACK, packBounds[1] + ENGAGEMENT_ZONE_DISTANCE_TO_PACK];
  }

  return (
    <>
      {packBounds ? (
        <PartialTrackShape
          className={styles.pack}
          bounds={packBounds}
        />
      ) : null }

      {packBounds ? (
        <PartialTrackShape
          className={styles.engagementZone}
          bounds={engagementZoneBounds}
        />
      ) : null}
    </>
  )
}

TrackPackMarkings.propTypes = {
  sortedPackBoundaries: PropTypes.oneOfType([
    PropTypes.array,
    PropTypes.bool
  ])
}

const mapStateToProps = (state) => {
  return {
    sortedPackBoundaries: selectSortedPackBoundaries(state)
  }
}

export default connect(mapStateToProps)(TrackPackMarkings);