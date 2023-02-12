import { PropsWithoutRef, useEffect, useState } from "react";
import classNames from "classnames";
import {
  Accordion,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
  AccordionItemState,
} from "react-accessible-accordion";
import {
  FiPlus,
  FiMinus,
  FiTrash2,
  FiArrowUp,
  FiArrowDown,
} from "react-icons/fi";

import { LibraryData, Sequence as SequenceType } from "../../types/LibraryData";
import {
  addEmptySequence,
  moveSequenceDown,
  moveSequenceUp,
  removeSequence,
  setSequence,
} from "../../utils/libraryEdit";
import Sequence from "./Sequence";

import "./AccordionStyles.module.scss";
import styles from "./SequencesEditor.module.scss";
import buttonStyles from "../../styles/Buttons.module.scss";

type SequencesEditorProps = PropsWithoutRef<{
  sequences: LibraryData["sequences"];
  onUpdate?: (sequences: LibraryData["sequences"]) => void;
}>;

function SequencesEditor({ sequences, onUpdate }: SequencesEditorProps) {
  const [currentSequences, setCurrentSequences] = useState(sequences);

  const onAddSequence = () => {
    const newSequences = addEmptySequence(currentSequences);
    setCurrentSequences(newSequences);
  };

  const onRemoveAllSequences = () => {
    setCurrentSequences([]);
  };

  const onSequenceUpdate = (updatedSequence: SequenceType) => {
    const newSequences = setSequence(currentSequences, updatedSequence);
    if (!newSequences) {
      console.error("setting updated Sequence failed");
      return;
    }
    setCurrentSequences(newSequences);
  };

  const onMoveSequenceUp = (sequence: SequenceType) => {
    const newSequences = moveSequenceUp(currentSequences, sequence);
    if (!newSequences) {
      console.error("moving Sequence up failed");
      return;
    }
    setCurrentSequences(newSequences);
  };

  const onMoveSequenceDown = (sequence: SequenceType) => {
    const newSequences = moveSequenceDown(currentSequences, sequence);
    if (!newSequences) {
      console.error("moving Sequence down failed");
      return;
    }
    setCurrentSequences(newSequences);
  };

  const onRemoveSequence = (sequence: SequenceType) => {
    const newSequences = removeSequence(currentSequences, sequence);
    if (!newSequences) {
      console.error("removing Sequence failed");
      return;
    }
    setCurrentSequences(newSequences);
  };

  useEffect(() => {
    if (onUpdate) onUpdate(currentSequences);
  }, [currentSequences]);

  return (
    <div className={styles.sequencesEditor}>
      {currentSequences.length > 0 ? (
        <Accordion allowZeroExpanded>
          {currentSequences.map((sequence, idx) => (
            <AccordionItem key={sequence.id}>
              <AccordionItemState>
                {({ expanded }) => (
                  <>
                    <div className={styles.accordionItemHeader}>
                      <AccordionItemHeading
                        className={classNames({
                          accordion__heading: true,
                          "accordion__heading--expanded": expanded,
                        })}
                      >
                        <AccordionItemButton>
                          <span>
                            {sequence.title
                              ? sequence.title
                              : `Sequence ${idx + 1} (no title)`}
                          </span>
                          <span>{expanded ? <FiMinus /> : <FiPlus />}</span>
                        </AccordionItemButton>
                      </AccordionItemHeading>
                      <div className={styles.sequenceControls}>
                        <button
                          onClick={() => onRemoveSequence(sequence)}
                          title="Remove Sequence"
                        >
                          <FiTrash2 />
                        </button>
                        <button
                          disabled={idx === 0}
                          onClick={() => onMoveSequenceUp(sequence)}
                          title="Move Sequence Up"
                        >
                          <FiArrowUp />
                        </button>
                        <button
                          disabled={idx === currentSequences.length - 1}
                          onClick={() => onMoveSequenceDown(sequence)}
                          title="Move Sequence Down"
                        >
                          <FiArrowDown />
                        </button>
                      </div>
                    </div>
                    <AccordionItemPanel>
                      <div className={styles.accordionContent}>
                        <Sequence data={sequence} onUpdate={onSequenceUpdate} />
                      </div>
                    </AccordionItemPanel>
                  </>
                )}
              </AccordionItemState>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <p>No Sequences added yet</p>
      )}
      <div className={styles.controls}>
        <button
          type="button"
          onClick={onAddSequence}
          className={buttonStyles.rectButton}
        >
          Add Sequence
        </button>
        {currentSequences.length > 0 && (
          <button
            type="button"
            onClick={onRemoveAllSequences}
            className={classNames(
              buttonStyles.rectButton,
              styles.removeAllSequences
            )}
          >
            Remove all Sequences
          </button>
        )}
      </div>
    </div>
  );
}

export default SequencesEditor;
