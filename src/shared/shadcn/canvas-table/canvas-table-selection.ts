import type { CanvasTableRowId } from "./canvas-table-types.js";

export function selectionStatus(
  selected: readonly CanvasTableRowId[],
  filtered: readonly CanvasTableRowId[],
) {
  const ids = new Set(selected);
  const count = filtered.reduce<number>(
    (sum, id) => sum + Number(ids.has(id)),
    0,
  );
  return {
    checked: filtered.length > 0 && count === filtered.length,
    indeterminate: count > 0 && count < filtered.length,
  };
}

export function toggleFiltered(
  selected: readonly CanvasTableRowId[],
  filtered: readonly CanvasTableRowId[],
): CanvasTableRowId[] {
  const ids = new Set(selected);
  if (selectionStatus(selected, filtered).checked)
    filtered.forEach((id) => ids.delete(id));
  else filtered.forEach((id) => ids.add(id));
  return [...ids];
}

export function toggleRow(
  selected: readonly CanvasTableRowId[],
  id: CanvasTableRowId,
): CanvasTableRowId[] {
  const ids = new Set(selected);
  if (ids.has(id)) ids.delete(id);
  else ids.add(id);
  return [...ids];
}
