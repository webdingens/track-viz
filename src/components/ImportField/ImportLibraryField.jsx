import { useCallback, useState } from "react";
import { useDispatch } from "react-redux";
import { cleanupSlice } from "../../app/storePersistence";
import { convertToCurrentVersion } from "../../app/io/import";
import { EXPORT_TYPES } from "../../app/io/export";

import { setAll, defaultLibrary } from "../../app/reducers/currentLibrarySlice";

import styles from "./ImportLibraryField.module.scss";
import { setLibraryModalShown } from "../../app/reducers/interactionStateSlice";

const ImportLibraryField = ({ children, buttonClassName, onLoad }) => {
  const dispatch = useDispatch();
  const [error, setError] = useState(null);

  const onFileLoadEnd = useCallback(
    (e) => {
      try {
        let data = JSON.parse(e.target.result);
        let convertedData = convertToCurrentVersion(data);

        if (convertedData.type !== EXPORT_TYPES.LIBRARY) {
          throw new Error("Wrong type");
        }

        let loadedState = cleanupSlice(convertedData, defaultLibrary);
        loadedState.loadedAt = Date.now();

        dispatch(setLibraryModalShown(false));
        dispatch(setAll(loadedState));
        if (onLoad) onLoad();
      } catch (error) {
        console.log("Error loading the file: ", error.msg);
        setError("Error loading the file: " + error.msg);
      }
    },
    [dispatch, setError]
  );

  const onChange = useCallback(
    (evt) => {
      setError(null);
      let input = evt.target;
      if (!(input.files && input.files instanceof FileList)) return;
      if (input.files.length === 0) return;

      let fr = new FileReader();
      fr.onloadend = onFileLoadEnd;
      fr.readAsText(input.files[0]);
      input.value = null;
    },
    [onFileLoadEnd, setError]
  );

  return (
    <div className={styles.importLibraryField}>
      <label className={buttonClassName}>
        <span>{children}</span>
        <input type="file" accept="application/json" onChange={onChange} />
      </label>
      {!!error && <p>{error}</p>}
    </div>
  );
};

export default ImportLibraryField;
