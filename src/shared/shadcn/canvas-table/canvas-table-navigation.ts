import type { TableContext } from "./canvas-table-context.js";
import type { Cell } from "./canvas-table-types.js";
import { cellRect } from "./canvas-table-layout.js";
import { tableTarget } from "./canvas-table-commands.js";
import {
  columnLetter,
  parseAddress,
  CELL_PADDING,
  clampWidth,
} from "./canvas-table-text.js";

export function createNavigation(ctx: TableContext) {
  const s = ctx.state;
  function row(index: number) {
    return index < 0 ? ctx.props().rows[0] : ctx.layout().body[index]?.row;
  }
  function index(cell: Cell) {
    if (ctx.layout().headerRow && cell.rowId === ctx.props().rows[0]?.id)
      return -1;
    return ctx.layout().bodyIndex.get(cell.rowId) ?? -2;
  }
  function selectCell(index: number, col: number) {
    const entry = row(index);
    if (!entry || !ctx.layout().widths[col]) return;
    s.active = { rowId: entry.id, col };
    s.range = null;
    s.editing = false;
    s.target = "cell";
  }
  function selectRows(from: number, to: number) {
    selectCell(Math.min(from, to), 0);
    s.target = "row";
    s.range = {
      startIndex: Math.min(from, to),
      endIndex: Math.max(from, to),
      startCol: 0,
      endCol: ctx.layout().widths.length - 1,
    };
  }
  function selectColumns(from: number, to: number) {
    selectCell(ctx.layout().body.length ? 0 : -1, Math.min(from, to));
    s.target = "column";
    s.range = {
      startIndex: 0,
      endIndex: ctx.layout().body.length - 1,
      startCol: Math.min(from, to),
      endCol: Math.max(from, to),
    };
  }
  function selectAll() {
    selectColumns(0, ctx.layout().widths.length - 1);
    s.target = "sheet";
  }
  function reveal(index: number, col: number) {
    const node = s.scroller;
    if (!node) return;
    const layout = ctx.layout();
    const rect = cellRect(layout, index, col);
    if (rect.x < node.scrollLeft + layout.gutter)
      node.scrollLeft = Math.max(0, rect.x - layout.gutter);
    else if (rect.x + rect.width > node.scrollLeft + node.clientWidth)
      node.scrollLeft = rect.x + rect.width - node.clientWidth;
    if (index < 0) return;
    const top = rect.y - layout.chrome;
    if (top < node.scrollTop) node.scrollTop = top;
    else if (
      top + rect.height >
      node.scrollTop + node.clientHeight - layout.chrome
    )
      node.scrollTop =
        top + rect.height - Math.max(1, node.clientHeight - layout.chrome);
  }
  function move(rowDelta: number, colDelta: number): boolean {
    const layout = ctx.layout();
    if (!layout.widths.length || (!layout.body.length && !layout.headerRow))
      return false;
    if (!s.active) {
      const first = layout.body.length ? 0 : -1;
      selectCell(first, 0);
      reveal(first, 0);
      return Boolean(s.active);
    }
    const start = s.active ? index(s.active) : 0;
    const col = s.active?.col ?? 0;
    const nextCol = Math.max(
      0,
      Math.min(layout.widths.length - 1, col + colDelta),
    );
    const nextRow = Math.max(
      layout.headerRow ? -1 : 0,
      Math.min(layout.body.length - 1, start + rowDelta),
    );
    selectCell(nextRow, nextCol);
    reveal(nextRow, nextCol);
    return nextRow !== start || nextCol !== col;
  }
  function beginEdit(seed?: string) {
    if (!s.active || !ctx.props().onCellChange || tableTarget(ctx) !== "cell")
      return;
    s.draft =
      seed ??
      ctx.layout().byId.get(s.active.rowId)?.row.cells[s.active.col] ??
      "";
    s.selectOnEdit = seed == null;
    s.editing = true;
  }
  function commitEdit() {
    if (!s.editing || !s.active) return;
    s.editing = false;
    ctx.props().onCellChange?.(s.active.rowId, s.active.col, s.draft);
  }
  function address(value: string) {
    const parsed = parseAddress(value);
    if (!parsed) return;
    const layout = ctx.layout();
    if (parsed.col != null && parsed.col >= layout.widths.length) return;
    if (parsed.row == null && parsed.col != null) {
      selectColumns(parsed.col, parsed.col);
      reveal(0, parsed.col);
      return;
    }
    const entry = parsed.row == null ? undefined : ctx.props().rows[parsed.row];
    if (!entry) return;
    const body =
      layout.headerRow && parsed.row === 0
        ? -1
        : layout.bodyIndex.get(entry.id);
    if (body == null) return;
    if (parsed.col == null) selectRows(body, body);
    else selectCell(body, parsed.col);
    reveal(body, parsed.col ?? 0);
  }
  function reference(): string {
    const cell = s.active;
    if (!cell) return "";
    const number = ctx.layout().byId.get(cell.rowId)?.number;
    const letter = columnLetter(cell.col);
    if (tableTarget(ctx) === "sheet") return "";
    if (tableTarget(ctx) === "row") return String(number ?? "");
    return tableTarget(ctx) === "column" ? letter : letter + (number ?? "");
  }
  function fitColumn(col: number) {
    const surface = s.canvas;
    const context = surface?.getContext("2d");
    if (!surface || !context || !ctx.props().onColumnWidthsChange) return;
    context.font =
      "13px " +
      (surface.ownerDocument.defaultView?.getComputedStyle(surface)
        .fontFamily || "monospace");
    let width = 0;
    for (const entry of ctx.props().rows)
      width = Math.max(
        width,
        ...(entry.cells[col]
          ?.split("\n")
          .map((text) => context.measureText(text).width) ?? [0]),
      );
    const widths = [...ctx.layout().widths];
    widths[col] = clampWidth(width + CELL_PADDING);
    ctx.props().onColumnWidthsChange?.(widths);
  }
  return {
    row,
    index,
    selectCell,
    selectRows,
    selectColumns,
    selectAll,
    reveal,
    move,
    beginEdit,
    commitEdit,
    address,
    reference,
    fitColumn,
  };
}

export type TableNavigation = ReturnType<typeof createNavigation>;
