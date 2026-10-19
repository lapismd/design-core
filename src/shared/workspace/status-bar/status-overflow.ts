import type { WorkspaceStatusItem } from "../core/types.js";

/** Keep display order intact while removing the lowest-priority entries first. */
export function statusOverflow(
  items: readonly WorkspaceStatusItem[],
  widths: ReadonlyMap<string, number>,
  available: number,
  triggerWidth = 24,
  gap = 4,
): Set<string> {
  const hidden = new Set<string>();
  const used = (visible: readonly WorkspaceStatusItem[]) =>
    visible.reduce((sum, item) => sum + (widths.get(item.id) ?? 0), 0) +
    Math.max(0, visible.length - 1) * gap;
  if (used(items) <= available) return hidden;
  const candidates = items
    .map((item, index) => ({ item, index }))
    .sort(
      (a, b) =>
        (a.item.priority ?? 0) - (b.item.priority ?? 0) || b.index - a.index,
    );
  for (const { item } of candidates) {
    hidden.add(item.id);
    const visible = items.filter((entry) => !hidden.has(entry.id));
    if (used(visible) + triggerWidth + (visible.length ? gap : 0) <= available)
      break;
  }
  return hidden;
}
