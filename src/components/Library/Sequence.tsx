import { ChangeEvent, PropsWithRef, useEffect, useState } from "react";
import {
  Sequence as SequenceType,
  Situation as SituationType,
} from "../../types/LibraryData";
import {
  addEmptySituation,
  removeSituation,
  setSituation,
} from "../../utils/libraryEdit";
import RichtextEditor from "./RichtextEditor";
import Situation from "./Situation";

import styles from "./Sequence.module.scss";

type SequenceProps = PropsWithRef<{
  data: SequenceType;
  onUpdate?: (updatedSequence: SequenceType) => void;
}>;

function Sequence({ data, onUpdate }: SequenceProps) {
  const [currentSequence, setCurrentSequence] = useState(data);
  const id = "library";

  const onAddSituation = () => {
    const newSequence = addEmptySituation(currentSequence);
    if (!newSequence) {
      console.error("addingScenario failed");
      return;
    }
    setCurrentSequence(newSequence);
  };

  const onRemoveSituation = (situationId: number) => {
    const newSequence = removeSituation(currentSequence, situationId);
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

      <p>Description</p>
      <RichtextEditor
        content={currentSequence.description ?? ""}
        onUpdate={onUpdateDescription}
      />

      <hr />

      {data.sequence.length > 0 ? (
        <ul className={styles.situationList}>
          {data.sequence.map((situation, idx) => (
            <li key={situation.id}>
              <p className={styles.situationIndex}>Situation {idx + 1}</p>
              <Situation
                data={situation}
                onUpdate={onSituationUpdate}
                idPrefix={`${id}-seq-${data.id}`}
              />
              <button
                type="button"
                onClick={() => onRemoveSituation(situation.id)}
              >
                Remove Situation
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No Situation in this sequence yet.</p>
      )}
      <button type="button" onClick={onAddSituation}>
        Add Situation
      </button>
    </div>
  );
}
export default Sequence;
