import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { columnCanvasTokenNames } from "./column-canvas.tokens.js";

const storybookDocs = readFileSync(
  new URL("./ColumnCanvas.mdx", import.meta.url),
  "utf8",
);
const catalogDocs = readFileSync(
  new URL("./column-canvas.docs.md", import.meta.url),
  "utf8",
);

describe("Column Canvas documentation", () => {
  it("uses explicit tables that Storybook MDX renders", () => {
    expect(storybookDocs).not.toMatch(/^\|/m);
    expect(storybookDocs.match(/<table>/g)).toHaveLength(8);
  });

  it("keeps catalog Markdown table column counts stable", () => {
    const tableBlocks = catalogDocs
      .split(/\n{2,}/)
      .filter((block) => block.startsWith("|"));

    expect(tableBlocks.length).toBeGreaterThan(0);

    for (const block of tableBlocks) {
      const delimiterCounts = block
        .split("\n")
        .filter((line) => line.startsWith("|"))
        .map((line) => line.match(/(?<!\\)\|/g)?.length ?? 0);

      expect(new Set(delimiterCounts).size, block).toBe(1);
    }
  });

  it("covers the public compound and controller surface", () => {
    const requiredTerms = [
      "Root",
      "Column",
      "CollapsedColumn",
      "Header",
      "Title",
      "Count",
      "HeaderActions",
      "Toggle",
      "Close",
      "Body",
      "Item",
      "onScrollNearEnd",
      "compactBreakpoint",
      "displayMode",
      "trailingSpacerWidth",
      "openOnSelect",
      "ensureColumn",
      "setCollapsed",
      "setClosed",
      "getPairSplit",
      "setPairSplit",
      "resetPairSplit",
      "maxWidth: null",
      "ColumnCanvasLayoutV2",
      "restoreLayout",
      "flushSave",
      "dispose",
      "useColumnCanvas",
      "useColumnCanvasContext",
      "useColumnCanvasColumn",
      "ColumnCanvasLayoutPersistence",
      "onPersistenceError",
    ];

    for (const term of requiredTerms) {
      expect(storybookDocs, `Storybook docs missing ${term}`).toContain(term);
      expect(catalogDocs, `catalog docs missing ${term}`).toContain(term);
    }
  });

  it("lists every public styling token on both docs surfaces", () => {
    for (const token of Object.values(columnCanvasTokenNames)) {
      expect(storybookDocs, `Storybook docs missing ${token}`).toContain(token);
      expect(catalogDocs, `catalog docs missing ${token}`).toContain(token);
    }
  });
});
