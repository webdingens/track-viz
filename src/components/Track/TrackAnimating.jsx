import { useSelector } from "react-redux";

import TrackGeometry from "./TrackGeometry";

import { selectAnimatingTrack } from "../../app/reducers/animatingTrackSlice";

function TrackAnimating() {
  const animatingTrack = useSelector(selectAnimatingTrack);
  if (!animatingTrack) return null;
  return (
    <TrackGeometry skaters={animatingTrack.skaters} interactive isAnimating />
  );
}

export default TrackAnimating;
