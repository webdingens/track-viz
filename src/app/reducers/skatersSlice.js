import { createSlice } from '@reduxjs/toolkit';
import PropTypes from 'prop-types';

import { defaultSkaters } from '../../data/defaultSkaters.json';

export const skaterPropTypes = PropTypes.exact({
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  rotation: PropTypes.number.isRequired,
  team: PropTypes.oneOf(['A', 'B']).isRequired,
  hasFocus: PropTypes.bool,
  isPivot: PropTypes.bool,
  isJammer: PropTypes.bool
});

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
