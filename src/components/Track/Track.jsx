import { useSelector } from "react-redux";
import TrackAnimating from "./TrackAnimating";
import TrackStatic from "./TrackStatic";
import SkaterAnnotations from "./SkaterAnnotations";

import styles from "./Track.module.scss";
import {
  ANIMATION_STATE,
  selectAnimationState,
} from "../../app/reducers/animatingTrackSlice";
import Legend from "./Legend";

function Track() {
  const animationState = useSelector(selectAnimationState);
  const trackIsAnimating = [
    ANIMATION_STATE.PLAYING,
    ANIMATION_STATE.PAUSED,
  ].includes(animationState);

  return (
    <div className={[styles.track, "js-track"].join(" ")}>
      {trackIsAnimating ? <TrackAnimating /> : <TrackStatic />}
      <Legend />
      <SkaterAnnotations />
    </div>
  );
}

export default Track;
