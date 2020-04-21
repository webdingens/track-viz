import { createSlice } from '@reduxjs/toolkit';

import { defaultSkaters } from '../../data/defaultSkaters.json';

export const TRACK_ORIENTATIONS = {
  ORIENTATION_0_DEG: 0,
  ORIENTATION_90_DEG: 90,
  ORIENTATION_180_DEG: 180,
  ORIENTATION_270_DEG: 270
}

export const currentTrackSlice = createSlice({
  name: 'currentTrack',
  initialState: {
    skaters: defaultSkaters,
    orientation: TRACK_ORIENTATIONS.ORIENTATION_0_DEG,
    refs: []
  },
  reducers: {
    setSkaters: (state, action) => {
      state.skaters = action.payload;
    },
    setOrientation: (state, action) => {
      if (TRACK_ORIENTATIONS.keys().indexOf(action.payload) !== -1)
        state.orientation = action.payload;
    },
    setRefs: (state, action) => {
      state.refs = action.payload;
    },
  },
});

export const { setSkaters, setOrientation, setRefs } = currentTrackSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectCurrentTrack = state => state.currentTrack;
export const selectCurrentSkaters = state => state.currentTrack.skaters;

export default currentTrackSlice.reducer;
