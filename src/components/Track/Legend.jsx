import { useSelector } from "react-redux";
import { selectCurrentSkaters } from "../../app/reducers/currentTrackSlice";
import { SKATER_ANNOTATION_COLORS } from "../../utils/colors";
import CirclePreview from "../Skater/CirclePreview";

import styles from "./Legend.module.scss";

function Legend() {
  const skaters = useSelector(selectCurrentSkaters);
  const legendSkaters = skaters.filter((skater) => {
    return (
      skater.color === SKATER_ANNOTATION_COLORS.ALTERNATE ||
      skater.description ||
      skater.pattern
    );
  });
  if (legendSkaters.length === 0) return null;
  return (
    <div className={styles.legend}>
      <h2>Legend</h2>
      {legendSkaters.map((skater) => {
        return (
          <div key={skater.id} className={styles.circlePreview}>
            <CirclePreview skater={skater} />
            {skater.description} (T: <CirclePreview team={skater.team} />)
          </div>
        );
      })}
    </div>
  );
}

export default Legend;
