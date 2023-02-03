import React from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectLibrary,
  setAll as setAllStore,
} from "../../app/reducers/currentLibrarySlice";
import {
  selectEditedLibrary,
  setAll as setAllEditedStore,
} from "../../app/reducers/editedLibrarySlice";
import {
  selectLibraryInEditMode,
  setLibraryInEditMode,
} from "../../app/reducers/interactionStateSlice";
import LibraryView from "./LibraryView";
import styles from "./Library.module.scss";
import ExportLibraryButton from "../ExportButton/ExportLibraryButton";
import ImportLibraryField from "../ImportField/ImportLibraryField";

const LibraryEdit = React.lazy(() => import("./LibraryEdit"));

function Library() {
  const dispatch = useDispatch();
  const inEditMode = useSelector(selectLibraryInEditMode);

  // data from store
  const libraryData = useSelector(selectLibrary);
  const editedLibraryData = useSelector(selectEditedLibrary);

  // toggling edit mode, save when leaving edit mode
  const toggleSaveEditMode = () => {
    if (inEditMode) {
      dispatch(setAllStore(editedLibraryData));
    } else {
      // sync currentLibrary to editedLibrary
      dispatch(setAllEditedStore(libraryData));
    }

    dispatch(setLibraryInEditMode(!inEditMode));
  };

  // cancel editing, undoing any changes
  const cancelEditMode = () => {
    dispatch(setLibraryInEditMode(false));
  };

  return (
    <div className={styles.library}>
      {inEditMode ? <LibraryEdit /> : <LibraryView />}
      <div className={styles.controls}>
        <button type="button" onClick={toggleSaveEditMode}>
          {inEditMode ? "Save Library Changes" : "Edit Library"}
        </button>
        {inEditMode ? (
          <button type="button" onClick={cancelEditMode}>
            Cancel Library Changes
          </button>
        ) : (
          <>
            <ExportLibraryButton>Export Library (save as)</ExportLibraryButton>
            <ImportLibraryField>Load Library</ImportLibraryField>
          </>
        )}
      </div>
    </div>
  );
}

Library.displayName = "Library";

export default Library;
