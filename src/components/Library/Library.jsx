import { useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  selectLibrary,
  setAll as setAllStore,
} from "../../app/reducers/currentLibrarySlice";
import {
  selectLibraryInEditMode,
  setLibraryInEditMode,
} from "../../app/reducers/currentTransientsSlice";
import LibraryView from "./LibraryView";
import LibraryEdit from "./LibraryEdit";
import styles from "./Library.module.scss";
import ExportLibraryButton from "../ExportButton/ExportLibraryButton";
import ImportLibraryField from "../ImportField/ImportLibraryField";

function Library() {
  const dispatch = useDispatch();
  const inEditMode = useSelector(selectLibraryInEditMode);
  const LibraryEditRef = useRef(null);

  // data from store
  const libraryData = useSelector(selectLibrary);

  // toggling edit mode, save when leaving edit mode
  const toggleSaveEditMode = () => {
    if (inEditMode) {
      const library = LibraryEditRef.current?.getValue();
      if (library) dispatch(setAllStore(library));
    }

    dispatch(setLibraryInEditMode(!inEditMode));
  };

  // cancel editing, undoing any changes
  const cancelEditMode = () => {
    dispatch(setLibraryInEditMode(false));
  };

  return (
    <div className={styles.library}>
      {inEditMode ? (
        <LibraryEdit data={libraryData} ref={LibraryEditRef} />
      ) : (
        <LibraryView data={libraryData} />
      )}
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
