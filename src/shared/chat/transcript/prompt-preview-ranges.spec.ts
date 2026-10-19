import { expect, test } from "vitest";
import { promptPreviewRanges } from "./prompt-preview-ranges.js";

test("complete XML sections retain exact UTF-16 source boundaries", () => {
  const source =
    "A 👩🏽‍💻 request.\n\n<context>\n<root>café</root>\n</context>\n\nAfter.";
  expect(
    promptPreviewRanges(source).map(({ from, to }) => source.slice(from, to)),
  ).toEqual(["<context>\n<root>café</root>\n</context>"]);
});
for (const source of [
  "```xml\n<context>literal</context>\n```",
  "`<context>literal</context>`",
  "    <context>literal</context>",
  "<!--\n<context>literal</context>\n-->",
  "<context>\nUnclosed",
  "<a>\n</b>",
  "An inline <context>literal</context> example.",
])
  test(`preserves literal source: ${source}`, () => {
    expect(promptPreviewRanges(source)).toEqual([]);
  });
