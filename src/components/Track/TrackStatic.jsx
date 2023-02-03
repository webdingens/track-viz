import { useSelector } from "react-redux";
import { selectCurrentSkatersWDP } from "../../app/reducers/currentTrackSlice";
import { selectGeneralSettings } from "../../app/reducers/settingsGeneralSlice";
import TrackGeometry from "./TrackGeometry";

function TrackStatic() {
  const settings = useSelector(selectGeneralSettings);
  const skaters = useSelector((state) =>
    selectCurrentSkatersWDP(state, settings.packMeasuringMethod)
  );
  return <TrackGeometry skaters={skaters} />;
}

export default TrackStatic;
