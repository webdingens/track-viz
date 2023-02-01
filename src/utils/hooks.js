import { useCallback, useEffect, useRef, useState } from "react";

/* Custom Hook Converts an Object and generates a JSON file as Blob Url */
export const useDataToBlobUrl = (initialData = {}) => {
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
