import { expect, it } from "vitest";
import { richSourceExtension } from "./rich-source.js";

it("maps repeated Unicode cells and code into their exact original source offsets", () => {
  const table = "| A | B |\n| --- | --- |\n| café 👩🏽‍💻 | café 👩🏽‍💻 |";
  const tree = {
    type: "root",
    children: Array.from({ length: 4 }, () => ({
      type: "element",
      tagName: "td",
      properties: {} as Record<string, unknown>,
    })),
  };
  richSourceExtension(table, 17).rehypePlugins[0]!()(tree);
  const ranges = tree.children.map((cell) => [
    Number(cell.properties["data-transcript-from"]),
    Number(cell.properties["data-transcript-to"]),
  ]);
  expect(ranges.map(([from, to]) => table.slice(from! - 17, to! - 17))).toEqual(
    ["A", "B", "café 👩🏽‍💻", "café 👩🏽‍💻"],
  );
  expect(ranges[2]![0]).not.toBe(ranges[3]![0]);
  const code = "```typescript\nconst value = 'café';\n```";
  const codeTree = {
    type: "element",
    tagName: "code",
    properties: {} as Record<string, unknown>,
  };
  richSourceExtension(code, 50).rehypePlugins[0]!()(codeTree);
  expect(
    code.slice(
      Number(codeTree.properties["data-transcript-from"]) - 50,
      Number(codeTree.properties["data-transcript-to"]) - 50,
    ),
  ).toBe("const value = 'café';");
});

it("does not invent anchors when the rendered table topology differs", () => {
  const cell = {
    type: "element",
    tagName: "td",
    properties: {} as Record<string, unknown>,
  };
  richSourceExtension("| A | B |\n| --- | --- |\n| C | D |", 0)
    .rehypePlugins[0]!()(cell);
  expect(cell.properties["data-transcript-from"]).toBeUndefined();
});
