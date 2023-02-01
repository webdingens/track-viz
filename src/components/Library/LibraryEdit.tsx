import {
  ChangeEvent,
  ForwardedRef,
  forwardRef,
  PropsWithoutRef,
  useImperativeHandle,
  useState,
} from "react";

import { LibraryData } from "../../types/LibraryData";
import RichtextEditor from "./RichtextEditor";
import SequencesEditor from "./SequencesEditor";

export type ForwardedRefType = {
  getValue: () => LibraryData | null;
};

type LibraryEditProps = PropsWithoutRef<{
  data: LibraryData;
}>;

function LibraryEdit({
  data,
  forwardedRef,
}: LibraryEditProps & {
  forwardedRef: ForwardedRef<ForwardedRefType>;
}) {
  const [currentTitle, setCurrentTitle] = useState(data.title ?? "");
  const [currentDescription, setCurrentDescription] = useState(
    data.description ?? ""
  );
  const [currentSequences, setCurrentSequences] = useState(data.sequences);

  const onChangeTitle = (evt: ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    setCurrentTitle(value);
  };

  useImperativeHandle(forwardedRef, () => {
    return {
      getValue() {
        const title = currentTitle;
        const description = currentDescription;
        const sequences = currentSequences;
        return {
          ...data,
          title,
          description,
          sequences,
        };
      },
    };
  });

  return (
    <div>
      <h2>Library (Edit Mode)</h2>
      <p>Do not reload page while in edit mode.</p>
      <section>
        <label htmlFor="library-title">Title</label>
        <input
          type="text"
          id="library-title"
          defaultValue={currentTitle}
          onChange={onChangeTitle}
          placeholder="Library Title"
        />
      </section>
      <section>
        <h3>Description</h3>
        <RichtextEditor
          content={currentDescription}
          onUpdate={(markup) => setCurrentDescription(markup)}
        />
      </section>
      <section>
        <h3>Sequences</h3>
        <SequencesEditor
          sequences={currentSequences}
          onUpdate={(sequences) => setCurrentSequences(sequences)}
        />
      </section>
    </div>
  );
}

export default forwardRef<ForwardedRefType, LibraryEditProps>((props, ref) => {
  return <LibraryEdit {...props} forwardedRef={ref} />;
});
