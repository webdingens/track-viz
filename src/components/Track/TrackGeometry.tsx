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
  selectTrackView,
  TRACK_ORIENTATIONS,
  TRACK_VIEWS,
} from "../../app/reducers/settingsTrackSlice";

import styles from "./TrackGeometry.module.scss";
import { SkaterType } from "../../types/LibraryData";
import TrackDragging from "./TrackDragging";

type TrackGeometryProps = {
  skaters: SkaterType[];
  interactive: boolean;
  isAnimating?: boolean;
} & HTMLAttributes<SVGElement>;

const REF_LANE_WIDTH = 3.05;

const getViewBox = (orientation = 0, view: keyof typeof TRACK_VIEWS) => {
  if (view === TRACK_VIEWS.FULL || view === TRACK_VIEWS.TRACK) {
    const showRefLane = view === TRACK_VIEWS.FULL;
    let ded = showRefLane ? 0 : REF_LANE_WIDTH;

    if (
      orientation === TRACK_ORIENTATIONS.ORIENTATION_0_DEG ||
      orientation === TRACK_ORIENTATIONS.ORIENTATION_180_DEG
    ) {
      return `${-17 + ded},${-12 + ded} ${34 - 2 * ded},${24 - 2 * ded}`;
    } else {
      return `${-12 + ded},${-17 + ded} ${24 - 2 * ded},${34 - 2 * ded}`;
    }
  }
  if (view === TRACK_VIEWS.START) {
    let ded = 0;
    switch (orientation) {
      case TRACK_ORIENTATIONS.ORIENTATION_0_DEG:
        return `-5.2,2 12,8`;
      case TRACK_ORIENTATIONS.ORIENTATION_90_DEG:
        return `-10,-5 8,12`;
      case TRACK_ORIENTATIONS.ORIENTATION_180_DEG:
        return `-6.8,-10 12,8`;
      case TRACK_ORIENTATIONS.ORIENTATION_270_DEG:
        return `2,-6.8 8,12`;
    }
  }
  return "-17,-12 34,24";
};

function TrackGeometry(props: TrackGeometryProps) {
  const { className, skaters, interactive, isAnimating, style } = props;
  const orientation = useSelector(selectTrackOrientation);
  const view = useSelector(selectTrackView);
  const viewBox = getViewBox(orientation, view);
  const [xy, wh] = viewBox.split(" ");
  const [x, y] = xy.split(",");
  const [w, h] = wh.split(",");

  // don't redraw Track Markings on skater changes
  const TrackMarkingsMemoized = useMemo(
    () => <TrackMarkings view={view} orientation={orientation} />,
    [orientation, view]
  );

  return (
    <svg
      className={classNames(styles.svg, className ?? "")}
      viewBox={viewBox}
      preserveAspectRatio="xMidYMid meet"
      style={style}
    >
      {view === TRACK_VIEWS.FULL && (
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
      )}

      <g transform={`rotate(${orientation})`}>
        <TrackPackMarkings skaters={skaters} />

        {TrackMarkingsMemoized}

        <Track3DCamera />

        {/* display non interactive skaters */}
        {!interactive ? (
          <TrackSkaters skaters={skaters} />
        ) : (
          <TrackDragging skaters={skaters} isAnimating={isAnimating} />
        )}
      </g>
    </svg>
  );
}

export default TrackGeometry;
