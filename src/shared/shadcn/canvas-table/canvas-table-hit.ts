import type { TableLayout } from "./canvas-table-layout.js";
import { rowAt } from "./canvas-table-layout.js";
import { LETTER_HEIGHT, SORT_HIT } from "./canvas-table-text.js";

export type TableHit =
  | { kind: "corner" }
  | { kind: "row"; index: number }
  | { kind: "letter"; col: number }
  | { kind: "header"; col: number }
  | { kind: "resize"; col: number }
  | { kind: "sort"; col: number }
  | { kind: "body"; index: number; col: number };

export function hitTest(
  layout: TableLayout,
  x: number,
  y: number,
  left: number,
  top: number,
): TableHit | null {
  if (x < 0 || y < 0 || !layout.widths.length) return null;
  const inGutter = x < layout.gutter;
  if (inGutter && y < LETTER_HEIGHT) return { kind: "corner" };
  const docX = x + left;
  let col = layout.edges.findIndex(
    (edge, i) =>
      i < layout.widths.length &&
      docX >= edge &&
      docX < (layout.edges[i + 1] ?? 0),
  );
  if (y < LETTER_HEIGHT && !inGutter) {
    const boundary = layout.edges.findIndex(
      (edge, i) => i > 0 && Math.abs(docX - edge) <= 5,
    );
    if (boundary > 0) return { kind: "resize", col: boundary - 1 };
    if (col < 0) return null;
    if (layout.sortable && (layout.edges[col + 1] ?? 0) - docX <= SORT_HIT)
      return { kind: "sort", col };
    return { kind: "letter", col };
  }
  if (layout.headerRow && y < layout.chrome) {
    return inGutter
      ? { kind: "row", index: -1 }
      : col < 0
        ? null
        : { kind: "header", col };
  }
  const bodyY = y - layout.chrome + top;
  if (bodyY < 0 || bodyY >= (layout.offsets.at(-1) ?? 0)) return null;
  const index = rowAt(layout.offsets, bodyY);
  if (inGutter) return { kind: "row", index };
  return col < 0 ? null : { kind: "body", index, col };
}
