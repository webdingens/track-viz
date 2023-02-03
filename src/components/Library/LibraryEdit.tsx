import { ChangeEvent, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectEditedLibrary,
  setAll as setAllEditedStore,
} from "../../app/reducers/editedLibrarySlice";

import { LibraryData } from "../../types/LibraryData";
import CirclePreview from "../Skater/CirclePreview";
import RichtextEditor from "./RichtextEditor";
import SequencesEditor from "./SequencesEditor";

function LibraryEdit() {
  const data = useSelector(selectEditedLibrary);
  const dispatch = useDispatch();

  const [currentTitle, setCurrentTitle] = useState(data.title ?? "");
  const [currentDescription, setCurrentDescription] = useState(
    data.description ?? ""
  );
  const [currentSequences, setCurrentSequences] = useState(data.sequences);
  const [currentPovTeam, setCurrentPovTeam] = useState(data.povTeam ?? "A");

  const onChangeTitle = (evt: ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    setCurrentTitle(value);
  };

  const onChangePovTeam = (evt: ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    if (value === "A" || value === "B" || value === "None") {
      setCurrentPovTeam(value);
    } else {
      throw new Error("Wrong value provided");
    }
  };

  useEffect(() => {
    dispatch(
      setAllEditedStore({
        title: currentTitle,
        description: currentDescription,
        sequences: currentSequences,
        povTeam: currentPovTeam,
      })
    );
  }, [currentTitle, currentDescription, currentSequences, currentPovTeam]);

  return (
    <div>
      <h2>Library (Edit Mode)</h2>
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
        <h3>Written from point of view of</h3>
        <label>
          <input
            type="radio"
            name="povTeam"
            value="A"
            checked={currentPovTeam === "A"}
            onChange={onChangePovTeam}
            title="Team A"
          />

          <CirclePreview team="A" />
        </label>
        <label>
          <input
            type="radio"
            name="povTeam"
            value="B"
            checked={currentPovTeam === "B"}
            onChange={onChangePovTeam}
            title="Team B"
          />
          <CirclePreview team="B" />
        </label>
        <label>
          <input
            type="radio"
            name="povTeam"
            value="None"
            checked={currentPovTeam === "None"}
            onChange={onChangePovTeam}
            title="None"
          />
          None
        </label>
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

export default LibraryEdit;
