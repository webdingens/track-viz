import React from "react";
import { useSelector } from "react-redux";
import * as THREE from "three";

import { selectTrack3DCamera } from "../../app/reducers/settingsTrack3DSlice";

import { FiArrowRightCircle } from "react-icons/fi";
import {
  LAYOUT_MODES,
  selectLayoutMode,
} from "../../app/reducers/settingsGeneralSlice";

function Track3DCamera() {
  const layout = useSelector(selectLayoutMode);
  const camera = useSelector(selectTrack3DCamera);
  if (layout !== LAYOUT_MODES.LAYOUT_TRACK_3D) return null;
  let euler = new THREE.Euler().fromArray(camera.rotation);
  euler.reorder("YXZ");
  const transform = `translate(${camera.position[0]}, ${
    camera.position[2]
  }) rotate(${(-1 * euler.y * 180) / Math.PI - 90})`;
  return (
    <g transform={transform}>
      <FiArrowRightCircle size={0.6} x={-0.3} y={-0.3} title="Camera" />
    </g>
  );
}

Track3DCamera.displayName = "Track3DCamera";
export default Track3DCamera;
