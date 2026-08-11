import { EditorState } from "@codemirror/state";
import { describe, expect, it } from "vitest";

import { parserDiagnostics } from "./code-editor-syntax";
import {
  codeEditorLanguageAliases,
  createCodeEditorLanguageExtension,
  normalizeCodeEditorLanguage,
} from "./code-editor-language";

describe("CodeEditor languages", () => {
  it("creates a parser extension for every supported language alias", () => {
    const aliases = Object.values(codeEditorLanguageAliases).flat();

    for (const alias of aliases) {
      const extension = createCodeEditorLanguageExtension(alias);
      expect(extension, alias).not.toEqual([]);
    }
  });

  it("normalizes aliases and leaves plain text without a parser", () => {
    expect(normalizeCodeEditorLanguage(" TypeScript ")).toBe("typescript");
    expect(createCodeEditorLanguageExtension("text")).toEqual([]);
  });

  it("reports parser diagnostics for invalid source", () => {
    const state = EditorState.create({
      doc: '{"broken": }',
      extensions: [createCodeEditorLanguageExtension("json")],
    });

    expect(parserDiagnostics(state)).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ severity: "error", message: "Syntax error" }),
      ]),
    );
  });
});
