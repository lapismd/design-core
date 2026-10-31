import { untrack } from "svelte";
import { inferCanvasTableColumnTypes } from "./canvas-table-filter-inference.js";
import {
  filteredCanvasTableIds,
  type CanvasTableResolvedField,
} from "./canvas-table-filter-match.js";
import { columnLetter } from "./canvas-table-text.js";
import type { CanvasTableFilterColumn } from "./canvas-table-filter-types.js";
import type { CanvasTableProps } from "./canvas-table-types.js";
import type { FilterType } from "../filter-builder/index.js";

export function createCanvasTableFiltering(props: () => CanvasTableProps) {
  const cache = new Map<string, FilterType>();
  let key: string | number | undefined;
  let settings = "";
  let hadData = false;
  const fields = $derived.by((): CanvasTableResolvedField[] => {
    const p = props();
    const config = p.filtering;
    if (!config) return [];
    const nextSettings =
      String(p.headerRow ?? true) + ":" + (config.sampleSize ?? 100);
    const hasData = p.rows.length > ((p.headerRow ?? true) ? 1 : 0);
    const columns: readonly CanvasTableFilterColumn[] =
      config.columns ??
      p.columnWidths.map((_, column) => ({ id: "column:" + column, column }));
    if (
      key !== config.inferenceKey ||
      settings !== nextSettings ||
      (!hadData && hasData)
    ) {
      cache.clear();
      key = config.inferenceKey;
      settings = nextSettings;
    }
    hadData = hasData || hadData;
    const missing = columns.some((column) => !cache.has(column.id));
    if (missing) {
      const inferred = untrack(() =>
        inferCanvasTableColumnTypes(p.rows, {
          columnCount: p.columnWidths.length,
          headerRow: p.headerRow,
          sampleSize: config.sampleSize,
        }),
      );
      for (const column of columns)
        if (!cache.has(column.id))
          cache.set(column.id, inferred[column.column] ?? "text");
    }
    const labels = columns.map(
      (column) =>
        column.label ||
        ((p.headerRow ?? true) ? p.rows[0]?.cells[column.column] : "") ||
        columnLetter(column.column),
    );
    return columns.map((column, index) => ({
      id: column.id,
      column: column.column,
      label:
        labels.filter((label) => label === labels[index]).length > 1
          ? labels[index] + " (" + columnLetter(column.column) + ")"
          : labels[index]!,
      type:
        column.type && column.type !== "auto"
          ? column.type
          : (cache.get(column.id) ?? "text"),
      allowTypeOverride: !column.type || column.type === "auto",
      options: column.options,
    }));
  });
  const ids = $derived(filteredCanvasTableIds(props(), fields));
  return {
    get fields() {
      return fields;
    },
    get ids() {
      return ids;
    },
  };
}
