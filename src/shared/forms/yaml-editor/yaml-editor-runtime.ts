import { foldEffect, foldable } from "@codemirror/language";
import { EditorSelection } from "@codemirror/state";
import type { EditorView } from "@codemirror/view";

import {
  createMarkdownEdit,
  type MarkdownFormatKind,
} from "../core/markdown-format";

export function formatYamlSelection(
  editor: EditorView,
  kind: MarkdownFormatKind,
  linkUrl = "url",
): void {
  let offset = 0;
  const changes = editor.state.selection.ranges.map((range) => {
    const selectedText = editor.state.doc.sliceString(range.from, range.to);
    const edit = createMarkdownEdit(kind, selectedText, linkUrl);
    const mappedFrom = range.from + offset;
    offset += edit.text.length - (range.to - range.from);
    return {
      range,
      edit,
      selectionFrom: mappedFrom + edit.selectionStart,
      selectionTo: mappedFrom + edit.selectionEnd,
    };
  });

  editor.dispatch({
    changes: changes.map(({ range, edit }) => ({
      from: range.from,
      to: range.to,
      insert: edit.text,
    })),
    selection: EditorSelection.create(
      changes.map(({ selectionFrom, selectionTo }) =>
        EditorSelection.range(selectionFrom, selectionTo),
      ),
      editor.state.selection.mainIndex,
    ),
    scrollIntoView: true,
    userEvent: "input",
  });
}

export function foldAllYaml(editor: EditorView): boolean {
  const effects = [];
  const seen = new Set<string>();
  for (
    let lineNumber = 1;
    lineNumber <= editor.state.doc.lines;
    lineNumber += 1
  ) {
    const line = editor.state.doc.line(lineNumber);
    const range = foldable(editor.state, line.from, line.to);
    if (!range) continue;
    const key = `${range.from}:${range.to}`;
    if (seen.has(key)) continue;
    seen.add(key);
    effects.push(foldEffect.of(range));
  }
  if (!effects.length) return false;
  editor.dispatch({ effects });
  return true;
}
