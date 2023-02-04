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
import { FiPlus, FiMinus } from "react-icons/fi";

import { LibraryData, Sequence as SequenceType } from "../../types/LibraryData";
import {
  addEmptySequence,
  removeSequence,
  setSequence,
} from "../../utils/libraryEdit";
import Sequence from "./Sequence";

import "./AccordionStyles.module.scss";
import styles from "./SequencesEditor.module.scss";
import libraryStyles from "./Library.module.scss";

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

  const removeSequenceFromCurrentSequences = (sequenceId: number) => {
    const newSequences = removeSequence(currentSequences, sequenceId);
    if (!newSequences) {
      console.error("setting updated Sequence failed");
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
                    <AccordionItemPanel>
                      <div className={styles.accordionContent}>
                        <Sequence data={sequence} onUpdate={onSequenceUpdate} />
                        <hr />
                        <button
                          type="button"
                          onClick={() =>
                            removeSequenceFromCurrentSequences(sequence.id)
                          }
                          className={classNames(
                            libraryStyles.libraryButton,
                            libraryStyles.libraryButtonSmall,
                            styles.removeSequenceButton
                          )}
                        >
                          Remove Sequence
                        </button>
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
          className={libraryStyles.libraryButton}
        >
          Add Sequence
        </button>
        {currentSequences.length > 0 && (
          <button
            type="button"
            onClick={onRemoveAllSequences}
            className={classNames(
              libraryStyles.libraryButton,
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
