import { createSlice } from "@reduxjs/toolkit";
import { loadSlice, cleanupSlice } from "../storePersistence";
import _ from "lodash";

export const ANIMATION_STATE = {
  PLAYING: "playing",
  PAUSED: "paused",
  STOPPED: "stopped",
};

export const defaultSequence = {
  tracks: [],
  isPlaying: false,
  animationState: ANIMATION_STATE.STOPPED,
};

let initialState = cleanupSlice(loadSlice("currentSequence"), defaultSequence);
initialState.isPlaying = false;
initialState.animationState = ANIMATION_STATE.STOPPED;

const getUniqueId = (state) => {
  // get unique id per sequence
  let id = 0;
  let ids = state.tracks.map((track) => track.id);
  while (ids.indexOf(id) !== -1) {
    id++;
  }

  return id;
};

export const currentSequenceSlice = createSlice({
  name: "currentSequence",
  initialState: initialState || defaultSequence,
  reducers: {
    setTracks: (state, action) => {
      state.tracks = action.payload;
    },
    removeTrack: (state, action) => {
      let idx = _.findIndex(state.tracks, (o) => o.id === action.payload.id);
      if (idx === -1) return;

      state.tracks.splice(idx, 1);
    },
    moveTrackRight: (state, action) => {
      let idx = _.findIndex(state.tracks, (o) => o.id === action.payload.id);
      if (idx === -1) return;

      if (idx >= state.tracks.length - 1) return;
      let track = state.tracks.splice(idx, 1);
      state.tracks.splice(idx + 1, 0, track[0]);
    },
    moveTrackLeft: (state, action) => {
      let idx = _.findIndex(state.tracks, (o) => o.id === action.payload.id);
      if (idx <= 0) return;

      let track = state.tracks.splice(idx, 1);
      state.tracks.splice(idx - 1, 0, track[0]);
    },
    setTrack: (state, action) => {
      let idx = _.findIndex(state.tracks, (o) => o.id === action.payload.id);
      if (idx === -1) return;

      state.tracks[idx] = _.cloneDeep(action.payload.track);
      state.tracks[idx].empty = false;
      state.tracks[idx].id = -1; // unset id

      state.tracks[idx].id = getUniqueId(state);
    },
    addTrack: (state, action) => {
      state.tracks.push({
        empty: true,
        id: getUniqueId(state),
      });
    },
    setIsPlaying: (state, action) => {
      state.isPlaying = action.payload;
    },
    setAnimationState: (state, action) => {
      state.animationState = action.payload;
    },
    clearSequence: (state) => {
      state.tracks = [];
    },
  },
});

export const {
  setTracks,
  removeTrack,
  moveTrackRight,
  moveTrackLeft,
  setTrack,
  addTrack,
  clearSequence,
  setIsPlaying,
  setAnimationState,
} = currentSequenceSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectCurrentSequence = (state) => state.currentSequence;
export const selectCurrentTracks = (state) => state.currentSequence.tracks;
export const selectIsPlaying = (state) => state.currentSequence.isPlaying;
export const selectAnimationState = (state) =>
  state.currentSequence.animationState;

export default currentSequenceSlice.reducer;
