import type { Snippet } from "svelte";
import type { CanvasTableRow, CanvasTableRowId } from "./canvas-table-types.js";

export interface CanvasTableColumnContext {
  id: string;
  label: string;
  column: number;
}
export interface CanvasTableCellContext extends CanvasTableColumnContext {
  row: CanvasTableRow;
  rowNumber: number;
  value: string;
  expanded: boolean;
  toggleExpanded: () => void;
}
export interface CanvasTableRowContext {
  row: CanvasTableRow;
  rowNumber: number;
  close: () => void;
}
export interface CanvasTableColumn {
  id: string;
  label: string;
  header?: Snippet<[CanvasTableColumnContext]> | undefined;
  cell?: Snippet<[CanvasTableCellContext]> | undefined;
}
export interface CanvasTableSelection {
  mode?: "single" | "multiple" | undefined;
  required?: boolean | undefined;
  disabled?: boolean | undefined;
}
export interface CanvasTableToolbarContext {
  selectedRowIds: readonly CanvasTableRowId[];
  commitEdit: () => void;
}
