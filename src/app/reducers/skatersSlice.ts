import { createSlice } from "@reduxjs/toolkit";
import PropTypes from "prop-types";

import defaultSkatersData from "../../data/defaultSkaters.json";

const defaultSkaters = defaultSkatersData.defaultSkaters as SkaterType[];

// TODO: do we need this? Only for importing/using imported values from an API (or older json files, files that might have been tempered with)
// TODO: When does hasFocus come into play? Should be part of the currentTrackSlice
export const skaterPropTypes = PropTypes.exact({
  id: PropTypes.number.isRequired,
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  rotation: PropTypes.number.isRequired,
  team: PropTypes.oneOf(["A", "B"]).isRequired,
  hasFocus: PropTypes.bool,
  isPivot: PropTypes.bool,
  isJammer: PropTypes.bool,
});

type SkaterDataType = {
  id: number
  x: number
  y: number
  rotation: number
  team: "A" | "B"
  isPivot?: boolean
  isJammer?: boolean
}

type SkaterStateType = {
  hasFocus?: boolean
}

export type SkaterType = SkaterDataType & SkaterStateType

export const skatersSlice = createSlice({
  name: "skaters",
  initialState: {
    value: defaultSkaters,
  },
  reducers: {},
});

export const {} = skatersSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectSkaters = (state: { skaters: { value: SkaterType[] }}) => state.skaters.value;

export default skatersSlice.reducer;
