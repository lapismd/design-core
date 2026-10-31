import { describe, expect, it, vi } from "vitest";
import {
  createLayout,
  cellRect,
  visibleColumns,
} from "./canvas-table-layout.js";
import { hitTest } from "./canvas-table-hit.js";
import {
  columnLetter,
  parseAddress,
  wrapLines,
  clampWidth,
} from "./canvas-table-text.js";
import { createNavigation } from "./canvas-table-navigation.js";
import { createKeyboard } from "./canvas-table-keyboard.js";
import { applyCommand, tableCommands } from "./canvas-table-commands.js";
import type { TableContext, TableState } from "./canvas-table-context.js";
import type { CanvasTableProps } from "./canvas-table-types.js";

const rows = [
  { id: "header", cells: ["Name", "Status"] },
  { id: "a", cells: ["Long text that wraps across a few lines", "Open"] },
  { id: "b", cells: ["Beta", "Closed"] },
];
function context(patch: Partial<CanvasTableProps> = {}): TableContext {
  const props = { rows, columnWidths: [120, 100], ...patch };
  const state: TableState = {
    active: null,
    range: null,
    target: "cell",
    editing: false,
    draft: "",
    selectOnEdit: false,
    wrap: false,
    colours: false,
    left: 0,
    top: 0,
    width: 320,
    height: 200,
    epoch: 0,
    scroller: null,
    canvas: null,
    menu: null,
    drag: null,
  };
  return { props: () => props, layout: () => createLayout(props), state };
}

describe("Canvas Table text and viewport", () => {
  it.each([
    [0, "A"],
    [25, "Z"],
    [26, "AA"],
    [701, "ZZ"],
  ])("labels column %s as %s", (index, letter) =>
    expect(columnLetter(index)).toBe(letter),
  );
  it("parses sheet addresses and rejects invalid or unsafe rows", () => {
    expect(parseAddress("$AA$3")).toEqual({ row: 2, col: 26 });
    expect(parseAddress("3")).toEqual({ row: 2, col: undefined });
    expect(parseAddress("B")).toEqual({ row: undefined, col: 1 });
    for (const value of ["", "A0", "-1", "0A", "A999999999999999999999"])
      expect(parseAddress(value)).toBeNull();
  });
  it("clamps bad widths and wraps long words and explicit newlines", () => {
    expect([0, 10000, NaN].map(clampWidth)).toEqual([48, 960, 120]);
    expect(wrapLines("abcdef\nx", 3, (text) => text.length)).toEqual([
      "abc",
      "def",
      "x",
    ]);
  });
  it("shares wrapped row offsets between hit testing and cell placement", () => {
    const layout = createLayout(
      { rows, columnWidths: [48, 100] },
      true,
      (text) => text.length * 8,
    );
    expect(cellRect(layout, 0, 0).height).toBe(76);
    expect(hitTest(layout, 70, 50 + 75, 0, 0)).toEqual({
      kind: "body",
      index: 0,
      col: 0,
    });
    expect(hitTest(layout, 70, 50 + 76, 0, 0)).toEqual({
      kind: "body",
      index: 1,
      col: 0,
    });
  });
  it("bounds horizontal rendering and excludes cells behind the gutter", () => {
    const layout = createLayout({
      rows,
      columnWidths: Array.from({ length: 80 }, () => 100),
      rowSelection: true,
    });
    expect(visibleColumns(layout, 600, 400)).toEqual({ start: 6, end: 10 });
    expect(hitTest(layout, 20, 64, 600, 0)).toEqual({ kind: "row", index: 0 });
    expect(hitTest(layout, 81, 64, 600, 0)).toEqual({
      kind: "body",
      index: 0,
      col: 6,
    });
  });
  it("expands numbering and tolerates empty filtered results", () => {
    const layout = createLayout(
      { rows, columnWidths: [], visibleRowIds: [] },
      false,
      () => 100,
    );
    expect(layout.numberWidth).toBe(116);
    expect(layout.body).toEqual([]);
    expect(hitTest(layout, 130, 60, 0, 0)).toBeNull();
    expect(() =>
      createLayout({ rows: [rows[0]!, rows[0]!], columnWidths: [] }),
    ).toThrow(/unique/);
  });
});

