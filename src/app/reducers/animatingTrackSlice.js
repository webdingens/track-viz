import { createSlice } from '@reduxjs/toolkit';

export const defaultAnimatingTrack = {
  refs: [],
  skaters: [],
  frame: 0,
}

let initialState = defaultAnimatingTrack;

export const animatingTrackSlice = createSlice({
  name: 'animatingTrack',
  initialState: initialState,
  reducers: {
    setAnimatingTrack: (state, action) => {
      state.refs = action.payload.refs;
      state.skaters = action.payload.skaters;
      state.frame++;
    },
  },
});

export const { setAnimatingTrack } = animatingTrackSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectAnimatingTrack = state => state.animatingTrack;

export default animatingTrackSlice.reducer;
