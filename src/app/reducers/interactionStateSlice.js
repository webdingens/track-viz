import { createSlice } from "@reduxjs/toolkit";
import { cleanupSlice, loadSlice } from "../storePersistence";

export const defaultInteractionState = {
  userIsInteractingWithTrack3D: false,
  touchEnabledDevice: false,
  mapControlsRotateMode: false,
  touchOnRotateModeButton: -1,
  libraryInEditMode: false,
};

let initialState = cleanupSlice(
  loadSlice("interactionState"),
  defaultInteractionState
);

const doNotLoadFields = [
  "userIsInteractingWithTrack3D",
  "mapControlsRotateMode",
  "touchOnRotateModeButton",
];

doNotLoadFields.forEach(
  (key) => initialState[key] === defaultInteractionState[key]
);

export const interactionStateSlice = createSlice({
  name: "interactionState",
  initialState: initialState || defaultInteractionState,
  reducers: {
    setUserIsInteractingWithTrack3D: (state, action) => {
      state.userIsInteractingWithTrack3D = action.payload;
    },
    setTouchEnabledDevice: (state, action) => {
      state.touchEnabledDevice = action.payload;
    },
    setMapControlsRotateMode: (state, action) => {
      state.mapControlsRotateMode = action.payload;
    },
    setTouchOnRotateModeButton: (state, action) => {
      state.touchOnRotateModeButton = action.payload;
    },
    setLibraryInEditMode: (state, action) => {
      state.libraryInEditMode = action.payload;
    },
    reset: (state) => {
      for (let key in state) {
        delete state[key];
      }
      Object.assign(state, defaultInteractionState);
    },
  },
});

export const {
  setUserIsInteractingWithTrack3D,
  setTouchEnabledDevice,
  setMapControlsRotateMode,
  setTouchOnRotateModeButton,
  setLibraryInEditMode,
  reset,
} = interactionStateSlice.actions;

export const selectCurrentTransients = (state) => state.interactionState;
export const selectUserIsInteractingWithTrack3D = (state) =>
  state.interactionState.userIsInteractingWithTrack3D;
export const selectTouchEnabledDevice = (state) =>
  state.interactionState.touchEnabledDevice;
export const selectMapControlsRotateMode = (state) =>
  state.interactionState.mapControlsRotateMode;
export const selectTouchOnRotateModeButton = (state) =>
  state.interactionState.touchOnRotateModeButton;
export const selectLibraryInEditMode = (state) =>
  state.interactionState.libraryInEditMode;

export default interactionStateSlice.reducer;
