import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import _ from "lodash";

import { FiDownloadCloud } from "react-icons/fi";

import { selectCurrentTrack } from "../../app/reducers/currentTrackSlice";
import { EXPORT_VERSION, EXPORT_TYPES } from "../../app/io/export";

import styles from "./ExportButton.module.scss";

/* Custom Hook Converts an Object and generates a JSON file as Blob Url */
const useDataToBlobUrl = (initialData = {}) => {
  const [data, setData] = useState(initialData);
  const [url, setUrl] = useState("");
  const blobUrl = useRef(null);

  const getBlob = useCallback((data) => {
    let json = JSON.stringify(data);
    const blob = new Blob([json], { type: "octet/stream" });

    return window.URL.createObjectURL(blob);
  }, []);

  /* cleanup after url was created */
  useEffect(() => {
    // create new Blob
    blobUrl.current = getBlob(data);
    setUrl(blobUrl.current);

    return () => {
      if (blobUrl.current) {
        URL.revokeObjectURL(blobUrl.current);
        blobUrl.current = null;
      }
    };
  }, [data, getBlob]);

  return [url, setData];
};

const ExportButton = () => {
  const currentTrack = useSelector(selectCurrentTrack);
  const [updating, setUpdating] = useState(false);
  const [url, setData] = useDataToBlobUrl(currentTrack);
  const debounced = useRef();

  const createUrl = useCallback(
    (currentTrack) => {
      let currentTrackCopy = _.cloneDeep(currentTrack);

      currentTrackCopy.version = EXPORT_VERSION;
      currentTrackCopy.type = EXPORT_TYPES.SINGLE_TRACK;

      setData(currentTrackCopy);
      setUpdating(false);
    },
    [setData]
  );

  const createUrlThrottled = useMemo(
    () => _.debounce(createUrl, 1200),
    [createUrl]
  );

  useEffect(() => {
    setUpdating(true);
    debounced.current = createUrlThrottled(currentTrack);
    return () => {
      if (debounced.current) debounced.current.cancel();
    };
  }, [currentTrack, createUrlThrottled]);

  const href = updating ? "" : url;

  return (
    <a
      href={href}
      className={styles.ExportButton}
      download="TrackVizExport.json"
      style={{
        cursor: updating ? "progress" : "",
      }}
    >
      <FiDownloadCloud /> Export (Save Link As)
    </a>
  );
};

export default ExportButton;
