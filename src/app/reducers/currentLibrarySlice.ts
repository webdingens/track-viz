import { createSlice } from "@reduxjs/toolkit";
import { loadSlice, cleanupSlice } from "../storePersistence";

import { LibraryData } from "../../types/LibraryData";

export const defaultLibrary: LibraryData = {
  title: "",
  description: "",
  povTeam: "None",
  sequences: [],
};

export const libraryReducerFuctions = {
  setAll: (state: LibraryData, action: { payload: {} }) => {
    Object.assign(state, action.payload);
  },
  reset: (state: LibraryData) => {
    for (let key in state) {
      delete state[key];
      Object.assign(state, defaultLibrary);
    }
  },
};

let initialState = cleanupSlice(
  loadSlice("currentLibrary"),
  defaultLibrary
) as LibraryData;

export const currentLibrarySlice = createSlice({
  name: "currentLibrary",
  initialState: initialState || defaultLibrary,
  reducers: libraryReducerFuctions,
});

export const { setAll, reset } = currentLibrarySlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectLibrary = (state: { currentLibrary: LibraryData }) =>
  state.currentLibrary;

export default currentLibrarySlice.reducer;
