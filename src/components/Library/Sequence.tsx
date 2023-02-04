import { ChangeEvent, PropsWithRef, useEffect, useId, useState } from "react";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
  AccordionItemState,
} from "react-accessible-accordion";
import {
  Sequence as SequenceType,
  Situation as SituationType,
} from "../../types/LibraryData";
import {
  addEmptySituation,
  moveSituationDown,
  moveSituationUp,
  removeSituation,
  setSituation,
} from "../../utils/libraryEdit";
import RichtextEditor from "./RichtextEditor";
import Situation from "./Situation";

import styles from "./Sequence.module.scss";
import libraryStyles from "./Library.module.scss";
import classNames from "classnames";
import {
  FiArrowDown,
  FiArrowUp,
  FiMinus,
  FiPlus,
  FiTrash2,
} from "react-icons/fi";

type SequenceProps = PropsWithRef<{
  data: SequenceType;
  onUpdate?: (updatedSequence: SequenceType) => void;
}>;

function Sequence({ data, onUpdate }: SequenceProps) {
  const [currentSequence, setCurrentSequence] = useState(data);
  const id = "library";
  const sequenceId = useId();

  const onAddSituation = () => {
    const newSequence = addEmptySituation(currentSequence);
    if (!newSequence) {
      console.error("addingScenario failed");
      return;
    }
    setCurrentSequence(newSequence);
  };

  const onMoveSituationUp = (situation: SituationType) => {
    const newSequence = moveSituationUp(currentSequence, situation);
    if (!newSequence) {
      console.error("addingScenario failed");
      return;
    }
    setCurrentSequence(newSequence);
  };

  const onMoveSituationDown = (situation: SituationType) => {
    const newSequence = moveSituationDown(currentSequence, situation);
    if (!newSequence) {
      console.error("addingScenario failed");
      return;
    }
    setCurrentSequence(newSequence);
  };

  const onRemoveSituation = (situation: SituationType) => {
    const newSequence = removeSituation(currentSequence, situation);
    if (!newSequence) {
      console.error("addingScenario failed");
      return;
    }
    setCurrentSequence(newSequence);
  };

  const onUpdateDescription = (markup: string) => {
    setCurrentSequence({
      ...data,
      description: markup,
    });
  };

  const onChangeTitle = (evt: ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    setCurrentSequence({
      ...data,
      title: value,
    });
  };

  const onSituationUpdate = (updatedSituation: SituationType) => {
    const newSequence = setSituation(currentSequence, updatedSituation);
    if (!newSequence) {
      console.error("Failed to update Situation");
      return;
    }
    setCurrentSequence(newSequence);
  };

  useEffect(() => {
    if (onUpdate) onUpdate(currentSequence);
  }, [currentSequence]);

  return (
    <div className={styles.sequence}>
      <label htmlFor={`${id}-seq-${data.id}-title`}>Title</label>
      <input
        type="text"
        id={`${id}-seq-${data.id}-title`}
        defaultValue={currentSequence.title}
        onChange={onChangeTitle}
        placeholder="Sequence Title"
      />

      <label id={`${sequenceId}-description`}>Description</label>
      <RichtextEditor
        content={currentSequence.description ?? ""}
        onUpdate={onUpdateDescription}
        ariaDescribedBy={`${sequenceId}-description`}
      />

      <p>
        <strong>Situations:</strong>
      </p>

      {data.sequence.length > 0 ? (
        <Accordion allowZeroExpanded allowMultipleExpanded>
          {data.sequence.map((situation, idx) => (
            <AccordionItem key={situation.id}>
              <AccordionItemState>
                {({ expanded }) => (
                  <>
                    <div className={styles.situationItemHeader}>
                      <AccordionItemHeading
                        className={classNames({
                          accordion__heading: true,
                          "accordion__heading--expanded": expanded,
                        })}
                      >
                        <AccordionItemButton>
                          <span>
                            {situation.title
                              ? situation.title
                              : `Situation ${idx + 1}`}
                          </span>
                          <span>{expanded ? <FiMinus /> : <FiPlus />}</span>
                        </AccordionItemButton>
                      </AccordionItemHeading>
                      <div className={styles.situationControls}>
                        <button
                          onClick={() => onRemoveSituation(situation)}
                          title="Remove Sequence"
                        >
                          <FiTrash2 />
                        </button>
                        <button
                          disabled={idx === 0}
                          onClick={() => onMoveSituationUp(situation)}
                          title="Move Sequence Up"
                        >
                          <FiArrowUp />
                        </button>
                        <button
                          disabled={idx === data.sequence.length - 1}
                          onClick={() => onMoveSituationDown(situation)}
                          title="Move Sequence Down"
                        >
                          <FiArrowDown />
                        </button>
                      </div>
                    </div>
                    <AccordionItemPanel>
                      <div className={styles.situationWrapper}>
                        <Situation
                          data={situation}
                          onUpdate={onSituationUpdate}
                          idPrefix={`${id}-seq-${data.id}`}
                        />
                      </div>
                    </AccordionItemPanel>
                  </>
                )}
              </AccordionItemState>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p>No Situation in this sequence yet.</p>
      )}
      <div className={styles.controls}>
        <button
          type="button"
          onClick={onAddSituation}
          className={classNames(
            libraryStyles.libraryButton,
            libraryStyles.libraryButtonSmall
          )}
        >
          Add Situation
        </button>
      </div>
    </div>
  );
}
export default Sequence;
