import { describe, expect, it } from "vitest";

import {
  CONTEXT_RADIUS,
  INCREMENTAL_EXPAND_STEP,
  INCREMENTAL_EXPAND_THRESHOLD,
  MIN_COLLAPSE_LINES,
  buildDisplayItems,
  buildUnifiedDiffRows,
  isBinaryFilePath,
  lineNumberForSplitSide,
  pairRowsForSplit,
  parsePatchToRows,
  type UnifiedDiffRow,
} from "./unified-diff";

function makeContextRows(count: number, startLine = 1): UnifiedDiffRow[] {
  const rows: UnifiedDiffRow[] = [];
  for (let i = 0; i < count; i += 1) {
    const lineNumber = startLine + i;
    rows.push({
      key: `c-${lineNumber}-${lineNumber}`,
      lineNumber,
      variant: "context",
      text: `line ${lineNumber}`,
    });
  }
  return rows;
}

function makeRowsWithChange(
  beforeCount: number,
  afterCount: number,
): UnifiedDiffRow[] {
  const rows: UnifiedDiffRow[] = [];
  let lineNumber = 1;
  for (let i = 0; i < beforeCount; i += 1) {
    rows.push({
      key: `c-${lineNumber}-${lineNumber}`,
      lineNumber,
      variant: "context",
      text: `line ${lineNumber}`,
    });
    lineNumber += 1;
  }
  rows.push({
    key: `n-${lineNumber}`,
    lineNumber,
    variant: "added",
    text: `added line ${lineNumber}`,
  });
  lineNumber += 1;
  for (let i = 0; i < afterCount; i += 1) {
    rows.push({
      key: `c-${lineNumber}-${lineNumber}`,
      lineNumber,
      variant: "context",
      text: `line ${lineNumber}`,
    });
    lineNumber += 1;
  }
  return rows;
}

describe("buildUnifiedDiffRows", () => {
  it("pairs replaced lines with inline segments", () => {
    const rows = buildUnifiedDiffRows("hello old world\n", "hello new world\n");
    expect(rows.map((row) => row.variant)).toEqual(["removed", "added"]);
    expect(
      rows[0]?.segments?.some((segment) => segment.tone === "removed"),
    ).toBe(true);
    expect(rows[1]?.segments?.some((segment) => segment.tone === "added")).toBe(
      true,
    );
  });

  it("keeps old-file line numbers on split context after a deletion", () => {
    const rows = buildUnifiedDiffRows("a\nb\nc\n", "a\nc\n");
    const pairs = pairRowsForSplit(rows);
    const omega = pairs.find((pair) => pair.right?.text === "c");
    expect(lineNumberForSplitSide(omega?.left ?? null, "left")).toBe(3);
    expect(lineNumberForSplitSide(omega?.right ?? null, "right")).toBe(2);
  });
});

describe("parsePatchToRows", () => {
  it("reads hunk line numbers and variants", () => {
    const rows = parsePatchToRows(
      [
        "--- a/file.ts",
        "+++ b/file.ts",
        "@@ -1,3 +1,3 @@",
        " context",
        "-old",
        "+new",
        "",
      ].join("\n"),
    );
    expect(rows.map((row) => [row.variant, row.lineNumber, row.text])).toEqual([
      ["context", 1, "context"],
      ["removed", 2, "old"],
      ["added", 2, "new"],
    ]);
  });
});

