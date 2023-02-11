import { useCallback, useState } from "react";
import Preview from "./Preview";

import styles from "./SequenceEditor.module.scss";

const SequenceEditor = () => {
  const [state, setState] = useState({
    activeTrack: null,
    previews: [],
  });

  const onPreviewShown = useCallback((id) => {
    setState((state) => {
      let previews = state.previews.filter((preview) => preview.id !== id);
      return {
        ...state,
        previews,
      };
    });
  }, []);

  return (
    <div className={styles.SequenceEditor}>
      <div>
        {state.previews.map((preview) => (
          <Preview
            key={preview.id}
            onShown={() => onPreviewShown(preview.id)}
            {...preview}
          />
        ))}
      </div>
    </div>
  );
};

export default SequenceEditor;
