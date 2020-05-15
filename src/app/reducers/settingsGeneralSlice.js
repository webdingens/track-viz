import { createSlice } from '@reduxjs/toolkit';

import { loadSlice, cleanupSlice } from '../storePersistence';

const defaultSettings = {
  trackEditorVisible: true,
  track3DVisible: false,
  sequenceEditorVisible: true,
};

let initialState = cleanupSlice(
  loadSlice('settings.general'),
  defaultSettings
);

export const settingsGeneralSlice = createSlice({
  name: 'settingsGeneral',
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
    reset: (state) => {
      state = {...defaultSettings};
    },
  },
});

export const { setTrackEditorVisibility, setTrack3DVisibility, setSequenceEditorVisibility, reset } = settingsGeneralSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectGeneralSettings = state => state.settings.general;

export default settingsGeneralSlice.reducer;
