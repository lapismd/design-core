import { expect, it } from "vitest";
import { createTableState } from "./canvas-table-state.svelte.js";
import type { CanvasTableProps } from "./canvas-table-types.js";

it("keeps uncontrolled display settings local", () => {
  const state = createTableState();
  expect(state.wrap).toBe(false);
  expect(state.colours).toBe(false);
  state.wrap = true;
  state.colours = true;
  expect(state.wrap).toBe(true);
  expect(state.colours).toBe(true);
});
it("uses controlled display flags and emits changes without mutating host state", () => {
  const changes: string[] = [];
  let props: CanvasTableProps = {
    rows: [],
    columnWidths: [],
    wrapText: true,
    columnColours: true,
    onWrapTextChange: (value) => changes.push(`wrap:${value}`),
    onColumnColoursChange: (value) => changes.push(`colours:${value}`),
  };
  const state = createTableState(() => props);
  expect(state.wrap).toBe(true);
  expect(state.colours).toBe(true);
  state.wrap = false;
  state.colours = false;
  expect(changes).toEqual(["wrap:false", "colours:false"]);
  expect(state.wrap).toBe(true);
  expect(state.colours).toBe(true);
  props = { ...props, wrapText: false, columnColours: false };
  expect(state.wrap).toBe(false);
  expect(state.colours).toBe(false);
});
