import React from "react";
import { useSelector } from "react-redux";

import TrackGeometry from "./TrackGeometry";

import { selectAnimatingTrack } from "../../app/reducers/animatingTrackSlice";

function TrackAnimating() {
  const animatingTrack = useSelector(selectAnimatingTrack);
  return <TrackGeometry skaters={animatingTrack.skaters} updatePack={true} />;
}

export default TrackAnimating;
