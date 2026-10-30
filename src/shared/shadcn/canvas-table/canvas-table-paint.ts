import { tableTarget } from "./canvas-table-commands.js";
import type { TableContext } from "./canvas-table-context.js";
import type { Cell } from "./canvas-table-types.js";
import {
  visibleRows,
  visibleColumns,
  cellRect,
} from "./canvas-table-layout.js";
import {
  columnLetter,
  LETTER_HEIGHT,
  HEADER_HEIGHT,
  SORT_HIT,
} from "./canvas-table-text.js";
import { readTableTheme } from "./canvas-table-theme.js";
import { clip, fill, paintText } from "./canvas-table-paint-text.js";

export function paintTable(context: TableContext): void {
  const s = context.state;
  void s.epoch;
  const canvas = s.canvas;
  if (!canvas) return;
  const layout = context.layout();
  const props = context.props();
  const width = Math.max(1, s.width);
  const height = Math.max(1, s.height);
  const scale = canvas.ownerDocument.defaultView?.devicePixelRatio || 1;
  canvas.style.width = width + "px";
  canvas.style.height = height + "px";
  if (
    canvas.width !== Math.round(width * scale) ||
    canvas.height !== Math.round(height * scale)
  ) {
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
  }
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  const theme = readTableTheme(canvas);
  fill(ctx, theme.background, 0, 0, width, height);
  ctx.font =
    "13px " +
    (canvas.ownerDocument.defaultView?.getComputedStyle(canvas).fontFamily ||
      "monospace");
  const rows = visibleRows(layout, s.top, height);
  const cols = visibleColumns(layout, s.left, width);
  const selectedIds = new Set(props.rowSelection ? props.selectedRowIds : []);
  const range = s.range;
  const selected = (index: number, col: number) =>
    Boolean(
      range &&
        index >= range.startIndex &&
        index <= range.endIndex &&
        col >= range.startCol &&
        col <= range.endCol,
    );
  clip(
    ctx,
    layout.gutter,
    layout.chrome,
    width - layout.gutter,
    height - layout.chrome,
    () => {
      for (let index = rows.start; index < rows.end; index++) {
        const entry = layout.body[index];
        if (!entry) continue;
        for (let col = cols.start; col < cols.end; col++) {
          const box = cellRect(layout, index, col);
          const x = box.x - s.left;
          const y = box.y - s.top;
          fill(ctx, theme.background, x, y, box.width, box.height);
          if (selected(index, col) || selectedIds.has(entry.row.id))
            fill(ctx, theme.selection, x, y, box.width, box.height);
          ctx.fillStyle = s.colours
            ? (theme.columns[col % theme.columns.length] ?? theme.text)
            : theme.text;
          paintText(
            ctx,
            entry.row.cells[col] ?? "",
            x,
            y,
            box.width,
            box.height,
            s.wrap,
          );
          fill(ctx, theme.grid, x, y + box.height - 1, box.width, 1);
          fill(ctx, theme.grid, x + box.width - 1, y, 1, box.height);
        }
      }
    },
  );
  clip(ctx, layout.gutter, 0, width - layout.gutter, layout.chrome, () => {
    fill(ctx, theme.header, layout.gutter, 0, width, layout.chrome);
    for (let col = cols.start; col < cols.end; col++) {
      const x = (layout.edges[col] ?? 0) - s.left;
      const w = layout.widths[col] ?? 0;
      const picked =
        range &&
        range.startIndex <= 0 &&
        range.endIndex >= layout.body.length - 1 &&
        col >= range.startCol &&
        col <= range.endCol;
      if (picked) fill(ctx, theme.selection, x, 0, w, LETTER_HEIGHT);
      ctx.fillStyle = theme.muted;
      paintText(
        ctx,
        columnLetter(col),
        x,
        0,
        w - (props.onSort ? SORT_HIT : 0),
        LETTER_HEIGHT,
        false,
        true,
      );
      if (layout.headerRow) {
        fill(
          ctx,
          s.colours
            ? (theme.headerTints[col % theme.headerTints.length] ??
                theme.header)
            : theme.header,
          x,
          LETTER_HEIGHT,
          w,
          HEADER_HEIGHT,
        );
        if (picked || selected(-1, col))
          fill(ctx, theme.selection, x, LETTER_HEIGHT, w, HEADER_HEIGHT);
        ctx.fillStyle = s.colours
          ? (theme.columns[col % theme.columns.length] ?? theme.text)
          : theme.text;
        paintText(
          ctx,
          props.rows[0]?.cells[col] ?? "",
          x,
          LETTER_HEIGHT,
          w,
          HEADER_HEIGHT,
        );
      }
      fill(ctx, theme.grid, x + w - 1, 0, 1, layout.chrome);
    }
    fill(ctx, theme.grid, layout.gutter, LETTER_HEIGHT - 1, width, 1);
    fill(ctx, theme.grid, layout.gutter, layout.chrome - 1, width, 1);
  });
  // Paint the frozen gutter after the scrolling body so grid lines cannot bleed through.
  fill(ctx, theme.gutter, 0, 0, layout.gutter, height);
  clip(ctx, 0, layout.chrome, layout.gutter, height - layout.chrome, () => {
    for (let index = rows.start; index < rows.end; index++) {
      const entry = layout.body[index];
      const box = cellRect(layout, index, 0);
      const y = box.y - s.top;
      if (
        selectedIds.has(entry?.row.id ?? "") ||
        (range &&
          selected(index, 0) &&
          selected(index, layout.widths.length - 1))
      )
        fill(ctx, theme.selection, 0, y, layout.gutter, box.height);
      ctx.fillStyle = theme.muted;
      paintText(
        ctx,
        String(entry?.number ?? ""),
        0,
        y,
        layout.numberWidth,
        box.height,
        false,
        true,
      );
      fill(ctx, theme.grid, 0, y + box.height - 1, layout.gutter, 1);
    }
  });
  if (tableTarget(context) === "sheet" && range)
    fill(ctx, theme.selection, 0, 0, layout.gutter, LETTER_HEIGHT);
  if (layout.headerRow) {
    if (selected(-1, 0))
      fill(
        ctx,
        theme.selection,
        0,
        LETTER_HEIGHT,
        layout.gutter,
        HEADER_HEIGHT,
      );
    ctx.fillStyle = theme.muted;
    paintText(
      ctx,
      "1",
      0,
      LETTER_HEIGHT,
      layout.numberWidth,
      HEADER_HEIGHT,
      false,
      true,
    );
  }
  fill(ctx, theme.grid, 0, LETTER_HEIGHT - 1, layout.gutter, 1);
  fill(ctx, theme.grid, 0, layout.chrome - 1, layout.gutter, 1);
  if (layout.gutter) fill(ctx, theme.grid, layout.gutter - 1, 0, 1, height);
  function outline(cell: Cell | null, color: string) {
    if (!cell) return;
    const isHeader = layout.headerRow && props.rows[0]?.id === cell.rowId;
    const index = isHeader ? -1 : layout.bodyIndex.get(cell.rowId);
    if (index == null) return;
    const box = cellRect(layout, index, cell.col);
    const y = box.y - (isHeader ? 0 : s.top);
    clip(
      ctx!,
      layout.gutter,
      isHeader ? LETTER_HEIGHT : layout.chrome,
      width - layout.gutter,
      isHeader ? HEADER_HEIGHT : height - layout.chrome,
      () => {
        ctx!.strokeStyle = color;
        ctx!.lineWidth = 2;
        ctx!.strokeRect(
          box.x - s.left + 1,
          y + 1,
          Math.max(0, box.width - 2),
          Math.max(0, box.height - 2),
        );
      },
    );
  }
  if (props.searchCell)
    outline(
      { rowId: props.searchCell.rowId, col: props.searchCell.column },
      theme.search,
    );
  if (tableTarget(context) === "cell") outline(s.active, theme.accent);
}
