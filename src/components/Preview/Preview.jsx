import { useRef, useEffect } from "react";
import { useSelector } from "react-redux";

import TrackGeometry from "../Track/TrackGeometry";

import {
  selectTrackOrientation,
  TRACK_ORIENTATIONS,
} from "../../app/reducers/settingsTrackSlice";

import styles from "./Preview.module.scss";

const Preview = ({ track, bbox, onShown }) => {
  const element = useRef();
  const timeout = useRef();
  const orientation = useSelector(selectTrackOrientation);

  const fadeElementInOut = () => {
    let el = element.current;
    if (!el) return;

    // set position
    let landscape =
      orientation === TRACK_ORIENTATIONS.ORIENTATION_0_DEG ||
      orientation === TRACK_ORIENTATIONS.ORIENTATION_180_DEG;
    el.style.width = landscape
      ? `${styles.previewWidth - 2 * styles.previewPadding}px`
      : `${
          ((styles.previewWidth - 2 * styles.previewPadding) * 17.9) / 27.9
        }px`;

    el.style.top = bbox.top + "px";
    let left = bbox.left + bbox.width;
    left = Math.max(Math.round(styles.previewWidth / 2), left);
    el.style.left = left + "px";

    // add Class
    element.current.classList.add(styles.PreviewVisible);

    // set timeout to call callback
    timeout.current = setTimeout(onShown, styles.animationDuration * 1000);
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(fadeElementInOut, []);

  return (
    <div ref={element} className={styles.Preview}>
      <TrackGeometry skaters={track.skaters} interactive={false} />
    </div>
  );
};

export default Preview;
