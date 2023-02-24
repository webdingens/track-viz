import { PropsWithRef, useMemo } from "react";

import { Editor as TinyMCEEditor } from "@tinymce/tinymce-react";

// TinyMCE so the global var exists
import "tinymce/tinymce";

// Theme
import "tinymce/themes/silver";
// Toolbar icons
import "tinymce/icons/default";
// Editor styles
import "tinymce/skins/ui/oxide/skin.min.css";

// importing the plugin js.
import "tinymce/plugins/autolink";
import "tinymce/plugins/link";
import "tinymce/plugins/lists";
import "tinymce/plugins/anchor";

import "tinymce/models/dom";

// Content styles, including inline UI like fake cursors
import contentCss from "tinymce/skins/content/default/content.min.css?raw";
import contentUiCss from "tinymce/skins/ui/oxide/content.min.css?raw";

type RichtextEditorProps = PropsWithRef<{
  content: string;
  onUpdate?: (markup: string) => void;
  ariaDescribedBy?: string;
}>;

function RichtextEditor({
  content = "",
  onUpdate,
  ariaDescribedBy,
}: RichtextEditorProps) {
  const initialValue = useMemo(() => content, []);
  return (
    <TinyMCEEditor
      initialValue={initialValue}
      onEditorChange={(newValue, editor) => {
        if (onUpdate) onUpdate(editor.getContent());
      }}
      init={{
        menubar: false,
        plugins: ["autolink", "lists", "link", "anchor"],
        toolbar: [
          "bold italic underline link removeformat | undo redo | bullist numlist",
        ],
        skin: false,
        content_css: false,
        content_style: [contentCss, contentUiCss].join("\n"),
      }}
    />
  );
}

export default RichtextEditor;
