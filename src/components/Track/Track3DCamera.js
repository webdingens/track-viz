import React from "react";
import { useSelector } from "react-redux";

import { selectTrack3DCamera } from "../../app/reducers/settingsTrack3DSlice";

import { FiArrowRightCircle } from "react-icons/fi";

const Track3DCamera = (props) => {
  const camera = useSelector(selectTrack3DCamera);
  const transform = `translate(${camera.position[0]}, ${
    camera.position[2]
  }) rotate(${(-camera.rotation[2] * 180) / Math.PI - 90})`;
  return (
    <g transform={transform}>
      <FiArrowRightCircle size={0.6} />
    </g>
  );
};

Track3DCamera.displayName = "Track3DCamera";
export default Track3DCamera;
