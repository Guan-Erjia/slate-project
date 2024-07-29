import { css, cx } from "@emotion/css";
import { MouseEventHandler, ReactNode } from "react";
import { BaseEditor, Editor, Transforms } from "slate";
import { useSlate, useSlateStatic } from "slate-react";
import imageExtensions from "image-extensions";
import { isBlockActive, toggleBlock } from "./utils";

const Button = (props: {
  onMouseDown: MouseEventHandler;
  active?: boolean;
  children?: ReactNode;
}) => (
  <span
    onMouseDown={props.onMouseDown}
    style={{
      cursor: "pointer",
      color: props.active ? "black" : "#ccc",
    }}
  >
    {props.children}
  </span>
);

const MarkButton = (props: { format: string; icon: string }) => {
  const editor = useSlate();
  const marks = Editor.marks(editor);
  const isMarkActive = marks ? marks[props.format] === true : false;
  return (
    <Button
      active={isMarkActive}
      onMouseDown={(event) => {
        event.preventDefault();
        if (isMarkActive) {
          Editor.removeMark(editor, props.format);
        } else {
          Editor.addMark(editor, props.format, true);
        }
      }}
    >
      <span className="material-icons">{props.icon}</span>
    </Button>
  );
};

const isImageUrl = (url: string | URL) => {
  if (!url) return false;
  const ext = new URL(url).pathname.split(".").pop() || "";
  return imageExtensions.includes(ext);
};
const insertImage = (editor: BaseEditor, url: string) => {
  const text = { text: "" };
  const image = { type: "image", url, children: [text] };
  Transforms.insertNodes(editor, image);
  const paragraph = { type: "paragraph", children: [{ text: "" }] };
  Transforms.insertNodes(editor, paragraph);
};

const InsertImageButton = () => {
  const editor = useSlateStatic();
  return (
    <Button
      active
      onMouseDown={(event) => {
        event.preventDefault();
        const url = window.prompt("Enter the URL of the image:");
        if (url && !isImageUrl(url)) {
          alert("URL is not an image");
          return;
        }
        url && insertImage(editor, url);
      }}
    >
      <span className="material-icons">image</span>
    </Button>
  );
};
const BlockButton = (props: {
  format: string;
  icon: string;
  depth?: number;
  ordered?: boolean;
}) => {
  const editor = useSlate();

  const active =
    props.format === "list" ||
    isBlockActive(editor, props.format, {
      depth: props.depth,
      ordered: props.ordered,
    });
  return (
    <Button
      active={active}
      onMouseDown={(event) => {
        event.preventDefault();
        toggleBlock(editor, props.format, {
          depth: props.depth,
          ordered: props.ordered,
        });
      }}
    >
      <span className="material-icons"> {props.icon}</span>
    </Button>
  );
};

export default function Menu() {
  return (
    <div
      data-test-id="menu"
      className={cx(
        css`
          position: relative;
          padding: 5px 10px;
          border-bottom: 2px solid #eee;
          width: 100%;
          display: flex;
          gap: 10px;
          box-sizing: border-box;
        `
      )}
    >
      <MarkButton format="bold" icon="format_bold" />
      <MarkButton format="italic" icon="format_italic" />
      <MarkButton format="underline" icon="format_underlined" />
      <MarkButton format="code" icon="code" />
      <BlockButton format="heading" depth={1} icon="looks_one" />
      <BlockButton format="heading" depth={2} icon="looks_two" />
      <BlockButton format="heading" depth={3} icon="looks_two" />
      <BlockButton format="blockquote" icon="format_quote" />
      <BlockButton format="list" ordered={true} icon="format_list_numbered" />
      <BlockButton format="list" ordered={false} icon="format_list_bulleted" />
      <InsertImageButton />
    </div>
  );
}
