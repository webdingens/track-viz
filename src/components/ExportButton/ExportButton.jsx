import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useSelector } from "react-redux";
import _ from "lodash";

import { selectCurrentTrack } from "../../app/reducers/currentTrackSlice";
import {
  EXPORT_VERSION,
  EXPORT_TYPES,
  cleanupExportData,
} from "../../app/io/export";
import { useDataToBlobUrl } from "../../utils/hooks";

import styles from "./ExportButton.module.scss";

const ExportButton = ({ buttonClassName, children }) => {
  const currentTrack = useSelector(selectCurrentTrack);
  const [updating, setUpdating] = useState(false);
  const [url, setData] = useDataToBlobUrl(currentTrack);
  const debounced = useRef();

  const createUrl = useCallback(
    (currentTrack) => {
      let dataCopy = _.cloneDeep(currentTrack);

      dataCopy.version = EXPORT_VERSION;
      dataCopy.type = EXPORT_TYPES.SINGLE_TRACK;

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
    debounced.current = createUrlThrottled(currentTrack);
    return () => {
      if (debounced.current) debounced.current.cancel();
    };
  }, [currentTrack, createUrlThrottled]);

  const href = updating ? "" : url;

  return (
    <a
      href={href}
      className={[styles.ExportButton, buttonClassName].join(" ")}
      download="TrackViz_TrackExport.json"
      style={{
        cursor: updating ? "progress" : "",
      }}
    >
      {children}
    </a>
  );
};

export default ExportButton;
