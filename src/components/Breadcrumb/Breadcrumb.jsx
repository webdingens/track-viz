import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { selectLibrary } from "../../app/reducers/currentLibrarySlice";
import {
  selectBreadcrumbShowDescription,
  selectLibraryInEditMode,
  setBreadcrumbShowDescription,
} from "../../app/reducers/interactionStateSlice";
import RichtextView from "../Library/RichtextView";
import {
  FiChevronDown,
  FiChevronLeft,
  FiChevronRight,
  FiChevronUp,
  FiPlay,
  FiSquare,
} from "react-icons/fi";

import styles from "./Breadcrumb.module.scss";
import buttonStyles from "../../styles/Buttons.module.scss";
import classNames from "classnames";
import { setCurrentTrack } from "../../app/reducers/currentTrackSlice";
import LibraryToggle from "./LibraryToggle";
import ButtonOrSpan from "./ButtonOrSpan";
import OutlinedText from "./OutlinedText";
import PlaybackControls from "../PlaybackControls/PlaybackControls";

function BreadcrumbInViewMode() {
  const library = useSelector(selectLibrary);
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

  const onTogglePlaySequence = () => {
    setFirstSituation(selectedSequence);
    setPlaySequence(!playSequence);
  };

  const onSequenceLeft = () => {
    const newIndex = selectedSequenceIndex - 1;
    if (newIndex < 0) {
      console.error("Failed to select previous Sequence");
      return;
    }
    setSelectedSequence(library.sequences[newIndex]);
    setSelectedSequenceIndex(newIndex);
    setFirstSituation(library.sequences[newIndex]);
    setPlaySequence(false);
  };

  const onSequenceRight = () => {
    const newIndex = selectedSequenceIndex + 1;
    if (newIndex > library.sequences.length - 1) {
      console.error("Failed to select next Sequence");
      return;
    }
    setSelectedSequence(library.sequences[newIndex]);
    setSelectedSequenceIndex(newIndex);
    setFirstSituation(library.sequences[newIndex]);
    setPlaySequence(false);
  };

  const onSituationLeft = () => {
    const newIndex = selectedSituationIndex - 1;
    if (newIndex < 0) {
      console.error("Failed to select previous Situation");
      return;
    }
    setSelectedSituation(selectedSequence.sequence[newIndex]);
    setSelectedSituationIndex(newIndex);
    loadSituationOntoTrack(selectedSequence.sequence[newIndex]);
  };

  const onSituationRight = () => {
    const newIndex = selectedSituationIndex + 1;
    if (newIndex > selectedSequence.sequence.length - 1) {
      console.error("Failed to select next Situation");
      return;
    }
    setSelectedSituation(selectedSequence.sequence[newIndex]);
    setSelectedSituationIndex(newIndex);
    loadSituationOntoTrack(selectedSequence.sequence[newIndex]);
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
    dispatch(setBreadcrumbShowDescription(true));
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
              {!playSequence && (
                <div className={buttonStyles.leftRightButton}>
                  <button
                    type="button"
                    disabled={selectedSequenceIndex === 0}
                    onClick={onSequenceLeft}
                    className={buttonStyles.menuButtonLeft}
                  >
                    <FiChevronLeft title="Go to previous sequence" />
                  </button>
                  <ButtonOrSpan
                    onClick={() =>
                      dispatch(setBreadcrumbShowDescription(!showDescription))
                    }
                    isButton={!!selectedSequence.description}
                    title="Toggle Description"
                    className={buttonStyles.menuButtonCenter}
                  >
                    <span>{sequenceTitle}</span>
                    {!!selectedSequence.description &&
                      (showDescription ? <FiChevronUp /> : <FiChevronDown />)}
                  </ButtonOrSpan>
                  <button
                    type="button"
                    disabled={
                      selectedSequenceIndex === library.sequences.length - 1
                    }
                    onClick={onSequenceRight}
                    className={buttonStyles.menuButtonRight}
                  >
                    <FiChevronRight title="Go to next sequence" />
                  </button>
                </div>
              )}
              {!!selectedSituation && playSequence && (
                <div
                  className={classNames(styles.descriptionHolder, {
                    [styles.descriptionHolderActive]: showDescription,
                  })}
                >
                  <div className={buttonStyles.leftRightButton}>
                    <button
                      type="button"
                      disabled={selectedSituationIndex === 0}
                      onClick={onSituationLeft}
                      className={buttonStyles.menuButtonLeft}
                    >
                      <FiChevronLeft title="Go to previous situation" />
                    </button>
                    <ButtonOrSpan
                      onClick={() =>
                        dispatch(setBreadcrumbShowDescription(!showDescription))
                      }
                      isButton={!!selectedSequence.description}
                      title="Toggle Description"
                      className={buttonStyles.menuButtonCenter}
                    >
                      <span>{situationTitle}</span>
                      {!!selectedSituation.description &&
                        (showDescription ? <FiChevronUp /> : <FiChevronDown />)}
                    </ButtonOrSpan>
                    <button
                      className={buttonStyles.menuButtonRight}
                      type="button"
                      disabled={
                        selectedSituationIndex ===
                        selectedSequence.sequence.length - 1
                      }
                      onClick={onSituationRight}
                    >
                      <FiChevronRight title="Go to next situation" />
                    </button>
                  </div>
                </div>
              )}
            </div>
            {showDescription && selectedSequence && (
              <div
                className={classNames(styles.descriptionHolder, {
                  [styles.descriptionHolderActive]: showDescription,
                })}
              >
                <div className={styles.description}>
                  <h3>
                    {sequenceTitle}
                    {!!selectedSituation &&
                      playSequence &&
                      `: ${situationTitle}`}
                  </h3>
                  {!playSequence && !!selectedSequence.description && (
                    <RichtextView content={selectedSequence.description} />
                  )}
                  {playSequence && !!selectedSituation.description && (
                    <RichtextView content={selectedSituation.description} />
                  )}
                </div>
              </div>
            )}
            {!showDescription && playSequence && (
              <div className={styles.sequenceTitle}>
                <OutlinedText text={sequenceTitle} />
              </div>
            )}
          </div>
          {!!selectedSituation && (
            <button
              type="button"
              title={playSequence ? "Stop Sequence" : "Play Sequence"}
              onClick={onTogglePlaySequence}
              className={buttonStyles.menuButton}
            >
              {playSequence ? <FiSquare /> : <FiPlay />}
            </button>
          )}
          {!!selectedSequence && (
            <PlaybackControls sequence={selectedSequence} />
          )}
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
