import { createSlice } from '@reduxjs/toolkit';

import { defaultSkaters } from '../../data/defaultSkaters.json';

export const skatersSlice = createSlice({
  name: 'skaters',
  initialState: {
    value: defaultSkaters,
  },
  reducers: {
    update: (state, action) => {
      state.value += action.payload;
    },
  },
});

export const { update } = skatersSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectSkaters = state => state.skaters.value;

export default skatersSlice.reducer;
