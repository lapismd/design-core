import { expect, it, vi } from "vitest";
import { createLayout } from "./canvas-table-layout.js";
import { createNavigation } from "./canvas-table-navigation.js";
import { createTableState } from "./canvas-table-state.svelte.js";
import type { CanvasTableProps } from "./canvas-table-types.js";
import type { TableContext } from "./canvas-table-context.js";

function context(extra: Partial<CanvasTableProps> = {}) {
  let props: CanvasTableProps = {
    rows: ["a", "b", "c", "d"].map((id) => ({ id, cells: [id, "value"] })),
    columnWidths: [140, 160],
    headerRow: false,
    ...extra,
  };
  const state = createTableState(() => props);
  const ctx: TableContext = {
    props: () => props,
    layout: () => createLayout(props),
    state,
  };
  const change = vi.fn((ids: (string | number)[]) => {
    props = { ...props, selectedRowIds: ids };
  });
  if (props.rowSelection) props.onSelectedRowIdsChange = change;
  return {
    ctx,
    nav: createNavigation(ctx),
    change,
    replace: (patch: Partial<CanvasTableProps>) => {
      props = { ...props, ...patch };
    },
  };
}

it("uses whole rows rather than cells when editing is unavailable", () => {
  const { ctx, nav } = context();
  nav.selectCell(1, 1);
  expect(ctx.state.target).toBe("row");
  expect(ctx.state.active).toEqual({ rowId: "b", col: 0 });
  expect(ctx.state.range).toBeNull();
  expect(nav.reference()).toBe("2");
  nav.beginEdit();
  expect(ctx.state.editing).toBe(false);
});

it("replaces controlled row selection without redundant callbacks", () => {
  const { ctx, nav, change } = context({
    rowSelection: true,
    selectedRowIds: ["a", "c"],
  });
  nav.selectCell(1, 1);
  expect(ctx.props().selectedRowIds).toEqual(["b"]);
  nav.selectCell(1, 0);
  expect(change).toHaveBeenCalledTimes(1);
});

it("vertical navigation selects rows while horizontal navigation keeps the same row", () => {
  const { ctx, nav } = context({ rowSelection: true });
  nav.move(1, 0);
  nav.move(1, 0);
  nav.move(0, 1);
  expect(ctx.props().selectedRowIds).toEqual(["b"]);
  expect(ctx.state.active?.col).toBe(0);
});

it("disabled controlled selection permits navigation without changing selection", () => {
  const { ctx, nav, change } = context({
    rowSelection: { disabled: true },
    selectedRowIds: ["a"],
  });
  nav.selectCell(1, 1);
  expect(ctx.state.active?.rowId).toBe("b");
  expect(ctx.props().selectedRowIds).toEqual(["a"]);
  expect(change).not.toHaveBeenCalled();
});

it("keeps editable cell selection independent of row checkboxes", () => {
  const { ctx, nav, change } = context({
    onCellChange: vi.fn(),
    rowSelection: true,
    selectedRowIds: ["a"],
  });
  nav.selectCell(1, 1);
  expect(ctx.state.target).toBe("cell");
  expect(ctx.state.active).toEqual({ rowId: "b", col: 1 });
  expect(ctx.props().selectedRowIds).toEqual(["a"]);
  expect(change).not.toHaveBeenCalled();
});

it("supports modifier toggles and ranges in displayed order", () => {
  const { ctx, nav } = context({
    rowSelection: true,
    visibleRowIds: ["d", "b", "a", "c"],
  });
  nav.selectCell(0, 0);
  nav.selectCell(1, 1, { toggle: true });
  expect(ctx.props().selectedRowIds).toEqual(["d", "b"]);
  nav.selectCell(3, 1, { extend: true });
  expect(ctx.props().selectedRowIds).toEqual(["b", "a", "c"]);
});

it.each([true, false])(
  "honors required=%s in single row selection",
  (required) => {
    const { ctx, nav } = context({
      rowSelection: { mode: "single", required },
    });
    nav.selectCell(1, 1);
    nav.selectCell(3, 1, { extend: true });
    expect(ctx.props().selectedRowIds).toEqual(["d"]);
    nav.selectCell(3, 0, { toggle: true });
    expect(ctx.props().selectedRowIds).toEqual(required ? ["d"] : []);
  },
);

it("select-all covers the off-page scope while preserving hidden selections", () => {
  const { ctx, nav } = context({
    rowSelection: true,
    visibleRowIds: ["a"],
    selectionRowIds: ["a", "c", "d"],
    selectedRowIds: ["b"],
  });
  nav.selectAll();
  expect(ctx.props().selectedRowIds).toEqual(["b", "a", "c", "d"]);
  expect(ctx.state.range).toBeNull();
});

it("local selection uses stable IDs across filtering and reorder", () => {
  const { ctx, nav, replace } = context();
  nav.selectCell(1, 1);
  replace({ visibleRowIds: ["d", "a"] });
  expect(ctx.state.rowSelectionIds).toEqual(["b"]);
  replace({ visibleRowIds: ["d", "b", "a"] });
  expect(ctx.state.rowSelectionIds).toEqual(["b"]);
});

it("does not publish unchanged selection sets in a different order", () => {
  const { nav, change, replace } = context({ rowSelection: true });
  nav.selectCell(1, 0);
  replace({ selectedRowIds: ["c", "b"] });
  change.mockClear();
  nav.selectCell(2, 0, { extend: true });
  expect(change).not.toHaveBeenCalled();
});
