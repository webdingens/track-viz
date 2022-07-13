import { createSlice } from "@reduxjs/toolkit";

import {
  loadSlice,
  cleanupSlice,
  loadSettingsFromQueryString,
} from "../storePersistence";
import { PACK_MEASURING_METHODS } from "../../utils/packFunctions";

const defaultSettings = {
  trackEditorVisible: true,
  track3DVisible: false,
  sequenceEditorVisible: false,
  settingsVisible: false,

  // options

  // pack
  packMeasuringMethod: PACK_MEASURING_METHODS.SECTOR,
  showEngagementZoneOtherMethod: false,
  showPackMethodDuringRectangleMethod: PACK_MEASURING_METHODS.SECTOR,
  showEngagementZoneAllSkaterRectangles: false,
  showEngagementZoneEndRectangles: false,
  showPackEndRectangles: true,
  showAllClosestBlockerRectangles: false,
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
    setSequenceEditorVisibility: (state, action) => {
      state.sequenceEditorVisible = action.payload;
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
  setSequenceEditorVisibility,
  setSetting,
  reset,
} = settingsGeneralSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectGeneralSettings = (state) => state.settings.general;

export default settingsGeneralSlice.reducer;
