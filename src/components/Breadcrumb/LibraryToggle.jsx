import { useEffect, useRef, useState } from "react";
import classNames from "classnames";
import { FiBook, FiBookOpen, FiX } from "react-icons/fi";
import CirclePreview from "../Skater/CirclePreview";
import RichtextView from "../Library/RichtextView";

import styles from "./LibraryToggle.module.scss";
import buttonStyles from "../../styles/Buttons.module.scss";
import { useDispatch, useSelector } from "react-redux";
import {
  selectLibraryModalShown,
  setLibraryModalShown,
} from "../../app/reducers/interactionStateSlice";

function LibraryToggle({ library }) {
  const [modalOpen, setModalOpen] = useState(false);
  const closedFromModal = useRef(false);
  const libraryModalShown = useSelector(selectLibraryModalShown);
  const dispatch = useDispatch();

  // Open Library Description once the library changed
  useEffect(() => {
    if (!libraryModalShown) {
      setModalOpen(true);
    }
  }, [library]);

  const onCloseClick = () => {
    closedFromModal.current = true;
    setModalOpen(false);

    if (!libraryModalShown) {
      dispatch(setLibraryModalShown(true));
    }
  };

  const onToggleModal = () => {
    closedFromModal.current = false;
    setModalOpen(!modalOpen);

    if (!libraryModalShown) {
      dispatch(setLibraryModalShown(true));
    }
  };

  return (
    <div>
      <button
        onClick={onToggleModal}
        title="Toggle Library Description"
        className={classNames(buttonStyles.menuButton, styles.libraryToggle, {
          [styles.libraryClosed]: closedFromModal.current && !modalOpen,
        })}
      >
        {modalOpen ? <FiBookOpen /> : <FiBook />}
      </button>
      <div
        className={classNames(styles.modal, {
          [styles.modalOpen]: modalOpen,
        })}
      >
        <button className={styles.close} type="button" onClick={onCloseClick}>
          <FiX />
        </button>
        {!!library.title && <h2>{library.title}</h2>}
        <p className={styles.povTeam}>
          <strong>Point of view:</strong>{" "}
          {library.povTeam === "A" && <CirclePreview team="A" />}
          {library.povTeam === "B" && <CirclePreview team="B" />}
        </p>
        {!!library.description && (
          <RichtextView content={library.description} />
        )}
      </div>
    </div>
  );
}

export default LibraryToggle;
