import type { CanvasTableFiltering } from "./canvas-table-filter-types.js";
import type { Snippet } from "svelte";

export type CanvasTableRowId = string | number;

/** IDs must be unique and remain stable across edits, sorting and filtering. */
export interface CanvasTableRow {
  id: CanvasTableRowId;
  cells: readonly string[];
}

export type CanvasTableCommandId =
  | "move-left"
  | "move-right"
  | "move-up"
  | "move-down"
  | "clear"
  | "delete";

/** The host applies commands; clear/delete on a cell clear its value. */
export interface CanvasTableCommand {
  id: CanvasTableCommandId;
  target: "cell" | "row" | "column" | "sheet";
  rowId: CanvasTableRowId;
  column: number;
}

export interface CanvasTableProps {
  rows: readonly CanvasTableRow[];
  /** One width per column, in CSS pixels; controlled by the host. */
  columnWidths: readonly number[];
  /** Filtered body order. Omit to show all rows; the fixed header is excluded. */
  visibleRowIds?: readonly CanvasTableRowId[] | undefined;
  /** Opt in to controlled structured filtering of provided cells. */
  filtering?: CanvasTableFiltering | undefined;
  headerRow?: boolean | undefined;
  rowNumbers?: boolean | undefined;
  rowSelection?: boolean | undefined;
  selectedRowIds?: readonly CanvasTableRowId[] | undefined;
  onSelectedRowIdsChange?: ((ids: CanvasTableRowId[]) => void) | undefined;
  onCellChange?:
    | ((rowId: CanvasTableRowId, column: number, value: string) => void)
    | undefined;
  onColumnWidthsChange?: ((widths: number[]) => void) | undefined;
  onSort?: ((column: number) => void) | undefined;
  sort?: { column: number; direction: "asc" | "desc" } | null | undefined;
  onCommand?: ((command: CanvasTableCommand) => void) | undefined;
  onHeaderRowChange?: ((headerRow: boolean) => void) | undefined;
  canUndo?: boolean | undefined;
  canRedo?: boolean | undefined;
  onUndo?: (() => void) | undefined;
  onRedo?: (() => void) | undefined;
  /** Host-owned actions; this component never applies bulk mutations. */
  selectionActions?: Snippet<[readonly CanvasTableRowId[]]> | undefined;
  /** Optional host search result to outline without owning search policy. */
  searchCell?: { rowId: CanvasTableRowId; column: number } | null | undefined;
  "aria-label"?: string | undefined;
  class?: string | undefined;
}

export interface Cell {
  rowId: CanvasTableRowId;
  col: number;
}

export interface CellRange {
  startIndex: number;
  endIndex: number;
  startCol: number;
  endCol: number;
}

export interface BodyEntry {
  row: CanvasTableRow;
  number: number;
}
