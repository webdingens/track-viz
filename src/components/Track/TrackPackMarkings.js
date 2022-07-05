import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import SVGTextures from "react-svg-textures";

import { selectCurrentSkatersWDPPivotLineDistance } from "../../app/reducers/currentTrackSlice";

import {
  getSortedPackBoundaries,
  getPack,
  getSortedOutermostSkaters,
  PACK_MEASURING_METHODS,
} from "../../utils/packFunctions";

import {
  computePartialTrackShape,
  ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
} from "../../utils/packFunctions";

import styles from "./TrackPackMarkings.module.scss";

const { Paths } = SVGTextures;

const PartialTrackShapeSector = ({ bounds, ...props }) => {
  return (
    <g {...props}>
      <path
        d={computePartialTrackShape({
          p1: bounds[0],
          p2: bounds[1],
          trackIs2D: true,
        })}
      />
    </g>
  );
};

const PartialTrackShapeRectangle = ({ bounds, ...props }) => {
  return (
    <g {...props}>
      <g className={styles.packRectangle}>
        <Paths
          id="rectangle-pack-pattern"
          d="woven"
          strokeWidth={0.1}
          stroke="#333467"
          size={0.5}
          orientation="diagonal"
        />
        <path
          d={computePartialTrackShape({
            p1: bounds[0],
            p2: bounds[1],
            trackIs2D: true,
            method: PACK_MEASURING_METHODS.RECTANGLE,
          })}
        />
      </g>
    </g>
  );
};

const TrackPackMarkings = ({ useSkaters, storeSkaters }) => {
  const skaters = useSkaters ? useSkaters : storeSkaters;
  const pack = getPack(skaters);
  const packBounds = getSortedPackBoundaries(pack);

  let engagementZoneBounds;
  let outermostSkatersOfPackRectangle;

  if (packBounds) {
    engagementZoneBounds = [
      packBounds[0] - ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
      packBounds[1] + ENGAGEMENT_ZONE_DISTANCE_TO_PACK,
    ];
  }
  if (pack) {
    outermostSkatersOfPackRectangle = getSortedOutermostSkaters(pack);
  }

  return (
    <>
      {packBounds ? (
        <PartialTrackShapeSector className={styles.pack} bounds={packBounds} />
      ) : null}

      {packBounds ? (
        <PartialTrackShapeSector
          className={styles.engagementZone}
          bounds={engagementZoneBounds}
        />
      ) : null}

      {outermostSkatersOfPackRectangle ? (
        <PartialTrackShapeRectangle bounds={outermostSkatersOfPackRectangle} />
      ) : null}
    </>
  );
};

TrackPackMarkings.propTypes = {
  sortedPackBoundaries: PropTypes.oneOfType([PropTypes.array, PropTypes.bool]),
  storeSkaters: PropTypes.array,
};

const mapStateToProps = (state) => {
  return {
    storeSkaters: selectCurrentSkatersWDPPivotLineDistance(state),
  };
};

export default connect(mapStateToProps)(TrackPackMarkings);
