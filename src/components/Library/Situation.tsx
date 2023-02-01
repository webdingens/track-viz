import {
  ChangeEvent,
  PropsWithoutRef,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  Situation as SituationType,
  SITUATION_TYPES,
  SkaterType,
} from "../../types/LibraryData";
import TrackGeometry from "../Track/TrackGeometry";
import RichtextEditor from "./RichtextEditor";
import {
  setCurrentTrack,
  selectCurrentTrack,
} from "../../app/reducers/currentTrackSlice";
import {
  getSkatersWDPInBounds,
  getSkatersWDPInPlayPackSkater,
  getSkatersWDPPivotLineDistance,
  PACK_MEASURING_METHODS,
} from "../../utils/packFunctions";
import { selectGeneralSettings } from "../../app/reducers/settingsGeneralSlice";

type SituationProps = PropsWithoutRef<{
  data: SituationType;
  idPrefix: string;
  onUpdate?: (updatedSituation: SituationType) => void;
}>;

function Situation({ data, idPrefix, onUpdate }: SituationProps) {
  const [currentSituation, setCurrentSituation] = useState(data);
  const dispatch = useDispatch();
  const settings = useSelector(selectGeneralSettings);
  const currentTrack = useSelector(selectCurrentTrack);

  const onUpdateDescription = (markup: string) => {
    setCurrentSituation({
      ...data,
      description: markup,
    });
  };

  const onChangeTitle = (evt: ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    setCurrentSituation({
      ...data,
      title: value,
    });
  };

  const onChangeType = (evt: ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    setCurrentSituation({
      ...data,
      type: value,
    });
  };

  const onCopyFromCurrentTrack = () => {
    setCurrentSituation({
      ...data,
      skaters: currentTrack.skaters,
      refs: currentTrack.refs,
      empty: false,
    });
  };

  const onLoadToCurrentTrack = () => {
    dispatch(
      setCurrentTrack({
        skaters: data.skaters,
        refs: data.refs,
      })
    );
  };

  useEffect(() => {
    if (onUpdate) onUpdate(currentSituation);
  }, [currentSituation]);

  /**
   * Adding inBounds, pivotLineDist for pack computations. Imported skaters are missing these.
   */
  const addDerivedPropertiesToSkaters = (skaters: SkaterType[]) => {
    let ret = getSkatersWDPInBounds(skaters);
    ret = getSkatersWDPPivotLineDistance(ret);
    if (settings.packMeasuringMethod === PACK_MEASURING_METHODS.SECTOR) {
      ret = getSkatersWDPInPlayPackSkater(ret, {
        method: PACK_MEASURING_METHODS.SECTOR,
      });
    } else {
      ret = getSkatersWDPInPlayPackSkater(ret, {
        method: PACK_MEASURING_METHODS.RECTANGLE,
      });
    }
    return ret;
  };

  const skatersWDP = useMemo(
    () => addDerivedPropertiesToSkaters(data.skaters),
    [data.skaters]
  );

  return (
    <div>
      <label htmlFor={`${idPrefix}-sit-${data.id}-title`}>Title</label>
      <input
        type="text"
        id={`${idPrefix}-sit-${data.id}-title`}
        defaultValue={currentSituation.title}
        onChange={onChangeTitle}
        placeholder="Situation Title"
      />

      <p>Description</p>
      <RichtextEditor
        content={data.description ?? ""}
        onUpdate={onUpdateDescription}
      />

      {/* Changing of types, needs different fields for prompting of cases or the like. */}
      {/* <fieldset>
        <legend>Type</legend>
        <label>
          <input
            type="radio"
            name={`${idPrefix}-sit-${data.id}-name`}
            value={SITUATION_TYPES.DESCRIPTION}
            onChange={onChangeType}
            checked={data.type === SITUATION_TYPES.DESCRIPTION}
          />
          Description
        </label>
        <label>
          <input
            type="radio"
            name={`${idPrefix}-sit-${data.id}-name`}
            value={SITUATION_TYPES.PROMPT}
            onChange={onChangeType}
            checked={data.type === SITUATION_TYPES.PROMPT}
          />
          Prompt
        </label>
      </fieldset> */}

      <p>Thumbnail</p>
      {!data.empty ? (
        <TrackGeometry
          skaters={skatersWDP}
          isPreview={true}
          updatePack={true}
          style={{ maxHeight: "200px" }}
        />
      ) : (
        <p>Empty Track, please copy from current Track</p>
      )}
      <button type="button" onClick={onCopyFromCurrentTrack} title="Save">
        Copy from Track
      </button>
      {!data.empty && (
        <button type="button" onClick={onLoadToCurrentTrack} title="Load">
          Load onto Track
        </button>
      )}
    </div>
  );
}

export default Situation;
