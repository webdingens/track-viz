import Skater from "../Skater/Skater";
import { SkaterType } from "../../types/LibraryData";

const TrackSkaters = (props: {
  skaters: SkaterType[];
  preventDragUpdate?: boolean;
}) => {
  return (
    <>
      {props.skaters.map((el, i) => (
        <Skater
          key={el.id}
          idx={i}
          preventDragUpdate={props.preventDragUpdate ?? false}
          {...el}
        />
      ))}
    </>
  );
};

export default TrackSkaters;
