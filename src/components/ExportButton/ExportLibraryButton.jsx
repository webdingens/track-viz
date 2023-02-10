import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import _ from "lodash";
import sanitize from "sanitize-filename";

import { selectLibrary } from "../../app/reducers/currentLibrarySlice";
import {
  EXPORT_VERSION,
  EXPORT_TYPES,
  cleanupExportData,
} from "../../app/io/export";
import { useDataToBlobUrl } from "../../utils/hooks";

import styles from "./ExportLibraryButton.module.scss";

const ExportLibraryButton = ({ children, buttonClassName }) => {
  const storeData = useSelector(selectLibrary);
  const [updating, setUpdating] = useState(false);
  const [url, setData] = useDataToBlobUrl(storeData);
  const debounced = useRef();

  const createUrl = useCallback(
    (storeData) => {
      let dataCopy = _.cloneDeep(storeData);

      dataCopy.version = EXPORT_VERSION;
      dataCopy.type = EXPORT_TYPES.LIBRARY;

      const data = cleanupExportData(dataCopy);
      data.editedAt = Date.now();

      setData(data);
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
    debounced.current = createUrlThrottled(storeData);
    return () => {
      if (debounced.current) debounced.current.cancel();
    };
  }, [storeData, createUrlThrottled]);

  const href = updating ? "" : url;

  const title = useMemo(() => {
    if (!storeData.title) return null;
    return sanitize(storeData.title);
  }, [storeData.title]);

  return (
    <a
      href={href}
      className={[buttonClassName, styles.ExportButton].join(" ")}
      download={title ? `${title}.json` : "TrackViz_LibraryExport.json"}
      style={{
        cursor: updating ? "progress" : "",
      }}
    >
      {children}
    </a>
  );
};

export default ExportLibraryButton;
