import { useSelector } from "react-redux";
import TrackAnimating from "./TrackAnimating";
import TrackStatic from "./TrackStatic";
import TrackOverlay from "./TrackOverlay";
import SkaterAnnotations from "./SkaterAnnotations";

import styles from "./Track.module.scss";
import {
  ANIMATION_STATE,
  selectAnimationState,
} from "../../app/reducers/currentSequenceSlice";

function Track() {
  const animationState = useSelector(selectAnimationState);
  const trackIsAnimating = [
    ANIMATION_STATE.PLAYING,
    ANIMATION_STATE.PAUSED,
  ].includes(animationState);

  return (
    <div className={styles.track}>
      {trackIsAnimating ? <TrackAnimating /> : <TrackStatic />}
      <TrackOverlay />
      <SkaterAnnotations />
    </div>
  );
}

export default Track;
