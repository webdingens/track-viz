import { createSlice } from "@reduxjs/toolkit";

import { loadSlice, cleanupSlice } from "../storePersistence";

const defaultCamera = {
  position: [0, 1.7, 11],
  rotation: [20, 0, 0, "XYZ"],
};

const defaultControls = {
  target: [0, 0, 0],
};

export const EYE_HEIGHT_MIN = 0.7;
export const EYE_HEIGHT_MAX = 2.5;
export const EYE_HEIGHT_STEP = 0.1;

export const GAMEPAD_THRESHOLD_MIN = 0;
export const GAMEPAD_THRESHOLD_MAX = 0.5;
export const GAMEPAD_THRESHOLD_STEP = 0.01;

export const CONTROL_MODES = {
  FIRST_PERSON: "First Person",
  MAP: "Map",
  DRAG: "Drag",
  GAMEPAD: "Gamepad",
};

export const MODEL_TYPES = {
  SPHERE: "sphere",
  CYLINDER: "cylinder",
  HELMET: "helmet",
  HUMAN: "human",
};

const defaultSettings = {
  camera: defaultCamera,
  controlMode: CONTROL_MODES.MAP,
  controls: defaultControls,
  // TODO: initial value should be undefined as we haven't checked it yet
  vrSupport: true, // should support VR
  vrModeEnabled: false,
  vrSessionRunning: false,
  mapControlsDampingEnabled: false,
  graphicsQuality: 0.6, // 60%
  useModelType: MODEL_TYPES.HELMET,
  showWalls: false,
  useTextures: false,
  eyeHeight: 1.7,
  gamepadThreshold: 0.3,
};

// TODO: add ignore vr properties by using Object assign
let initialState = cleanupSlice(loadSlice("settings.track3D"), defaultSettings);
initialState.vrModeEnabled = false; // don't start in VR Mode

export const settingsTrack3DSlice = createSlice({
  name: "settingsTrack3D",
  initialState: initialState || defaultSettings,
  reducers: {
    setControlMode: (state, action) => {
      state.controlMode = action.payload;
    },
    setCamera: (state, action) => {
      state.camera = action.payload;
    },
    setControls: (state, action) => {
      state.controls = action.payload;
    },
    setVRSupport: (state, action) => {
      state.vrSupport = action.payload;
    },
    setVRModeEnabled: (state, action) => {
      state.vrModeEnabled = action.payload;
    },
    setVRSessionRunning: (state, action) => {
      state.vrSessionRunning = action.payload;
    },
    setMapControlsDampingEnabled: (state, action) => {
      state.mapControlsDampingEnabled = action.payload;
    },
    setGraphicsQuality: (state, action) => {
      state.graphicsQuality = action.payload;
    },
    setUseModelType: (state, action) => {
      state.useModelType = action.payload;
    },
    setShowWalls: (state, action) => {
      state.showWalls = action.payload;
    },
    setUseTextures: (state, action) => {
      state.useTextures = action.payload;
    },
    setSetting: (state, action) => {
      const { key, value } = action.payload;
      state[key] = value;
    },
    reset: (state) => {
      for (let key in state) {
        delete state[key];
      }
      Object.assign(state, defaultSettings);
    },
    resetCamera: (state) => {
      // TODO: check if we need to have two different
      // default camera positions depending on CONTROL_MODE
      state.camera = defaultCamera;
    },
  },
});

export const {
  setControlMode,
  setCamera,
  setControls,
  setVRModeEnabled,
  setVRSessionRunning,
  reset,
  resetCamera,
  setMapControlsDampingEnabled,
  setGraphicsQuality,
  setUseModelType,
  setShowWalls,
  setUseTextures,
  setSetting,
} = settingsTrack3DSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectTrack3DSettings = (state) => state.settings.track3D;
export const selectTrack3DCamera = (state) => state.settings.track3D.camera;
export const selectTrack3DControlMode = (state) =>
  state.settings.track3D.controlMode;
export const selectTrack3DControls = (state) => state.settings.track3D.controls;
export const selectTrack3DVRSupport = (state) =>
  state.settings.track3D.vrSupport;
// TODO: shouldn't be part of the localStorage
export const selectTrack3DVRSessionRunning = (state) =>
  state.settings.track3D.vrSessionRunning;
export const selectTrack3DVRModeEnabled = (state) =>
  state.settings.track3D.vrModeEnabled;
export const selectTrack3DMapControlsDampingEnabled = (state) =>
  state.settings.track3D.mapControlsDampingEnabled;
export const selectTrack3DGraphicsQuality = (state) =>
  state.settings.track3D.graphicsQuality;
export const selectTrack3DUseModelType = (state) =>
  state.settings.track3D.useModelType;
export const selectTrack3DShowWalls = (state) =>
  state.settings.track3D.showWalls;
export const selectTrack3DUseTextures = (state) =>
  state.settings.track3D.useTextures;

export default settingsTrack3DSlice.reducer;
