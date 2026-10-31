import type {
  FilterOption,
  FilterType,
  StructuredFilterState,
} from "../filter-builder/index.js";

/** Hosts moving columns must update their stable-ID index mappings. */
export interface CanvasTableFilterColumn {
  id: string;
  column: number;
  label?: string | undefined;
  type?: FilterType | "auto" | undefined;
  options?: readonly FilterOption[] | undefined;
}
export interface CanvasTableFiltering {
  value: StructuredFilterState;
  onValueChange: (value: StructuredFilterState) => void;
  columns?: readonly CanvasTableFilterColumn[] | undefined;
  sampleSize?: number | undefined;
  /** Change to re-sample source data; ordinary edits retain detected modes. */
  inferenceKey?: string | number | undefined;
}
