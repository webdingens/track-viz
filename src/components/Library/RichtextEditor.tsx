import { PropsWithRef, useMemo, useState, useEffect } from "react";
import {
  RawDraftContentState,
  ContentState,
  convertToRaw,
  convertFromRaw,
  convertFromHTML,
} from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import "react-draft-wysiwyg/dist/react-draft-wysiwyg.css";
import draftToHtml from "draftjs-to-html";

import styles from "./RichtextEditor.module.scss";

type RichtextEditorProps = PropsWithRef<{
  content: string;
  onUpdate?: (markup: string) => void;
}>;

function RichtextEditor({ content = "", onUpdate }: RichtextEditorProps) {
  const descriptionInitialContentState = useMemo(() => {
    const blocksFromHTML = convertFromHTML(content);
    return ContentState.createFromBlockArray(
      blocksFromHTML.contentBlocks,
      blocksFromHTML.entityMap
    );
  }, [content]);

  const [contentState, setContentState] = useState(
    descriptionInitialContentState
  );

  const onContentStateChange = (contentState: RawDraftContentState) => {
    setContentState(convertFromRaw(contentState));
  };

  useEffect(() => {
    if (!onUpdate) return;
    const rawContentState = convertToRaw(contentState);
    const markup = draftToHtml(rawContentState);
    onUpdate(markup);
  }, [contentState]);

  return (
    <Editor
      initialContentState={convertToRaw(contentState)}
      toolbarClassName="toolbarClassName"
      wrapperClassName={styles.richtextEditor}
      editorClassName={styles.editorContent}
      onContentStateChange={onContentStateChange}
      toolbarOnFocus={false}
      toolbar={{
        options: [
          "inline",
          "blockType",
          "list",
          "link",
          "emoji",
          "remove",
          "history",
        ],
        inline: {
          inDropdown: false,
          options: ["bold", "italic", "underline"],
        },
        blockType: {
          inDropdown: true,
          options: ["Normal", "H1", "H2", "H3", "H4", "H5", "H6", "Blockquote"],
        },
        list: {
          inDropdown: false,
          options: ["unordered", "ordered", "indent", "outdent"],
        },
      }}
    />
  );
}

export default RichtextEditor;
