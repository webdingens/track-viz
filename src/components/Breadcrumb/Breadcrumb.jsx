import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectLibrary } from "../../app/reducers/currentLibrarySlice";
import {
  selectBreadcrumbShowDescription,
  selectLibraryInEditMode,
  setBreadcrumbShowDescription,
  BREADCRUMB_SHOW_DESCRIPTION,
} from "../../app/reducers/interactionStateSlice";
import RichtextView from "../Library/RichtextView";
import { FiChevronLeft, FiChevronRight, FiInfo, FiX } from "react-icons/fi";

import styles from "./Breadcrumb.module.scss";
import buttonStyles from "../../styles/Buttons.module.scss";
import classNames from "classnames";
import { setCurrentTrack } from "../../app/reducers/currentTrackSlice";
import LibraryToggle from "./LibraryToggle";
import PlaybackControls from "../PlaybackControls/PlaybackControls";
import {
  LAYOUT_MODES,
  selectLayoutMode,
} from "../../app/reducers/settingsGeneralSlice";

function BreadcrumbInViewMode() {
  const library = useSelector(selectLibrary);
  const layoutMode = useSelector(selectLayoutMode);
  const [selectedSequence, setSelectedSequence] = useState(
    library.sequences.length ? library.sequences[0] : null
  );
  const [selectedSequenceIndex, setSelectedSequenceIndex] = useState(0);
  const [selectedSituation, setSelectedSituation] = useState(
    selectedSequence?.sequence.length ? selectedSequence?.sequence[0] : null
  );
  const [selectedSituationIndex, setSelectedSituationIndex] = useState(0);
  const showDescription = useSelector(selectBreadcrumbShowDescription);
  const [playSequence, setPlaySequence] = useState(false);
  const dispatch = useDispatch();
  const mounted = useRef(false);

  function setFirstSituation(sequence) {
    const firstSituation = sequence?.sequence.length
      ? sequence?.sequence[0]
      : null;
    setSelectedSituation(firstSituation);
    setSelectedSituationIndex(0);
    return firstSituation;
  }

  useEffect(() => {
    if (playSequence && selectedSituation) {
      loadSituationOntoTrack(selectedSituation);
    }
  }, [playSequence]);

  function loadSituationOntoTrack(situation) {
    dispatch(
      setCurrentTrack({
        skaters: situation.skaters.map((skater) => ({
          ...skater,
          hasFocus: false,
        })),
        refs: situation.refs,
      })
    );
  }

  const setSequenceBasedByIndex = (sequenceIndex) => {
    const newSequence = library.sequences[sequenceIndex];
    setSelectedSequence(newSequence);
    setSelectedSequenceIndex(sequenceIndex);
    const firstSituation = setFirstSituation(newSequence);
    loadSituationOntoTrack(firstSituation);
    setPlaySequence(false);
  };

  const onSequenceLeft = () => {
    const newIndex = selectedSequenceIndex - 1;
    if (newIndex < 0) {
      return console.error("Failed to select previous Sequence");
    }
    setSequenceBasedByIndex(newIndex);
  };

  const onSequenceRight = () => {
    const newIndex = selectedSequenceIndex + 1;
    if (newIndex > library.sequences.length - 1) {
      return console.error("Failed to select next Sequence");
    }
    setSequenceBasedByIndex(newIndex);
  };

  const onChangeSelectSequence = (evt) => {
    const sequenceId = +evt.target.value;
    const newIndex = library.sequences.findIndex(
      (entry) => entry.id === sequenceId
    );
    if (newIndex === -1) {
      return console.error("Did not find selected sequence");
    }
    setSequenceBasedByIndex(newIndex);
  };

  const onSituationLeft = () => {
    const newIndex = selectedSituationIndex - 1;
    if (newIndex < 0) {
      return console.error("Failed to select previous Situation");
    }
    setSituationByIndex(newIndex);
  };

  const onSituationRight = () => {
    const newIndex = selectedSituationIndex + 1;
    if (newIndex > selectedSequence.sequence.length - 1) {
      return console.error("Failed to select next Situation");
    }
    setSituationByIndex(newIndex);
  };

  const onChangeSelectSituation = (evt) => {
    const situationId = +evt.target.value;
    const newIndex = selectedSequence.sequence.findIndex(
      (entry) => entry.id === situationId
    );
    if (newIndex === -1) {
      return console.error("Did not find selected situation");
    }
    setSituationByIndex(newIndex);
  };

  const setSituationByIndex = (situationIndex) => {
    const newSituation = selectedSequence.sequence[situationIndex];
    setSelectedSituation(newSituation);
    setSelectedSituationIndex(situationIndex);
    loadSituationOntoTrack(newSituation);
  };

  const toggleDescription = (descriptionType) => {
    if (showDescription === descriptionType) {
      dispatch(setBreadcrumbShowDescription(BREADCRUMB_SHOW_DESCRIPTION.NONE));
    } else {
      dispatch(setBreadcrumbShowDescription(descriptionType));
    }
  };

  // on update library reset the Breadcrumb
  // triggered by importing another library during view mode
  useEffect(() => {
    if (!mounted.current) return;
    const newSequence = library.sequences.length ? library.sequences[0] : null;
    setSelectedSequence(newSequence);
    setSelectedSequenceIndex(0);
    const newSituation = newSequence?.sequence.length
      ? newSequence?.sequence[0]
      : null;
    setSelectedSituation(newSituation);
    setSelectedSituationIndex(0);
    setPlaySequence(false);
    dispatch(
      setBreadcrumbShowDescription(BREADCRUMB_SHOW_DESCRIPTION.SEQUENCE)
    );
  }, [library]);

  // Strict Mode
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  if (library.sequences.length === 0) return null;

  const sequenceTitle =
    selectedSequence?.title ?? `Sequence ${selectedSequenceIndex + 1}`;
  const situationTitle =
    selectedSituation?.title ?? `Situation ${selectedSituationIndex + 1}`;

  return (
    <>
      <LibraryToggle library={library} />
      {!!selectedSequence && (
        <>
          <div className={styles.controlsDescriptionWrapper}>
            <div
              className={classNames(styles.controls, {
                [styles.playSequence]: playSequence,
              })}
            >
              <div>
                <div className={buttonStyles.leftRightButton}>
                  <button
                    type="button"
                    className={buttonStyles.menuButtonLeft}
                    title="Toggle Sequence Description"
                    aria-label="Toggle Sequence Description"
                    onClick={() =>
                      toggleDescription(BREADCRUMB_SHOW_DESCRIPTION.SEQUENCE)
                    }
                  >
                    {showDescription ===
                    BREADCRUMB_SHOW_DESCRIPTION.SEQUENCE ? (
                      <FiX />
                    ) : (
                      <FiInfo />
                    )}
                  </button>
                  <select
                    title="Select Sequence"
                    aria-label="Select Sequence"
                    onChange={onChangeSelectSequence}
                    value={selectedSequence?.id}
                  >
                    {library.sequences.map((sequence) => (
                      <option key={sequence.id} value={sequence.id}>
                        {sequence.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={selectedSequenceIndex === 0}
                    onClick={onSequenceLeft}
                    className={classNames(
                      buttonStyles.menuButtonInter,
                      buttonStyles.menuButtonIconOnly
                    )}
                    title="Go to previous sequence"
                    aria-label="Go to previous sequence"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    type="button"
                    disabled={
                      selectedSequenceIndex === library.sequences.length - 1
                    }
                    onClick={onSequenceRight}
                    className={buttonStyles.menuButtonRight}
                    title="Go to next sequence"
                    aria-label="Go to next sequence"
                  >
                    <FiChevronRight />
                  </button>
                </div>
                <div className="hidden--xs hidden--sm">
                  {layoutMode !== LAYOUT_MODES.LAYOUT_3D && (
                    <PlaybackControls sequence={selectedSequence} />
                  )}
                </div>
              </div>
              <div>
                <div className={buttonStyles.leftRightButton}>
                  <button
                    type="button"
                    className={buttonStyles.menuButtonLeft}
                    title="Toggle Situation Description"
                    aria-label="Toggle Situation Description"
                    onClick={() =>
                      toggleDescription(BREADCRUMB_SHOW_DESCRIPTION.SITUATION)
                    }
                  >
                    {showDescription ===
                    BREADCRUMB_SHOW_DESCRIPTION.SITUATION ? (
                      <FiX />
                    ) : (
                      <FiInfo />
                    )}
                  </button>
                  <select
                    className="hidden--xs hidden--sm"
                    title="Select Situation"
                    aria-label="Select Situation"
                    value={selectedSituation?.id}
                    onChange={onChangeSelectSituation}
                  >
                    {selectedSequence.sequence.map((situation) => (
                      <option key={situation.id} value={situation.id}>
                        {situation.title}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    disabled={selectedSituationIndex === 0}
                    onClick={onSituationLeft}
                    className={classNames(
                      buttonStyles.menuButtonInterLeft,
                      buttonStyles.menuButtonIconOnly
                    )}
                    title="Go to previous situation"
                  >
                    <FiChevronLeft />
                  </button>
                  <button
                    className={classNames(
                      buttonStyles.menuButtonInter,
                      buttonStyles.menuButtonIconOnly
                    )}
                    type="button"
                    disabled={
                      selectedSituationIndex ===
                      selectedSequence.sequence.length - 1
                    }
                    onClick={onSituationRight}
                    title="Go to next situation"
                  >
                    <FiChevronRight />
                  </button>
                  <div className={buttonStyles.menuButtonRight}>
                    <code>
                      {`${selectedSituationIndex + 1} / ${
                        selectedSequence.sequence.length
                      }`}
                    </code>
                  </div>
                </div>
              </div>
            </div>
            {showDescription !== BREADCRUMB_SHOW_DESCRIPTION.NONE && (
              <div
                className={classNames(styles.descriptionHolder, {
                  [styles.descriptionHolderActive]: true,
                })}
              >
                <div className={styles.description}>
                  {showDescription === BREADCRUMB_SHOW_DESCRIPTION.SEQUENCE &&
                    !!selectedSequence.description && (
                      <>
                        <h3>{sequenceTitle}</h3>
                        <RichtextView content={selectedSequence.description} />
                      </>
                    )}
                  {showDescription === BREADCRUMB_SHOW_DESCRIPTION.SITUATION &&
                    !!selectedSituation.description && (
                      <>
                        <h3>{`${sequenceTitle}: ${situationTitle}`}</h3>
                        <RichtextView content={selectedSituation.description} />
                      </>
                    )}
                </div>
              </div>
            )}
          </div>
        </>
      )}
    </>
  );
}

function Breadcrumb() {
  const inEditMode = useSelector(selectLibraryInEditMode);
  // TODO: select if we are currently editing something in the library, then render save / cancel buttons
  if (inEditMode) return null;
  return <BreadcrumbInViewMode />;
}

export default Breadcrumb;
