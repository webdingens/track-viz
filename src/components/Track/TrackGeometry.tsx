import {
  ForwardedRef,
  forwardRef,
  HTMLAttributes,
  useMemo,
  useRef,
} from "react";
import { useSelector } from "react-redux";
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
import { SkaterType } from "../../types/LibraryData";
import TrackDragging from "./TrackDragging";

type TrackGeometryProps = {
  updatePack: boolean;
  skaters: SkaterType[];
  isPreview: boolean;
} & HTMLAttributes<SVGElement>;

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

function TrackGeometry(props: TrackGeometryProps) {
  const { className, updatePack, skaters, isPreview, style } = props;
  const orientation = useSelector(selectTrackOrientation);
  const showRefLane = useSelector(selectTrackShowRefLane);
  const viewBox = getViewBox(orientation, showRefLane);
  const [xy, wh] = viewBox.split(" ");
  const [x, y] = xy.split(",");
  const [w, h] = wh.split(",");

  // don't redraw Track Markings on skater changes
  const TrackMarkingsMemo = useMemo(
    () => <TrackMarkings showRefLane={isPreview ? false : showRefLane} />,
    [isPreview, showRefLane]
  );

  return (
    <svg
      className={classNames(styles.svg, className ?? "")}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={style}
    >
      <rect
        className="js-boundary"
        width={w}
        height={h}
        x={x}
        y={y}
        stroke="#ccc"
        fill="none"
        strokeWidth=".05"
      />
      <g transform={`rotate(${orientation})`}>
        <TrackPackMarkings useSkaters={updatePack ? skaters : false} />

        {TrackMarkingsMemo}

        <Track3DCamera />

        {isPreview ? <TrackSkaters {...props} /> : <TrackDragging {...props} />}
      </g>
    </svg>
  );
}

export default TrackGeometry;
