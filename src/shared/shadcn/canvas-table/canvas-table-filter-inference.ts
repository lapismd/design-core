import {
  isFilterDate,
  isFilterDatetime,
  parseFilterNumber,
} from "../filter-builder/filter-builder-values.js";
import type { FilterType } from "../filter-builder/filter-builder-types.js";
import type { CanvasTableRow } from "./canvas-table-types.js";

export interface CanvasTableInferenceOptions {
  columnCount: number;
  headerRow?: boolean | undefined;
  sampleSize?: number | undefined;
}
/** Bounded source-order sampling; blanks consume the bound but not the vote. */
export function inferCanvasTableColumnTypes(
  rows: readonly CanvasTableRow[],
  options: CanvasTableInferenceOptions,
): FilterType[] {
  const size = options.sampleSize ?? 100;
  if (!Number.isInteger(size) || size < 1)
    throw new RangeError("sampleSize must be a positive integer");
  const start = (options.headerRow ?? true) ? 1 : 0;
  const types: (FilterType | null)[] = Array.from(
    { length: options.columnCount },
    () => null,
  );
  for (let i = start; i < Math.min(rows.length, start + size); i++) {
    for (let col = 0; col < options.columnCount; col++) {
      const value = (rows[i]?.cells[col] ?? "").trim();
      if (!value) continue;
      let type: FilterType = "text";
      if (/^(true|false)$/i.test(value)) type = "boolean";
      else if (!/^[+-]?0\d/.test(value) && parseFilterNumber(value) !== null)
        type = "number";
      else if (isFilterDate(value)) type = "date";
      else if (isFilterDatetime(value)) type = "datetime";
      types[col] = types[col] == null || types[col] === type ? type : "text";
    }
  }
  return types.map((type) => type ?? "text");
}
