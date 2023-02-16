import React, { useCallback } from "react";
import { useDispatch } from "react-redux";
import { cleanupSlice } from "../../app/storePersistence";

import { FiUploadCloud } from "react-icons/fi";

import {
  setCurrentTrack,
  defaultTrack,
} from "../../app/reducers/currentTrackSlice";

import styles from "./ImportField.module.scss";

const ImportField = ({ buttonClassName, children }) => {
  const dispatch = useDispatch();

  const onFileLoadEnd = useCallback(
    (e) => {
      try {
        let trackData = JSON.parse(e.target.result);

        let loadedState = cleanupSlice(trackData, defaultTrack);

        dispatch(setCurrentTrack(loadedState));
      } catch (error) {
        console.log("Error loading the file: ", error.msg);
      }
    },
    [dispatch]
  );

  const onChange = useCallback(
    (evt) => {
      let input = evt.target;
      if (!(input.files && input.files instanceof FileList)) return;
      if (input.files.length === 0) return;

      let fr = new FileReader();
      fr.onloadend = onFileLoadEnd;
      fr.readAsText(input.files[0]);
      input.value = null;
    },
    [onFileLoadEnd]
  );

  return (
    <div className={styles.ImportField}>
      <label className={buttonClassName}>
        <span> {children}</span>
        <input type="file" accept="application/json" onChange={onChange} />
      </label>
    </div>
  );
};

export default ImportField;
