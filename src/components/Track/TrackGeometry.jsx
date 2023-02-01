import { connect } from "react-redux";
import classNames from "classnames";

import TrackMarkings from "./TrackMarkings";
import TrackPackMarkings from "./TrackPackMarkings";
import TrackSkaters from "./TrackSkaters";
import Track3DCamera from "./Track3DCamera";

import {
  selectTrackOrientation,
  selectTrackShowRefLane,
  TRACK_ORIENTATIONS,
} from "../../app/reducers/settingsTrackSlice";

import styles from "./TrackGeometry.module.scss";

const REF_LANE_WIDTH = 3.05;

const getViewBox = (orientation = 0, showRefLane = true) => {
  let ded = showRefLane ? 0 : REF_LANE_WIDTH;

  if (
    orientation === TRACK_ORIENTATIONS.ORIENTATION_0_DEG ||
    orientation === TRACK_ORIENTATIONS.ORIENTATION_180_DEG
  ) {
    return `${-17 + ded},${-12 + ded} ${34 - 2 * ded},${24 - 2 * ded}`;
  } else {
    return `${-12 + ded},${-17 + ded} ${24 - 2 * ded},${34 - 2 * ded}`;
  }
};

function TrackGeometry(props) {
  const {
    trackContainerRef,
    className,
    orientation,
    showRefLane,
    updatePack,
    skaters,
    isPreview,
    style,
  } = props;
  return (
    <svg
      ref={trackContainerRef}
      className={classNames(styles.svg, className ?? "")}
      viewBox={getViewBox(orientation, showRefLane)}
      preserveAspectRatio="xMidYMid meet"
      style={style}
    >
      <g transform={`rotate(${orientation})`}>
        <TrackPackMarkings useSkaters={updatePack ? skaters : false} />

        <TrackMarkings showRefLane={isPreview ? false : showRefLane} />

        <Track3DCamera />

        <TrackSkaters {...props} />
      </g>
    </svg>
  );
}

const mapStateToProps = (state) => {
  return {
    orientation: selectTrackOrientation(state),
    showRefLane: selectTrackShowRefLane(state),
  };
};

export default connect(mapStateToProps)(TrackGeometry);
