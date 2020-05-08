import { createSlice, createSelector } from '@reduxjs/toolkit';
import { defaultSkaters } from '../../data/defaultSkaters.json';
import { loadSlice, cleanupSlice } from '../storePersistence';
import {
  getSortedPackBoundaries,
  getPack,
  getSkatersWDPInBounds,
  getSkatersWDPInPlayPackSkater,
  getSkatersWDPPivotLineDistance,
} from '../../utils/packFunctions';


const defaultTrack = {
  skaters: defaultSkaters,
  refs: [],
};

let initialState = cleanupSlice(
  loadSlice('currentTrack'),
  defaultTrack
);

export const currentTrackSlice = createSlice({
  name: 'currentTrack',
  initialState: initialState || defaultTrack,
  reducers: {
    setSkaters: (state, action) => {
      state.skaters = action.payload;
    },
    setRefs: (state, action) => {
      state.refs = action.payload;
    },
    reset: (state) => {
      state.refs = [];
      state.skaters = defaultSkaters;
    },
  },
});

export const { setSkaters, setOrientation, setRefs, reset, resetCamera } = currentTrackSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectCurrentTrack = state => state.currentTrack;
export const selectCurrentSkaters = state => state.currentTrack.skaters;

/**
 * Current Skaters Reselection with InBounds
 */
export const selectCurrentSkatersWDPInBounds = createSelector(
  selectCurrentSkaters,
  getSkatersWDPInBounds
);

/**
 * Current Skaters Reselection with InBounds
 */
export const selectCurrentSkatersWDPPivotLineDistance = createSelector(
  selectCurrentSkatersWDPInBounds,
  getSkatersWDPPivotLineDistance
);

export const selectSortedPackBoundaries = createSelector(
  selectCurrentSkatersWDPPivotLineDistance,
  skaters => getSortedPackBoundaries(getPack(skaters))
);

/**
 * Current Skaters Reselection with derived properties
 * such as inBounds, packSkater, outOfPlay
 */
export const selectCurrentSkatersWDP = createSelector(
  selectCurrentSkatersWDPPivotLineDistance,
  selectSortedPackBoundaries,
  getSkatersWDPInPlayPackSkater
);

export default currentTrackSlice.reducer;
