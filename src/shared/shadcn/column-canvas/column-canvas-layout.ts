export type ColumnCanvasWidthBounds = {
  preferredWidth: number;
  minWidth: number;
  /** Maximum width, or `null` when the column is unbounded. */
  maxWidth: number | null;
};

export type ColumnCanvasPairAllocation = {
  leadingWidth: number;
  trailingWidth: number;
  usedWidth: number;
  /** Width beyond the available stage when minimums cannot fit. */
  overflow: number;
  /** Unused stage width when finite maximums cannot fill it. */
  slack: number;
  leadingFraction: number;
};

/**
 * Allocate a bounded adjacent pair without changing its shared stage width.
 * The preferred ratio is used when no persisted ratio exists. Minimum overflow
 * and finite-maximum slack are intentional and reported to the caller.
 */
export function allocateColumnCanvasPair(
  availableWidth: number,
  leading: ColumnCanvasWidthBounds,
  trailing: ColumnCanvasWidthBounds,
  leadingFraction?: number,
): ColumnCanvasPairAllocation {
  const available = finiteNonNegative(availableWidth);
  const leadingBounds = normalizeBounds(leading);
  const trailingBounds = normalizeBounds(trailing);
  const ratio = normalizeFraction(
    leadingFraction,
    preferredFraction(leadingBounds, trailingBounds),
  );

  const minimumTotal = leadingBounds.minWidth + trailingBounds.minWidth;
  if (minimumTotal > available) {
    return allocation(
      leadingBounds.minWidth,
      trailingBounds.minWidth,
      available,
    );
  }

  const maximumTotal = addMaximums(
    leadingBounds.maxWidth,
    trailingBounds.maxWidth,
  );
  if (maximumTotal !== null && maximumTotal < available) {
    return allocation(
      leadingBounds.maxWidth ?? leadingBounds.minWidth,
      trailingBounds.maxWidth ?? trailingBounds.minWidth,
      available,
    );
  }

  const lowerLeading = Math.max(
    leadingBounds.minWidth,
    trailingBounds.maxWidth === null ? 0 : available - trailingBounds.maxWidth,
  );
  const upperLeading = Math.min(
    leadingBounds.maxWidth ?? available,
    available - trailingBounds.minWidth,
  );
  const leadingWidth = clamp(available * ratio, lowerLeading, upperLeading);
  return allocation(leadingWidth, available - leadingWidth, available);
}

/** Fill a single-member stage while respecting the column's own bounds. */
export function allocateColumnCanvasWidth(
  availableWidth: number,
  bounds: ColumnCanvasWidthBounds,
): number {
  const available = finiteNonNegative(availableWidth);
  const normalized = normalizeBounds(bounds);
  return clamp(
    available,
    normalized.minWidth,
    normalized.maxWidth ?? Number.POSITIVE_INFINITY,
  );
}

function allocation(
  leadingWidth: number,
  trailingWidth: number,
  availableWidth: number,
): ColumnCanvasPairAllocation {
  const usedWidth = leadingWidth + trailingWidth;
  return {
    leadingWidth,
    trailingWidth,
    usedWidth,
    overflow: Math.max(0, usedWidth - availableWidth),
    slack: Math.max(0, availableWidth - usedWidth),
    leadingFraction: usedWidth > 0 ? leadingWidth / usedWidth : 0.5,
  };
}

function normalizeBounds(
  bounds: ColumnCanvasWidthBounds,
): ColumnCanvasWidthBounds {
  const minWidth = finiteNonNegative(bounds.minWidth);
  const maxWidth =
    bounds.maxWidth === null
      ? null
      : Math.max(minWidth, finiteNonNegative(bounds.maxWidth));
  return {
    minWidth,
    maxWidth,
    preferredWidth: clamp(
      finiteNonNegative(bounds.preferredWidth),
      minWidth,
      maxWidth ?? Number.POSITIVE_INFINITY,
    ),
  };
}

function preferredFraction(
  leading: ColumnCanvasWidthBounds,
  trailing: ColumnCanvasWidthBounds,
): number {
  const total = leading.preferredWidth + trailing.preferredWidth;
  return total > 0 ? leading.preferredWidth / total : 0.5;
}

function normalizeFraction(
  value: number | undefined,
  fallback: number,
): number {
  if (
    !Number.isFinite(value) ||
    value === undefined ||
    value <= 0 ||
    value >= 1
  ) {
    return fallback;
  }
  return value;
}

function addMaximums(
  leading: number | null,
  trailing: number | null,
): number | null {
  return leading === null || trailing === null ? null : leading + trailing;
}

function finiteNonNegative(value: number): number {
  return Number.isFinite(value) ? Math.max(0, value) : 0;
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(maximum, Math.max(minimum, value));
}
