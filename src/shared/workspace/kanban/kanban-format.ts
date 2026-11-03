/**
 * Shared date formatting for kanban card and detail surfaces. Parseable dates
 * render as "MMM d" (card) or "MMM d, yyyy" (detail); anything else passes
 * through unchanged, matching the legacy Fizzy board behaviour.
 */
export function formatKanbanDate(
  value: string | null | undefined,
  options?: { year?: boolean },
): string {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? value
    : parsed.toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        ...(options?.year ? { year: "numeric" } : {}),
      });
}
