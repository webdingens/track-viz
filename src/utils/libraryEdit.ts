import {
  LibraryData,
  Sequence,
  Situation,
  SITUATION_TYPES,
} from "../types/LibraryData";

export const getUniqueId = (arr: { id: number }[]) => {
  const keysInUse: { [k: number]: boolean } = {};
  for (let entry of arr) {
    keysInUse[entry.id] = true;
  }
  let id = 0;
  while (keysInUse[id]) {
    id++;
  }
  return id;
};

export const addEmptySequence = (sequences: LibraryData["sequences"]) => {
  const ret = [
    ...sequences,
    {
      id: getUniqueId(sequences),
      title: "",
      sequence: [],
    },
  ];
  return ret;
};

export const addEmptySituation = (sequence: Sequence): Sequence => {
  const emptySituation: Situation = {
    id: getUniqueId(sequence.sequence),
    type: SITUATION_TYPES.DESCRIPTION,
    empty: true,
    skaters: [],
    refs: [],
  };
  return {
    ...sequence,
    sequence: [...sequence.sequence, emptySituation],
  };
};

export const setSequence = (
  sequences: LibraryData["sequences"],
  sequence: Sequence
) => {
  const index = sequences.findIndex((entry) => entry.id === sequence.id);
  if (index === -1) {
    console.error("Sequence not found");
    return;
  }
  const newSequences = [...sequences];
  newSequences.splice(index, 1, sequence);
  return newSequences;
};

export const removeSequence = (
  sequences: LibraryData["sequences"],
  sequence: Sequence
) => {
  const index = sequences.findIndex((entry) => entry.id === sequence.id);
  if (index === -1) {
    console.error("Sequence not found");
    return;
  }
  const newSequences = [...sequences];
  newSequences.splice(index, 1);
  return newSequences;
};

export const moveSequenceUp = (
  sequences: LibraryData["sequences"],
  sequence: Sequence
) => {
  const index = sequences.findIndex((entry) => entry.id === sequence.id);
  if (index === -1) {
    console.error("Sequence not found");
    return;
  }
  if (index < 1) {
    console.error("Cannot be moved up");
  }
  const newSequences = [...sequences];
  newSequences.splice(index, 1);
  newSequences.splice(index - 1, 0, sequence);
  return newSequences;
};

export const moveSequenceDown = (
  sequences: LibraryData["sequences"],
  sequence: Sequence
) => {
  const index = sequences.findIndex((entry) => entry.id === sequence.id);
  if (index === -1) {
    console.error("Sequence not found");
    return;
  }
  if (index > sequences.length - 2) {
    console.error("Cannot be moved down");
  }
  const newSequences = [...sequences];
  newSequences.splice(index, 1);
  newSequences.splice(index + 1, 0, sequence);
  return newSequences;
};

export const setSituation = (sequence: Sequence, situation: Situation) => {
  const newSituations = [...sequence.sequence];
  const index = newSituations.findIndex((entry) => entry.id === situation.id);
  if (index === -1) {
    console.error("Situation not found");
    return;
  }
  newSituations.splice(index, 1, situation);
  const newSequence: Sequence = {
    ...sequence,
    sequence: newSituations,
  };
  return newSequence;
};

export const removeSituation = (sequence: Sequence, situation: Situation) => {
  const newSituations = [...sequence.sequence];
  const index = newSituations.findIndex((entry) => entry.id === situation.id);
  if (index === -1) {
    console.error("Situation not found");
    return;
  }
  newSituations.splice(index, 1);
  const newSequence: Sequence = {
    ...sequence,
    sequence: newSituations,
  };
  return newSequence;
};

export const moveSituationUp = (sequence: Sequence, situation: Situation) => {
  const newSituations = [...sequence.sequence];
  const index = newSituations.findIndex((entry) => entry.id === situation.id);
  if (index === -1) {
    console.error("Situation not found");
    return;
  }
  if (index < 1) {
    console.error("Cannot be moved up");
  }
  newSituations.splice(index, 1);
  newSituations.splice(index - 1, 0, situation);
  const newSequence: Sequence = {
    ...sequence,
    sequence: newSituations,
  };
  return newSequence;
};

export const moveSituationDown = (sequence: Sequence, situation: Situation) => {
  const newSituations = [...sequence.sequence];
  const index = newSituations.findIndex((entry) => entry.id === situation.id);
  if (index === -1) {
    console.error("Situation not found");
    return;
  }
  if (index > newSituations.length - 2) {
    console.error("Cannot be moved down");
  }
  newSituations.splice(index, 1);
  newSituations.splice(index + 1, 0, situation);
  const newSequence: Sequence = {
    ...sequence,
    sequence: newSituations,
  };
  return newSequence;
};
