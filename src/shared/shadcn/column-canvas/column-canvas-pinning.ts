import type { ColumnCanvasResolvedDisplayMode } from "./column-canvas-types.js";

/** Measured visible columns, in DOM order. Closed/path-hidden columns are omitted. */
export type PinningColumn = {
  id: string;
  kind: "fixed" | "sticky" | null;
  expanded: boolean;
  width: number;
  minWidth: number;
  marginStart: number;
  marginEnd: number;
};
export type PinningSlot = {
  id: string;
  kind: "fixed" | "sticky";
  offset: number;
  width: number;
};
export type PinningLayout = {
  slots: PinningSlot[];
  extent: number;
  prefixLength: number;
};

/** Choose the longest leading pin group that leaves a usable scrolling stage. */
export function resolveColumnCanvasPinning(
  columns: readonly PinningColumn[],
  options: {
    mode: ColumnCanvasResolvedDisplayMode;
    availableWidth: number;
    gap: number;
    railWidth: number;
    contextWidth: number;
    activePairLeadingId: string | null;
  },
): PinningLayout {
  const empty = { slots: [], extent: 0, prefixLength: 0 };
  if (options.mode === "compact") return empty;
  let end = columns.findIndex((column) => column.kind === null);
  if (end < 0) end = columns.length;
  while (end > 0) {
    const slots: PinningSlot[] = [];
    let extent = 0;
    for (const [index, column] of columns.slice(0, end).entries()) {
      const fixed = column.kind === "fixed";
      if (index && (fixed || slots[index - 1]!.kind === "fixed"))
        extent += options.gap;
      if (fixed) extent += column.marginStart;
      const width =
        fixed || !column.expanded
          ? column.width
          : Math.min(column.width, options.railWidth);
      slots.push({ id: column.id, kind: column.kind!, offset: extent, width });
      extent += width + (fixed ? column.marginEnd : 0);
    }
    const lastFixed = slots.map((slot) => slot.kind).lastIndexOf("fixed");
    // Legacy sticky-only canvases keep their existing rail and allocation contract.
    if (lastFixed < 0) return { slots, extent, prefixLength: end };
    const remaining = columns.slice(end);
    const reserve = scrollingMinimum(remaining, options);
    const separatingGap = remaining.length ? options.gap : 0;
    if (extent + separatingGap + reserve <= options.availableWidth)
      return { slots, extent, prefixLength: end };
    // This fixed column and subsequent pins flow normally until capacity returns.
    end = lastFixed;
  }
  return empty;
}

function scrollingMinimum(
  columns: readonly PinningColumn[],
  options: {
    mode: ColumnCanvasResolvedDisplayMode;
    gap: number;
    contextWidth: number;
    activePairLeadingId: string | null;
  },
): number {
  const outer = (column: PinningColumn) =>
    (column.expanded ? column.minWidth : column.width) +
    column.marginStart +
    column.marginEnd;
  if (options.mode === "fixed") return Math.max(0, ...columns.map(outer));
  const expanded = columns.filter((column) => column.expanded);
  if (!expanded.length)
    return (
      columns.reduce((sum, column) => sum + outer(column), 0) +
      Math.max(0, columns.length - 1) * options.gap
    );
  const requested = expanded.findIndex(
    (column) => column.id === options.activePairLeadingId,
  );
  const start =
    requested >= 0 && requested < expanded.length - 1
      ? requested
      : Math.max(0, expanded.length - 2);
  const pair = expanded.slice(start, start + 2);
  const context = expanded[start - 1];
  const stage = columns.slice(columns.indexOf(context ?? pair[0]!));
  return (
    pair.reduce((sum, column) => sum + outer(column), 0) +
    (context
      ? Math.min(options.contextWidth, context.width) +
        context.marginStart +
        context.marginEnd
      : 0) +
    stage
      .filter((column) => !column.expanded)
      .reduce((sum, column) => sum + outer(column), 0) +
    Math.max(0, stage.length - 1) * options.gap
  );
}
