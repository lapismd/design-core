import type { ExpandedBlockState } from "../core/unified-diff.js";

export function expandTop(
  current: ExpandedBlockState,
  id: string,
  count: number,
): ExpandedBlockState {
  const existing = current[id];
  if (typeof existing === "object" && existing !== null) {
    return {
      ...current,
      [id]: { top: existing.top + count, bottom: existing.bottom },
    };
  }
  return { ...current, [id]: { top: count, bottom: 0 } };
}

export function expandBottom(
  current: ExpandedBlockState,
  id: string,
  count: number,
): ExpandedBlockState {
  const existing = current[id];
  if (typeof existing === "object" && existing !== null) {
    return {
      ...current,
      [id]: { top: existing.top, bottom: existing.bottom + count },
    };
  }
  return { ...current, [id]: { top: 0, bottom: count } };
}

export function expandAll(
  current: ExpandedBlockState,
  id: string,
): ExpandedBlockState {
  if (current[id] === true) {
    const next = { ...current };
    delete next[id];
    return next;
  }
  return { ...current, [id]: true };
}
