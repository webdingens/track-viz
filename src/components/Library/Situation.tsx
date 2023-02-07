import {
  ChangeEvent,
  PropsWithoutRef,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
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
import styles from "./Situation.module.scss";
import libraryStyles from "./Library.module.scss";
import classNames from "classnames";

type SituationProps = PropsWithoutRef<{
  data: SituationType;
  idPrefix: string;
  onUpdate?: (updatedSituation: SituationType) => void;
}>;

function Situation({ data, idPrefix, onUpdate }: SituationProps) {
  const [currentSituation, setCurrentSituation] = useState(data);
  const dispatch = useDispatch();
  const settings = useSelector(selectGeneralSettings);
  const currentTrack = useSelector(selectCurrentTrack); // TODO: Makes the Situation Update
  const situationId = useId();
  const trackData = useRef(currentTrack);

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

  // needs trackData as ref because the function might reference an outdated trackData from the store otherwise
  const onCopyFromCurrentTrack = () => {
    setCurrentSituation({
      ...data,
      skaters: trackData.current.skaters,
      refs: trackData.current.refs,
      empty: false,
    });
  };

  const onLoadToCurrentTrack = () => {
    dispatch(
      setCurrentTrack({
        skaters: data.skaters.map((skater) => ({
          ...skater,
          hasFocus: false,
        })),
        refs: data.refs,
      })
    );
  };

  // save intermediate changes
  useEffect(() => {
    trackData.current = currentTrack;
  }, [currentTrack]);

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

  // only update if data or situation changed
  return useMemo(
    () => (
      <div className={styles.situation}>
        <label htmlFor={`${idPrefix}-sit-${data.id}-title`}>Title</label>
        <input
          type="text"
          id={`${idPrefix}-sit-${data.id}-title`}
          defaultValue={currentSituation.title}
          onChange={onChangeTitle}
          placeholder="Situation Title"
        />

        <label id={`${situationId}-description`}>Description</label>
        <RichtextEditor
          content={data.description ?? ""}
          onUpdate={onUpdateDescription}
          ariaDescribedBy={`${situationId}-description`}
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

        <p>
          <strong>Thumbnail</strong>
        </p>
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
        <div className={styles.controls}>
          <button
            type="button"
            onClick={onCopyFromCurrentTrack}
            title="Save"
            className={classNames(
              libraryStyles.libraryButton,
              libraryStyles.libraryButtonSmall
            )}
          >
            Copy from Track
          </button>
          {!data.empty && (
            <button
              type="button"
              onClick={onLoadToCurrentTrack}
              title="Load"
              className={classNames(
                libraryStyles.libraryButton,
                libraryStyles.libraryButtonSmall
              )}
            >
              Load onto Track
            </button>
          )}
        </div>
      </div>
    ),
    [data, currentSituation]
  );
}

export default Situation;
