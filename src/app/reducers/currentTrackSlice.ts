import { createSlice, createSelector } from "@reduxjs/toolkit";
import _ from "lodash";
import defaultSkaters from "../../data/defaultSkaters";
import { loadSlice, cleanupSlice } from "../storePersistence";
import {
  getSkatersWDPInBounds,
  getSkatersWDPInPlayPackSkater,
  getSkatersWDPPivotLineDistance,
  PACK_MEASURING_METHODS,
} from "../../utils/packFunctions";
import { TrackData } from "../../types/LibraryData";

export const defaultTrack: TrackData = {
  skaters: defaultSkaters,
  refs: [],
};

let initialState: TrackData = cleanupSlice(
  loadSlice("currentTrack") as TrackData,
  defaultTrack
);

export const currentTrackSlice = createSlice({
  name: "currentTrack",
  initialState: initialState || defaultTrack,
  reducers: {
    setSkaters: (state, action) => {
      state.skaters = action.payload;
    },
    setRefs: (state, action) => {
      state.refs = action.payload;
    },
    setCurrentTrack: (state, action) => {
      state.refs = action.payload.refs;
      state.skaters = action.payload.skaters;
    },
    updateSkater: (state, action) => {
      let { id, ...skaterData } = action.payload;
      let idx = _.findIndex(state.skaters, (o) => o.id === id);
      _.assign(state.skaters[idx], skaterData);
    },
    reset: (state) => {
      state.refs = [];
      state.skaters = defaultSkaters;
    },
  },
});

export const { setSkaters, setRefs, setCurrentTrack, updateSkater, reset } =
  currentTrackSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

type ReduxStateType = {
  currentTrack: TrackData;
};

export const selectCurrentTrack = (state: ReduxStateType) => state.currentTrack;
export const selectCurrentSkaters = (state: ReduxStateType) =>
  state.currentTrack.skaters;

/**
 * Current Skaters Reselection with InBounds
 */
export const selectCurrentSkatersWDPInBounds = createSelector(
  selectCurrentSkaters,
  getSkatersWDPInBounds
);

/**
 * Current Skaters Reselection with InBounds Properties
 */
export const selectCurrentSkatersWDPPivotLineDistance = createSelector(
  selectCurrentSkatersWDPInBounds,
  getSkatersWDPPivotLineDistance
);

/**
 * Current Skaters Reselection with derived properties
 * such as inBounds, packSkater, outOfPlay
 */
const selectCurrentSkatersWDPSector = createSelector(
  selectCurrentSkatersWDPPivotLineDistance,
  (skaters) =>
    getSkatersWDPInPlayPackSkater(skaters, {
      method: PACK_MEASURING_METHODS.SECTOR,
    })
);
const selectCurrentSkatersWDPRectangle = createSelector(
  selectCurrentSkatersWDPPivotLineDistance,
  (skaters) =>
    getSkatersWDPInPlayPackSkater(skaters, {
      method: PACK_MEASURING_METHODS.RECTANGLE,
    })
);
export const selectCurrentSkatersWDP = (
  state: ReduxStateType,
  method = PACK_MEASURING_METHODS.SECTOR
) => {
  if (method === PACK_MEASURING_METHODS.SECTOR) {
    return selectCurrentSkatersWDPSector(state);
  } else {
    return selectCurrentSkatersWDPRectangle(state);
  }
};

export default currentTrackSlice.reducer;
