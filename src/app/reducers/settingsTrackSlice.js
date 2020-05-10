import { createSlice } from '@reduxjs/toolkit';

import { loadSlice, cleanupSlice } from '../storePersistence';

export const TRACK_ORIENTATIONS = {
  ORIENTATION_0_DEG: 0,
  ORIENTATION_90_DEG: 90,
  ORIENTATION_180_DEG: 180,
  ORIENTATION_270_DEG: 270
}

const defaultSettings = {
  orientation: TRACK_ORIENTATIONS.ORIENTATION_0_DEG,
};

let initialState = cleanupSlice(
  loadSlice('settings.track'),
  defaultSettings
);

export const settingsTrackSlice = createSlice({
  name: 'settingsTrack',
  initialState: initialState || defaultSettings,
  reducers: {
    setOrientation: (state, action) => {
      if (TRACK_ORIENTATIONS.keys().indexOf(action.payload) !== -1)
        state.orientation = action.payload;
    },
    reset: (state) => {
      state = {...defaultSettings};
    },
  },
});

export const { setTrackEditorVisibility, setTrackVisibility, reset } = settingsTrackSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectTrackSettings = state => state.settings.track;

export default settingsTrackSlice.reducer;