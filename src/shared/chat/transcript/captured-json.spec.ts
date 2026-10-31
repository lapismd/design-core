import { expect, test, vi } from "vitest";
import { EditorState } from "@codemirror/state";
import { language } from "@codemirror/language";
import { highlightTree } from "@lezer/highlight";
import { miraClassHighlighter } from "@lapismd/mira/codemirror";
import { fileCodeLanguage, numberedCodeHighlights } from "./captured-code.js";

test("raw JSON distinguishes property names from values without parser warnings", () => {
  const warning = vi.spyOn(console, "warn");
  try {
    const text = '{"greeting":"café 👩🏽‍💻","nested":{"active":true}}';
    const grammar = EditorState.create({
      doc: text,
      extensions: fileCodeLanguage("tool.json"),
    }).facet(language)!;
    const tokens: { text: string; classes: string }[] = [];
    highlightTree(
      grammar.parser.parse(text),
      miraClassHighlighter,
      (from, to, classes) => {
        tokens.push({ text: text.slice(from, to), classes });
      },
    );
    for (const name of ["greeting", "nested", "active"])
      expect(tokens).toContainEqual({
        text: `"${name}"`,
        classes: "cm-property",
      });
    expect(tokens).toContainEqual({ text: '"café 👩🏽‍💻"', classes: "cm-string" });
    expect(tokens).toContainEqual({ text: "true", classes: "cm-bool" });
    expect(warning).not.toHaveBeenCalled();
  } finally {
    warning.mockRestore();
  }
});

test("numbered JSON retains key highlighting at captured UTF-16 coordinates", () => {
  const text =
    '  9\t{\n 10\t  "greeting": "café 👩🏽‍💻",\n 90\t  "count": 42\n 91\t}';
  const ranges = numberedCodeHighlights(text, "capture.json");
  const keys = ranges.filter((range) => range.classes.includes("cm-property"));
  expect(keys.map(({ from, to }) => text.slice(from, to))).toEqual([
    '"greeting"',
    '"count"',
  ]);
  expect(keys[0].from).toBe(text.indexOf('"greeting"'));
  expect(keys[1].from).toBe(text.indexOf('"count"'));
  const number = ranges.find((range) => range.classes.includes("cm-number"))!;
  expect(text.slice(number.from, number.to)).toBe("42");
  for (const { from, to } of ranges)
    expect(text.slice(from, to)).not.toContain("\t");
});
