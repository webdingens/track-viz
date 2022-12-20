import { createSlice } from "@reduxjs/toolkit";

export const defaultTransients = {
  userIsInteractingWithTrack3D: false,
  touchEnabledDevice: false,
  mapControlsRotateMode: false,
  touchOnRotateModeButton: -1,
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
    reset: (state) => {
      state = defaultTransients;
    },
  },
});

export const {
  setUserIsInteractingWithTrack3D,
  setTouchEnabledDevice,
  setMapControlsRotateMode,
  setTouchOnRotateModeButton,
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

export default currentTransientsSlice.reducer;
