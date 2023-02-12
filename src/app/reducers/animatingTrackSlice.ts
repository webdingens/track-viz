import { createSlice } from "@reduxjs/toolkit";
import { loadSlice, cleanupSlice } from "../storePersistence";
import _ from "lodash";
import { Situation, SITUATION_TYPES, TrackData } from "../../types/LibraryData";

export const ANIMATION_STATE = {
  PLAYING: "PLAYING",
  PAUSED: "PAUSED",
  STOPPED: "STOPPED",
} as const;

export type AnimationStateType = keyof typeof ANIMATION_STATE;

type animatingTrackState = {
  animatingTrack: TrackData | null;
  frame: number;
  isPlaying: boolean;
  animationState: AnimationStateType;
  tracks: Situation[];
};

export const defaultAnimatingTrack: animatingTrackState = {
  animatingTrack: null,
  frame: 0,
  isPlaying: false,
  animationState: ANIMATION_STATE.STOPPED,
  tracks: [],
};

const getUniqueId = (state: animatingTrackState) => {
  // get unique id per sequence
  let id = 0;
  let ids = state.tracks.map((track) => track.id);
  while (ids.indexOf(id) !== -1) {
    id++;
  }

  return id;
};

let initialState = cleanupSlice(
  loadSlice("animatingTrack"),
  defaultAnimatingTrack
) as animatingTrackState;
initialState.isPlaying = false;
initialState.animationState = ANIMATION_STATE.STOPPED;

export const animatingTrackSlice = createSlice({
  name: "animatingTrack",
  initialState: initialState || defaultAnimatingTrack,
  reducers: {
    setAnimatingTrack: (state, action: { payload: TrackData }) => {
      state.animatingTrack = action.payload;
      state.frame++;
    },
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
    addTrack: (state) => {
      state.tracks.push({
        skaters: [],
        refs: [],
        type: SITUATION_TYPES.DESCRIPTION,
        empty: true,
        id: getUniqueId(state),
      });
    },
    setIsPlaying: (state, action: { payload: boolean }) => {
      state.isPlaying = action.payload;
    },
    setAnimationState: (state, action: { payload: AnimationStateType }) => {
      state.animationState = action.payload;
    },
    clearSequence: (state) => {
      state.tracks = [];
    },
  },
});

export const {
  setAnimatingTrack,
  setTracks,
  removeTrack,
  moveTrackRight,
  moveTrackLeft,
  setTrack,
  addTrack,
  clearSequence,
  setIsPlaying,
  setAnimationState,
} = animatingTrackSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

type globalState = { animatingTrack: animatingTrackState };

export const selectAnimatingTrack = (state: globalState) =>
  state.animatingTrack.animatingTrack;
export const selectCurrentTracks = (state: globalState) =>
  state.animatingTrack.tracks;
export const selectIsPlaying = (state: globalState) =>
  state.animatingTrack.isPlaying;
export const selectAnimationState = (state: globalState) =>
  state.animatingTrack.animationState;
export const selectAnimatingSkaters = (state: globalState) =>
  state.animatingTrack.animatingTrack?.skaters;

export default animatingTrackSlice.reducer;
