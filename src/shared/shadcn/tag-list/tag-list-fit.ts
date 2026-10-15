export type TagListFit = { visibleCount: number; firstWidth?: number };

/** Fit an ordered prefix using measured chip, gap and count-button widths. */
export function fitTags(
  widths: readonly number[],
  available: number,
  gap: number,
  overflowWidths: readonly number[],
  firstMinimum: number,
): TagListFit {
  const total = widths.length;
  if (!total) return { visibleCount: 0 };
  const space = Math.max(0, available);
  const full =
    widths.reduce((sum, width) => sum + width, 0) + gap * (total - 1);
  if (full <= space) return { visibleCount: total };

  let used = 0;
  let count = 0;
  for (let index = 0; index < total - 1; index++) {
    used += (widths[index] ?? 0) + (index ? gap : 0);
    const hidden = total - index - 1;
    if (used + gap + (overflowWidths[hidden] ?? Infinity) <= space)
      count = index + 1;
  }
  if (count) return { visibleCount: count };
  const firstSpace =
    total === 1 ? space : space - gap - (overflowWidths[total - 1] ?? Infinity);
  if (firstSpace >= firstMinimum && firstSpace > 0)
    return { visibleCount: 1, firstWidth: firstSpace };
  return { visibleCount: 0 };
}
