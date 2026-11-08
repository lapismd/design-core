import type {
  KanbanActivityDay,
  KanbanActivityEntry,
  KanbanColumnData,
} from "./kanban-types.js";

/** An explicit missing/null anchor never falls back to a different column. */
export function resolveKanbanAnchor(
  columns: KanbanColumnData[],
  anchor: string | null | undefined,
): string | null {
  if (anchor === null) return null;
  if (anchor !== undefined)
    return columns.some((column) => column.id === anchor) ? anchor : null;
  return columns.find((column) => column.primary)?.id ?? columns[0]?.id ?? null;
}

function activityDate(value: string | null | undefined): Date | null {
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    const parsed = new Date(year, month - 1, day);
    return parsed.getFullYear() === year &&
      parsed.getMonth() === month - 1 &&
      parsed.getDate() === day
      ? parsed
      : null;
  }
  // Reject non-ISO text instead of interpreting arbitrary numbers/labels as dates.
  if (!/^\d{4}-\d{2}-\d{2}T/.test(value)) return null;
  const literal = activityDate(value.slice(0, 10));
  if (!literal) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Pure timeline projection. The host chooses one date property for all records. */
export function buildKanbanActivityDays(
  entries: KanbanActivityEntry[],
): KanbanActivityDay[] {
  const days = new Map<string, KanbanActivityDay>();
  for (const entry of entries) {
    const date = activityDate(entry.date);
    const key = date
      ? `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`
      : "undated";
    const day = days.get(key) ?? { key, date, entries: [] };
    day.entries.push(entry);
    days.set(key, day);
  }
  return [...days.values()]
    .sort((a, b) =>
      a.key === "undated"
        ? 1
        : b.key === "undated"
          ? -1
          : b.key.localeCompare(a.key),
    )
    .map((day) => ({
      ...day,
      entries: [...day.entries].sort(
        (a, b) =>
          (activityDate(b.date)?.getTime() ?? 0) -
          (activityDate(a.date)?.getTime() ?? 0),
      ),
    }));
}

/** Calendar-day difference is immune to daylight-saving clock transitions. */
export function kanbanDayGap(newer: Date, older: Date): number {
  const day = (value: Date) =>
    Date.UTC(value.getFullYear(), value.getMonth(), value.getDate());
  return Math.max(0, Math.round((day(newer) - day(older)) / 86_400_000) - 1);
}