describe("Canvas Table host-controlled editing and commands", () => {
  it("selects the first data cell on initial navigation and commits by stable ID", () => {
    const onCellChange = vi.fn();
    const ctx = context({ onCellChange });
    const nav = createNavigation(ctx);
    nav.move(1, 0);
    expect(ctx.state.active).toEqual({ rowId: "a", col: 0 });
    nav.beginEdit("Edited");
    nav.commitEdit();
    nav.commitEdit();
    expect(onCellChange).toHaveBeenCalledExactlyOnceWith("a", 0, "Edited");
    expect(rows[1]!.cells[0]).toContain("Long text");
  });
  it("does not edit or offer mutations without host callbacks", () => {
    const ctx = context();
    const nav = createNavigation(ctx);
    nav.selectCell(0, 0);
    nav.beginEdit("Ignored");
    expect(ctx.state.editing).toBe(false);
    expect(tableCommands(ctx)).toEqual([]);
  });
  it("resolves row, column and cell addresses without exposing hidden rows", () => {
    const ctx = context({ visibleRowIds: ["b"] });
    const nav = createNavigation(ctx);
    nav.address("A2");
    expect(ctx.state.active).toBeNull();
    nav.address("B3");
    expect(nav.reference()).toBe("B3");
    nav.address("3");
    expect(ctx.state.target).toBe("row");
    nav.address("B");
    expect(ctx.state.target).toBe("column");
  });
  it("disables boundary moves and dispatches only valid commands", () => {
    const onCommand = vi.fn();
    const ctx = context({ onCommand });
    const nav = createNavigation(ctx);
    nav.selectColumns(0, 0);
    applyCommand(ctx, "move-left");
    expect(onCommand).not.toHaveBeenCalled();
    applyCommand(ctx, "move-right");
    expect(onCommand).toHaveBeenCalledExactlyOnceWith({
      id: "move-right",
      target: "column",
      rowId: "a",
      column: 0,
    });
  });
  it("preserves checked rows while selecting a sheet range", () => {
    const ctx = context({ selectedRowIds: ["b"] });
    const nav = createNavigation(ctx);
    nav.selectAll();
    expect(ctx.props().selectedRowIds).toEqual(["b"]);
    expect(ctx.state.target).toBe("sheet");
  });
  it("lets Tab leave the last column", () => {
    const ctx = context();
    const nav = createNavigation(ctx);
    const keyboard = createKeyboard(ctx, nav);
    nav.selectCell(0, 1);
    const preventDefault = vi.fn();
    keyboard.grid({ key: "Tab", preventDefault } as unknown as KeyboardEvent);
    expect(preventDefault).not.toHaveBeenCalled();
  });
  it("normalizes backwards row and column selections before commands", () => {
    const ctx = context({ onCommand: vi.fn() });
    const nav = createNavigation(ctx);
    nav.selectColumns(1, 0);
    expect(ctx.state.active?.col).toBe(0);
    nav.selectRows(1, 0);
    expect(ctx.state.active?.rowId).toBe("a");
  });
  it("recognizes a complete rectangular drag as sheet selection", () => {
    const onCommand = vi.fn();
    const ctx = context({ onCommand });
    const nav = createNavigation(ctx);
    nav.selectCell(0, 0);
    ctx.state.range = { startIndex: 0, endIndex: 1, startCol: 0, endCol: 1 };
    applyCommand(ctx, "clear");
    expect(onCommand).toHaveBeenCalledWith({
      id: "clear",
      target: "sheet",
      rowId: "a",
      column: 0,
    });
  });
});