describe("buildDisplayItems", () => {
  it("shows all rows when fewer than MIN_COLLAPSE_LINES context-only rows exist", () => {
    const rows = makeContextRows(MIN_COLLAPSE_LINES - 1);
    const items = buildDisplayItems(rows, {});
    expect(items.every((item) => item.type === "row")).toBe(true);
    expect(items.length).toBe(MIN_COLLAPSE_LINES - 1);
  });

  it("collapses context-only rows when count >= MIN_COLLAPSE_LINES", () => {
    const rows = makeContextRows(MIN_COLLAPSE_LINES);
    const items = buildDisplayItems(rows, {});
    expect(items.length).toBe(1);
    expect(items[0]!.type).toBe("collapsed");
    if (items[0]!.type === "collapsed") {
      expect(items[0]!.block.count).toBe(MIN_COLLAPSE_LINES);
      expect(items[0]!.block.expanded).toBe(false);
    }
  });

  it("creates collapsed blocks for distant context around a change", () => {
    const rows = makeRowsWithChange(20, 20);
    const items = buildDisplayItems(rows, {});
    const collapsedItems = items.filter((item) => item.type === "collapsed");
    expect(collapsedItems.length).toBe(2);
  });

  it("marks block as expanded when expandedBlocks has true for the block id", () => {
    const rows = makeContextRows(20);
    const items = buildDisplayItems(rows, {});
    const blockId = items[0]!.type === "collapsed" ? items[0]!.block.id : "";
    const expandedItems = buildDisplayItems(rows, { [blockId]: true });
    expect(expandedItems.length).toBe(1);
    if (expandedItems[0]!.type === "collapsed") {
      expect(expandedItems[0]!.block.expanded).toBe(true);
      expect(expandedItems[0]!.block.rows.length).toBe(20);
    }
  });

  it("reveals N lines from the top and reduces the collapsed block count", () => {
    const rows = makeContextRows(50);
    const items = buildDisplayItems(rows, {});
    const blockId = items[0]!.type === "collapsed" ? items[0]!.block.id : "";
    const result = buildDisplayItems(rows, {
      [blockId]: { top: 10, bottom: 0 },
    });
    const visibleRows = result.filter((item) => item.type === "row");
    const collapsedBlocks = result.filter((item) => item.type === "collapsed");
    expect(visibleRows.length).toBe(10);
    expect(collapsedBlocks.length).toBe(1);
    if (collapsedBlocks[0]!.type === "collapsed") {
      expect(collapsedBlocks[0]!.block.count).toBe(40);
    }
  });

  it("reveals N lines from the bottom and reduces the collapsed block count", () => {
    const rows = makeContextRows(50);
    const items = buildDisplayItems(rows, {});
    const blockId = items[0]!.type === "collapsed" ? items[0]!.block.id : "";
    const result = buildDisplayItems(rows, {
      [blockId]: { top: 0, bottom: 10 },
    });
    const visibleRows = result.filter((item) => item.type === "row");
    const collapsedBlocks = result.filter((item) => item.type === "collapsed");
    expect(visibleRows.length).toBe(10);
    expect(collapsedBlocks.length).toBe(1);
    if (collapsedBlocks[0]!.type === "collapsed") {
      expect(collapsedBlocks[0]!.block.count).toBe(40);
    }
  });

  it("fully resolves when top + bottom >= total count", () => {
    const rows = makeContextRows(30);
    const items = buildDisplayItems(rows, {});
    const blockId = items[0]!.type === "collapsed" ? items[0]!.block.id : "";
    const result = buildDisplayItems(rows, {
      [blockId]: { top: 20, bottom: 20 },
    });
    expect(result.filter((item) => item.type === "collapsed").length).toBe(0);
    expect(result.filter((item) => item.type === "row").length).toBe(30);
  });

  it("handles empty rows", () => {
    expect(buildDisplayItems([], {}).length).toBe(0);
  });

  it("keeps documented collapse constants", () => {
    expect(CONTEXT_RADIUS).toBe(3);
    expect(MIN_COLLAPSE_LINES).toBe(8);
    expect(INCREMENTAL_EXPAND_STEP).toBe(20);
    expect(INCREMENTAL_EXPAND_THRESHOLD).toBe(40);
  });
});

describe("isBinaryFilePath", () => {
  it("treats image and archive extensions as binary", () => {
    expect(isBinaryFilePath("shot.png")).toBe(true);
    expect(isBinaryFilePath("notes.md")).toBe(false);
  });
});
