import { createSlice } from "@reduxjs/toolkit";
import { loadSlice, cleanupSlice } from "../storePersistence";

import { LibraryData } from "../../types/LibraryData";

export const defaultLibrary: LibraryData = {
  title: "",
  description: "",
  sequences: [],
};

let initialState = cleanupSlice(
  loadSlice("currentLibrary"),
  defaultLibrary
) as LibraryData;

export const currentTrackSlice = createSlice({
  name: "currentLibrary",
  initialState: initialState || defaultLibrary,
  reducers: {
    setDescription: (state, action) => {
      state.description = action.payload;
    },
    setSequences: (state, action) => {
      state.sequences = action.payload;
    },
    setAll: (state, action) => {
      state.description = action.payload.description;
      state.sequences = action.payload.sequences;
      state.title = action.payload.title;
    },
    reset: (state) => {
      state.description = "";
      state.sequences = [];
    },
  },
});

export const { setDescription, setSequences, setAll, reset } =
  currentTrackSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectLibrary = (state: { currentLibrary: LibraryData }) =>
  state.currentLibrary;
export const selectDescription = (state: { currentLibrary: LibraryData }) =>
  state.currentLibrary.description;
export const selectSequences = (state: { currentLibrary: LibraryData }) =>
  state.currentLibrary.sequences;

export default currentTrackSlice.reducer;
