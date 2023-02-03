import { useSelector } from "react-redux";

import TrackDragging from "./TrackDragging";
import TrackOverlay from "./TrackOverlay";

import styles from "./Track.module.scss";
import TrackAnimating from "./TrackAnimating";
import {
  ANIMATION_STATE,
  selectAnimationState,
} from "../../app/reducers/currentSequenceSlice";
import SkaterAnnotations from "./SkaterAnnotations";

function Track() {
  const animationState = useSelector(selectAnimationState);
  const trackIsAnimating = [
    ANIMATION_STATE.PLAYING,
    ANIMATION_STATE.PAUSED,
  ].includes(animationState);

  return (
    <div className={styles.track}>
      {trackIsAnimating ? <TrackAnimating /> : <TrackDragging />}
      <TrackOverlay />
      <SkaterAnnotations />
    </div>
  );
}

export default Track;
