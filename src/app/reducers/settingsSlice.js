import { createSlice } from '@reduxjs/toolkit';

import { loadSlice } from '../storePersistence';

const defaultSettings = {
  trackEditorVisible: true,
  track3DVisible: false,
};

export const settingsSlice = createSlice({
  name: 'settings',
  initialState: loadSlice('settings') || defaultSettings,
  reducers: {
    setTrackEditorVisibility: (state, action) => {
      state.trackEditorVisible = action.payload;
    },
    setTrack3DVisibility: (state, action) => {
      state.track3DVisible = action.payload;
    },
    reset: (state) => {
      state = {...defaultSettings};
    }
  },
});

export const { setTrackEditorVisibility, setTrack3DVisibility, reset } = settingsSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectSettings = state => state.settings;

export default settingsSlice.reducer;
