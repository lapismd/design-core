import type {
  BodyEntry,
  CanvasTableProps,
  CanvasTableRowId,
} from "./canvas-table-types.js";
import {
  clampWidth,
  wrapLines,
  ROW_HEIGHT,
  LETTER_HEIGHT,
  HEADER_HEIGHT,
  CELL_PADDING,
} from "./canvas-table-text.js";

export interface TableLayout {
  body: BodyEntry[];
  byId: Map<CanvasTableRowId, BodyEntry>;
  bodyIndex: Map<CanvasTableRowId, number>;
  widths: number[];
  edges: number[];
  offsets: number[];
  gutter: number;
  numberWidth: number;
  checkboxWidth: number;
  chrome: number;
  headerRow: boolean;
  sortable: boolean;
  width: number;
  height: number;
}

export function createLayout(
  props: CanvasTableProps,
  wrap = false,
  measure: (text: string) => number = (text) => text.length * 7.8,
): TableLayout {
  const headerRow = props.headerRow ?? true;
  const byId = new Map<CanvasTableRowId, BodyEntry>();
  props.rows.forEach((row, index) => {
    if (byId.has(row.id))
      throw new Error("CanvasTable row IDs must be unique: " + row.id);
    byId.set(row.id, { row, number: index + 1 });
  });
  const headerId = headerRow ? props.rows[0]?.id : undefined;
  const ids = props.visibleRowIds ?? props.rows.map((row) => row.id);
  const seen = new Set<CanvasTableRowId>();
  const body: BodyEntry[] = [];
  for (const id of ids) {
    const entry = byId.get(id);
    if (!entry || id === headerId || seen.has(id)) continue;
    seen.add(id);
    body.push(entry);
  }
  const widths = props.columnWidths.map(clampWidth);
  const numberWidth =
    (props.rowNumbers ?? true)
      ? Math.max(48, measure(String(props.rows.length)) + 16)
      : 0;
  const checkboxWidth = props.rowSelection ? 32 : 0;
  const gutter = numberWidth + checkboxWidth;
  const edges = [gutter];
  for (const width of widths) edges.push((edges.at(-1) ?? gutter) + width);
  const offsets = [0];
  for (const entry of body) {
    let lines = 1;
    if (wrap)
      widths.forEach((width, col) => {
        lines = Math.max(
          lines,
          wrapLines(entry.row.cells[col] ?? "", width - CELL_PADDING, measure)
            .length,
        );
      });
    offsets.push(
      (offsets.at(-1) ?? 0) +
        Math.max(ROW_HEIGHT, 12 + Math.min(lines, 4) * 16),
    );
  }
  const chrome = LETTER_HEIGHT + (headerRow ? HEADER_HEIGHT : 0);
  return {
    body,
    byId,
    bodyIndex: new Map(body.map((entry, i) => [entry.row.id, i])),
    widths,
    edges,
    offsets,
    gutter,
    numberWidth,
    checkboxWidth,
    chrome,
    headerRow,
    sortable: Boolean(props.onSort),
    width: edges.at(-1) ?? gutter,
    height: chrome + (offsets.at(-1) ?? 0),
  };
}

export function rowAt(offsets: readonly number[], y: number): number {
  let low = 0;
  let high = Math.max(0, offsets.length - 2);
  while (low < high) {
    const mid = Math.ceil((low + high) / 2);
    if ((offsets[mid] ?? 0) <= y) low = mid;
    else high = mid - 1;
  }
  return low;
}

export function visibleRows(layout: TableLayout, top: number, height: number) {
  if (!layout.body.length) return { start: 0, end: 0 };
  return {
    start: Math.max(0, rowAt(layout.offsets, top) - 4),
    end: Math.min(
      layout.body.length,
      rowAt(layout.offsets, top + Math.max(height, ROW_HEIGHT)) + 5,
    ),
  };
}

export function visibleColumns(
  layout: TableLayout,
  left: number,
  width: number,
) {
  let start = 0;
  while (
    start < layout.widths.length &&
    (layout.edges[start + 1] ?? 0) <= left + layout.gutter
  )
    start++;
  let end = start;
  while (end < layout.widths.length && (layout.edges[end] ?? 0) < left + width)
    end++;
  return { start, end };
}

export function cellRect(layout: TableLayout, index: number, col: number) {
  const top =
    index < 0 ? LETTER_HEIGHT : layout.chrome + (layout.offsets[index] ?? 0);
  return {
    x: layout.edges[col] ?? layout.gutter,
    y: top,
    width: layout.widths[col] ?? 0,
    height:
      index < 0
        ? HEADER_HEIGHT
        : (layout.offsets[index + 1] ?? 0) - (layout.offsets[index] ?? 0),
  };
}
