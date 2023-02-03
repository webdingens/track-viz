import { useEffect, useRef, useState } from "react";
import { useDispatch } from "react-redux";
import { EXPORT_TYPES } from "../../app/io/export";
import { convertToCurrentVersion } from "../../app/io/import";
import { defaultLibrary, setAll } from "../../app/reducers/currentLibrarySlice";
import {
  LAYOUT_MODES,
  setLayoutMode,
} from "../../app/reducers/settingsGeneralSlice";
import { cleanupSlice } from "../../app/storePersistence";
import styles from "./QueryLoader.module.scss";

function QueryLoader() {
  const [showDialog, setShowDialog] = useState(false);
  const [allowFetch, setAllowFetch] = useState(false);
  const libraryFileName = useRef(null);
  const dispatch = useDispatch();

  useEffect(() => {
    let query = location.search;
    if (query?.length && query[0] === "?") query = query.slice(1);
    query = query.split("&");
    query = query.map((entry) => entry.split("="));
    query = query.filter(
      (entry) => entry?.length === 2 && entry[0] === "load_library"
    );
    if (query.length) {
      // library query now in array
      libraryFileName.current = query[0][1];
      setShowDialog(true);
    }
  }, []);

  useEffect(() => {
    if (!allowFetch) return;
    let mounted = true;
    try {
      fetch(libraryFileName.current)
        .then((res) => {
          if (!res.ok) throw new Error("response wrong");
          return res.json();
        })
        .then((data) => {
          if (!mounted) return;

          let convertedData = convertToCurrentVersion(data);

          if (convertedData.type !== EXPORT_TYPES.LIBRARY) {
            throw new Error("Wrong type");
          }

          let loadedState = cleanupSlice(convertedData, defaultLibrary);

          dispatch(setAll(loadedState));
          dispatch(setLayoutMode(LAYOUT_MODES.LAYOUT_TRACK_LIBRARY));
        });
    } catch (err) {
      console.error("There has been an error: ", err.message);
    }
    return () => {
      mounted = false;
    };
  }, [allowFetch]);

  const onChange = (evt) => {
    if (evt.currentTarget.returnValue === "confirm") {
      setAllowFetch(true);
    }
    window.history.pushState({}, document.title, "/");
  };

  if (!showDialog) return null;
  return (
    <dialog open onClose={onChange} className={styles.queryLoader}>
      <p>Do you want to load the following library file:</p>
      <p>
        <i>{libraryFileName.current}</i>
      </p>
      <p>Warning: will replace current library file and any changes therein.</p>
      <form method="dialog">
        <button value="cancel">Cancel</button>
        <button value="confirm">Confirm</button>
      </form>
    </dialog>
  );
}

export default QueryLoader;
