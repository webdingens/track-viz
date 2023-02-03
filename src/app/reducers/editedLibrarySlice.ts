import { createSlice } from "@reduxjs/toolkit";
import { loadSlice, cleanupSlice } from "../storePersistence";

import { LibraryData } from "../../types/LibraryData";

import { libraryReducerFuctions, defaultLibrary } from "./currentLibrarySlice";

let initialState = cleanupSlice(
  loadSlice("editedLibrary"),
  defaultLibrary
) as LibraryData;

export const editedLibrarySlice = createSlice({
  name: "editedLibrary",
  initialState: initialState || defaultLibrary,
  reducers: libraryReducerFuctions,
});

export const { setAll, reset } = editedLibrarySlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state) => state.counter.value)`

export const selectEditedLibrary = (state: { editedLibrary: LibraryData }) =>
  state.editedLibrary;

export default editedLibrarySlice.reducer;
