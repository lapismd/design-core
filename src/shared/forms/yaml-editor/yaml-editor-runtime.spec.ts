// @vitest-environment jsdom

import { yaml } from "@codemirror/lang-yaml";
import { codeFolding, foldedRanges, unfoldAll } from "@codemirror/language";
import { EditorSelection, EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { afterEach, describe, expect, it } from "vitest";

import { foldAllYaml, formatYamlSelection } from "./yaml-editor-runtime";

const views: EditorView[] = [];

function createView(doc: string, selection?: EditorSelection): EditorView {
  const parent = document.createElement("div");
  document.body.append(parent);
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc,
      selection,
      extensions: [yaml(), codeFolding()],
    }),
  });
  views.push(view);
  return view;
}

afterEach(() => {
  for (const view of views.splice(0)) {
    const parent = view.dom.parentElement;
    view.destroy();
    parent?.remove();
  }
});

describe("YamlEditor runtime extensions", () => {
  it("formats the active selections without replacing the editor shell", () => {
    const view = createView(
      "summary: selected text",
      EditorSelection.single(9, 22),
    );

    formatYamlSelection(view, "bold");

    expect(view.state.doc.toString()).toBe("summary: **selected text**");
    expect(view.state.selection.main.from).toBe(26);
    expect(view.state.selection.main.to).toBe(26);
  });

  it("folds every YAML range and can be unfolded again", () => {
    const view = createView(
      "root:\n  child:\n    value: true\n  sibling: text\nother: false\n",
    );

    expect(foldAllYaml(view)).toBe(true);
    expect(foldedRanges(view.state).iter().value).not.toBeNull();

    unfoldAll(view);
    expect(foldedRanges(view.state).iter().value).toBeNull();
  });
});
