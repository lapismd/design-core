import type { TableContext } from "./canvas-table-context.js";
import type { CanvasTableRowId } from "./canvas-table-types.js";
import { rowSelectionOptions, toggleRow } from "./canvas-table-selection.js";

export interface RowModifiers {
  extend?: boolean;
  toggle?: boolean;
}

/** Editable checkboxes remain independent; read-only tables without controls own IDs. */
export function selectedRows(ctx: TableContext): readonly CanvasTableRowId[] {
  const p = ctx.props();
  return p.rowSelection
    ? (p.selectedRowIds ?? [])
    : p.onCellChange
      ? []
      : ctx.state.rowSelectionIds;
}

export function createRowNavigation(ctx: TableContext) {
  let anchor: CanvasTableRowId | null = null;
  const options = () => rowSelectionOptions(ctx.props().rowSelection);
  function publish(ids: readonly CanvasTableRowId[]) {
    const p = ctx.props();
    if (options().disabled || (p.rowSelection && !p.onSelectedRowIdsChange))
      return;
    const next = [...new Set(ids)];
    const current = new Set(selectedRows(ctx));
    if (next.length === current.size && next.every((id) => current.has(id)))
      return;
    if (p.rowSelection) p.onSelectedRowIdsChange?.(next);
    else ctx.state.rowSelectionIds = next;
  }
  function select(index: number, modifiers: RowModifiers = {}) {
    const layout = ctx.layout();
    const entry = layout.body[index];
    if (!entry) return;
    const s = ctx.state;
    const oldActive = s.active?.rowId;
    s.active = { rowId: entry.row.id, col: 0 };
    s.range = null;
    s.editing = false;
    s.target = "row";
    const config = options();
    if (modifiers.extend && config.mode !== "single") {
      const start =
        layout.bodyIndex.get(anchor ?? oldActive ?? entry.row.id) ?? index;
      const ids = layout.body
        .slice(Math.min(start, index), Math.max(start, index) + 1)
        .map((row) => row.row.id);
      anchor ??= layout.body[start]!.row.id;
      publish(modifiers.toggle ? [...selectedRows(ctx), ...ids] : ids);
    } else {
      anchor = entry.row.id;
      publish(
        modifiers.toggle
          ? toggleRow(selectedRows(ctx), entry.row.id, config)
          : [entry.row.id],
      );
    }
  }
  function all() {
    const p = ctx.props();
    const layout = ctx.layout();
    if (options().mode === "single") {
      const index = ctx.state.active
        ? layout.bodyIndex.get(ctx.state.active.rowId)
        : 0;
      select(index ?? 0);
      return;
    }
    const ids = (
      p.selectionRowIds ?? layout.body.map((entry) => entry.row.id)
    ).filter(
      (id) =>
        layout.byId.has(id) && !(layout.headerRow && p.rows[0]?.id === id),
    );
    if (!ctx.state.active && layout.body.length) {
      ctx.state.active = { rowId: layout.body[0]!.row.id, col: 0 };
    }
    ctx.state.range = null;
    ctx.state.target = "row";
    publish([...selectedRows(ctx), ...ids]);
  }
  function range(from: number, to: number) {
    anchor = ctx.layout().body[from]?.row.id ?? null;
    select(to, { extend: true });
  }
  return { select, all, range };
}
