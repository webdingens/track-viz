import { createSlice } from "@reduxjs/toolkit";

export const defaultTransients = {
  userIsInteractingWithTrack3D: false,
  touchEnabledDevice: false,
  mapControlsRotateMode: false,
  touchOnRotateModeButton: -1,
  libraryInEditMode: false,
};

export const currentTransientsSlice = createSlice({
  name: "currentTransients",
  initialState: defaultTransients,
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
      Object.assign(state, defaultTransients);
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
} = currentTransientsSlice.actions;

export const selectCurrentTransients = (state) => state.currentTransients;
export const selectUserIsInteractingWithTrack3D = (state) =>
  state.currentTransients.userIsInteractingWithTrack3D;
export const selectTouchEnabledDevice = (state) =>
  state.currentTransients.touchEnabledDevice;
export const selectMapControlsRotateMode = (state) =>
  state.currentTransients.mapControlsRotateMode;
export const selectTouchOnRotateModeButton = (state) =>
  state.currentTransients.touchOnRotateModeButton;
export const selectLibraryInEditMode = (state) =>
  state.currentTransients.libraryInEditMode;

export default currentTransientsSlice.reducer;
