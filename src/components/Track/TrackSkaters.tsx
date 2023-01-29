import { ReactElement } from "react";
import Skater, {SkaterType} from "../Skater/Skater";

const TrackSkaters = (props: {
  skaters: SkaterType[],
  preventDragUpdate: boolean
}) => {
  console.log('lol')
  let skaters: ReactElement[] = [];
  let idxA = 0;
  let idxB = 0;
  props.skaters.forEach((el, i) => {
    let labelIdx = 0;
    if (el.team === "A") labelIdx = ++idxA;
    else labelIdx = ++idxB;
    skaters.push(
      <Skater
        key={el.id}
        idx={i}
        label={!(el.isJammer || el.isPivot) ? Number(labelIdx).toString() : ""}
        preventDragUpdate={props.preventDragUpdate}
        {...el}
      />
    );
  });

  return skaters;
};

export default TrackSkaters;
