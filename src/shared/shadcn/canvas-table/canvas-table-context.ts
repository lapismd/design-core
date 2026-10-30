import type {
  CanvasTableProps,
  Cell,
  CellRange,
} from "./canvas-table-types.js";
import type { TableLayout } from "./canvas-table-layout.js";

export interface TableState {
  active: Cell | null;
  range: CellRange | null;
  target: "cell" | "row" | "column" | "sheet";
  editing: boolean;
  draft: string;
  selectOnEdit: boolean;
  wrap: boolean;
  colours: boolean;
  left: number;
  top: number;
  width: number;
  height: number;
  epoch: number;
  scroller: HTMLDivElement | null;
  canvas: HTMLCanvasElement | null;
  menu: { x: number; y: number } | null;
  drag: {
    kind: "resize" | "cell" | "row" | "column";
    index: number;
    col: number;
    x: number;
    width: number;
    moved: boolean;
  } | null;
}

export interface TableContext {
  props: () => CanvasTableProps;
  layout: () => TableLayout;
  state: TableState;
}
