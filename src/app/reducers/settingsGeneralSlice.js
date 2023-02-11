import { createSlice } from "@reduxjs/toolkit";

import {
  loadSlice,
  cleanupSlice,
  loadSettingsFromQueryString,
} from "../storePersistence";
import { PACK_MEASURING_METHODS } from "../../utils/packFunctions";

export const LAYOUT_MODES = {
  LAYOUT_TRACK: "LAYOUT_TRACK",
  LAYOUT_3D: "LAYOUT_3D",
  LAYOUT_TRACK_3D: "LAYOUT_TRACK_3D",
  LAYOUT_TRACK_LIBRARY: "LAYOUT_TRACK_LIBRARY",
};

const defaultSettings = {
  trackEditorVisible: true,
  track3DVisible: false,
  libraryVisible: false,
  settingsVisible: false,
  layoutMode: LAYOUT_MODES.LAYOUT_TRACK,

  // options

  // pack
  packMeasuringMethod: PACK_MEASURING_METHODS.RECTANGLE,
  showEngagementZoneOtherMethod: false,
  showPackMethodDuringRectangleMethod: PACK_MEASURING_METHODS.SECTOR,
  showEngagementZoneAllSkaterRectangles: false,
  showEngagementZoneEndRectangles: false,
  showPackEndRectangles: false,
  showAllClosestBlockerRectangles: false,

  // colors
  colorTeamA: {
    h: 0,
    s: 0.7345971563981044,
    l: 0.4137254901960784,
    a: 1,
  },
  colorTeamB: {
    h: 122.79069767441861,
    s: 0.43434343434343436,
    l: 0.38823529411764707,
    a: 1,
  },
};

let initialState = cleanupSlice(loadSlice("settings.general"), defaultSettings);
loadSettingsFromQueryString(initialState);

export const settingsGeneralSlice = createSlice({
  name: "settingsGeneral",
  initialState: initialState || defaultSettings,
  reducers: {
    setTrackEditorVisibility: (state, action) => {
      state.trackEditorVisible = action.payload;
    },
    setTrack3DVisibility: (state, action) => {
      state.track3DVisible = action.payload;
    },
    setLayoutMode: (state, action) => {
      switch (action.payload) {
        case LAYOUT_MODES.LAYOUT_TRACK:
          state.trackEditorVisible = true;
          state.track3DVisible = false;
          state.libraryVisible = false;
          break;
        case LAYOUT_MODES.LAYOUT_3D:
          state.trackEditorVisible = false;
          state.track3DVisible = true;
          state.libraryVisible = false;
          break;
        case LAYOUT_MODES.LAYOUT_TRACK_3D:
          state.trackEditorVisible = true;
          state.track3DVisible = true;
          state.libraryVisible = false;
          break;
        case LAYOUT_MODES.LAYOUT_TRACK_LIBRARY:
          state.trackEditorVisible = true;
          state.track3DVisible = false;
          state.libraryVisible = true;
          break;
      }
      state.layoutMode = action.payload;
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
  },
});

export const {
  setTrackEditorVisibility,
  setTrack3DVisibility,
  setLayoutMode,
  setSetting,
  reset,
} = settingsGeneralSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectGeneralSettings = (state) => state.settings.general;

export const selectLayoutMode = (state) => state.settings.general.layoutMode;

export default settingsGeneralSlice.reducer;
