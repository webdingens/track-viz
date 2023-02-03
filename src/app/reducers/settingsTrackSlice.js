import { createSlice } from "@reduxjs/toolkit";

import {
  loadSlice,
  cleanupSlice,
  loadSettingsFromQueryString,
} from "../storePersistence";

export const TRACK_ORIENTATIONS = {
  ORIENTATION_0_DEG: 0,
  ORIENTATION_90_DEG: 90,
  ORIENTATION_180_DEG: 180,
  ORIENTATION_270_DEG: 270,
};

export const TRACK_VIEWS = {
  FULL: "FULL",
  TRACK: "TRACK",
  START: "START",
};

export const VIEW_LABELS = {
  FULL: "Full",
  TRACK: "Track",
  START: "Start",
};

const defaultSettings = {
  orientation: TRACK_ORIENTATIONS.ORIENTATION_0_DEG,
  view: TRACK_VIEWS.FULL,
};

let initialState = cleanupSlice(loadSlice("settings.track"), defaultSettings);
loadSettingsFromQueryString(initialState);

export const settingsTrackSlice = createSlice({
  name: "settingsTrack",
  initialState: initialState || defaultSettings,
  reducers: {
    setOrientation: (state, action) => {
      if (Object.values(TRACK_ORIENTATIONS).indexOf(action.payload) !== -1)
        state.orientation = action.payload;
    },
    setView: (state, action) => {
      if (Object.values(TRACK_VIEWS).indexOf(action.payload) !== -1)
        state.view = action.payload;
    },
    reset: (state) => {
      for (let key in state) {
        delete state[key];
      }
      Object.assign(state, defaultSettings);
    },
  },
});

export const { setOrientation, setView, reset } = settingsTrackSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectTrackSettings = (state) => state.settings.track;
export const selectTrackOrientation = (state) =>
  state.settings.track.orientation;
export const selectTrackView = (state) => state.settings.track.view;

export default settingsTrackSlice.reducer;
