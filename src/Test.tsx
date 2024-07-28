import { useCallback, useMemo } from "react";
import {
  createEditor,
  Editor,
  Element as SlateElement,
  Node as SlateNode,
  Descendant,
} from "slate";
import { withHistory } from "slate-history";
import { Editable, ReactEditor, Slate, withReact } from "slate-react";
import { slateToRemark } from "remark-slate-transformer";
import { unified } from "unified";
import remarkStringify from "remark-stringify";
import { renderElement } from "./RenderElement";
import renderLeaf from "./RenderLeaf";
import Menu from "./Menu";
import { SHORTCUTS } from "./utils";
import { withShortcuts } from "./withShorts";

const initialValue: Descendant[] = [
  {
    type: "heading",
    depth: 1,
    children: [
      {
        text: "heading 1",
      },
    ],
  },
  {
    type: "heading",
    depth: 2,
    children: [
      {
        text: "heading 2",
      },
    ],
  },
  {
    type: "heading",
    depth: 3,
    children: [
      {
        text: "heading 3",
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "aaaaaaaa",
      },
      {
        strong: true,
        text: "bold",
      },
      {
        emphasis: true,
        text: "emphasis",
      },
    ],
  },
  {
    type: "list",
    children: [
      {
        type: "listItem",
        children: [
          {
            text: "ordered list2",
          },
        ],
      },
      {
        type: "listItem",
        children: [
          {
            text: "ordered list3",
          },
        ],
      },
      {
        type: "listItem",
        children: [
          {
            text: "ordered list4",
          },
        ],
      },
    ],
    ordered: true,
  },
  {
    type: "paragraph",
    children: [
      {
        text: "This is ",
      },
      {
        type: "link",
        children: [
          {
            text: "link to GitHub.com",
          },
        ],
        url: "https://github.com/",
        title: null,
      },
      {
        text: ".",
      },
    ],
  },
  {
    type: "paragraph",
    children: [
      {
        text: "This is ",
      },
      {
        type: "image",
        url: "https://github.githubassets.com/images/modules/logos_page/Octocat.png",
        title: null,
        alt: "image",
        children: [
          {
            text: "",
          },
        ],
      },
      {
        text: ".",
      },
    ],
  },
  {
    type: "blockquote",
    children: [
      {
        type: "paragraph",
        children: [
          {
            text: "quote\nquote\nquote\nquote",
          },
        ],
      },
    ],
  },
];

export default function MarkdownShortcutsExample() {
  const editor = useMemo(
    () => withShortcuts(withReact(withHistory(createEditor()))),
    []
  );

  const handleDOMBeforeInput = useCallback(() => {
    queueMicrotask(() => {
      const pendingDiffs = ReactEditor.androidPendingDiffs(editor);

      const scheduleFlush = pendingDiffs?.some(({ diff, path }) => {
        if (!diff.text.endsWith(" ")) {
          return false;
        }

        const { text } = SlateNode.leaf(editor, path);
        const beforeText = text.slice(0, diff.start) + diff.text.slice(0, -1);
        if (!(beforeText in SHORTCUTS)) {
          return;
        }

        const blockEntry = Editor.above(editor, {
          at: path,
          match: (n) => SlateElement.isElement(n) && Editor.isBlock(editor, n),
        });
        if (!blockEntry) {
          return false;
        }

        const [, blockPath] = blockEntry;
        return Editor.isStart(editor, Editor.start(editor, path), blockPath);
      });

      if (scheduleFlush) {
        ReactEditor.androidScheduleFlush(editor);
      }
    });
  }, [editor]);

  return (
    <Slate
      editor={editor}
      initialValue={initialValue}
      onValueChange={(value) => {
        try {
          const result = slateToRemark(value);
          const file = unified().use(remarkStringify).stringify(result);
          console.log(file);
        } catch (error) {
          console.error(error);
        }
      }}
    >
      <Menu />
      <Editable
        onDOMBeforeInput={handleDOMBeforeInput}
        renderElement={renderElement}
        renderLeaf={renderLeaf}
        placeholder="Write some markdown..."
        spellCheck
        autoFocus
      />
    </Slate>
  );
}
