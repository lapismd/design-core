import { describe, expect, it } from "vitest";
import { createLayout, visibleRows, cellRect } from "./canvas-table-layout.js";
import { hitTest } from "./canvas-table-hit.js";
import { selectionStatus, toggleFiltered } from "./canvas-table-selection.js";

const rows = [
  { id: "header", cells: ["Name", "Status"] },
  { id: "a", cells: ["Alpha", "Open"] },
  { id: "b", cells: ["Beta", "Closed"] },
  { id: "c", cells: ["Gamma", "Open"] },
];
const base = { rows, columnWidths: [120, 100], headerRow: true };

describe("Canvas Table geometry", () => {
  it.each([
    [true, false, 48],
    [false, true, 32],
    [true, true, 80],
    [false, false, 0],
  ])(
    "shares number %s / checkbox %s gutter geometry",
    (rowNumbers, rowSelection, gutter) => {
      const layout = createLayout({ ...base, rowNumbers, rowSelection });
      expect(layout.gutter).toBe(gutter);
      expect(cellRect(layout, 0, 0).x).toBe(gutter);
      expect(hitTest(layout, gutter + 12, 60, 0, 0)).toEqual({
        kind: "body",
        index: 0,
        col: 0,
      });
      expect(hitTest(layout, gutter + 120, 10, 0, 0)).toEqual({
        kind: "resize",
        col: 0,
      });
    },
  );
  it("retains sheet numbers and host filtered order", () => {
    const layout = createLayout({ ...base, visibleRowIds: ["c", "a"] });
    expect(layout.body.map((entry) => [entry.row.id, entry.number])).toEqual([
      ["c", 4],
      ["a", 2],
    ]);
  });
  it("bounds a scrolled window independently of dataset length", () => {
    const layout = createLayout({
      ...base,
      rows: Array.from({ length: 10000 }, (_, i) => ({
        id: String(i),
        cells: [String(i)],
      })),
    });
    const range = visibleRows(layout, 14000, 280);
    expect(range.end - range.start).toBeLessThan(30);
    expect(range.start).toBeGreaterThan(400);
  });
});

describe("Canvas Table independent row selection", () => {
  it("toggles the complete filtered result while preserving hidden IDs", () => {
    expect(toggleFiltered(["hidden"], ["a", "c"])).toEqual([
      "hidden",
      "a",
      "c",
    ]);
    expect(toggleFiltered(["hidden", "a", "c"], ["a", "c"])).toEqual([
      "hidden",
    ]);
  });
  it("calculates mixed state only from filtered IDs", () => {
    expect(selectionStatus(["hidden"], ["a", "c"])).toEqual({
      checked: false,
      indeterminate: false,
    });
    expect(selectionStatus(["a"], ["a", "c"])).toEqual({
      checked: false,
      indeterminate: true,
    });
    expect(selectionStatus(["a", "c"], ["a", "c"])).toEqual({
      checked: true,
      indeterminate: false,
    });
    expect(selectionStatus(["hidden"], [])).toEqual({
      checked: false,
      indeterminate: false,
    });
  });
});
