import type { WorkspaceObjectProperty } from "./types.js";

export function defaultPropertyValue(
  property: WorkspaceObjectProperty,
): string | number | boolean {
  if (property.default !== undefined) return property.default;
  if (property.type === "boolean") return false;
  if (property.type === "number" || property.type === "integer") return 0;
  return "";
}

export function createObjectRow(
  properties: WorkspaceObjectProperty[],
): Record<string, unknown> {
  const row: Record<string, unknown> = {};
  for (const property of properties) {
    row[property.id] = defaultPropertyValue(property);
  }
  return row;
}

export function nextObjectMapKey(
  current: Record<string, unknown>,
  prefix = "item",
): string {
  let index = 1;
  while (`${prefix}-${index}` in current) index += 1;
  return `${prefix}-${index}`;
}

export function asObjectRows(value: unknown): Record<string, unknown>[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry) =>
    entry !== null && typeof entry === "object" && !Array.isArray(entry)
      ? { ...entry }
      : {},
  );
}

export function asObjectMap(
  value: unknown,
): Record<string, Record<string, unknown>> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) {
    return {};
  }
  const next: Record<string, Record<string, unknown>> = {};
  for (const [key, entry] of Object.entries(value)) {
    next[key] =
      entry !== null && typeof entry === "object" && !Array.isArray(entry)
        ? { ...(entry as Record<string, unknown>) }
        : {};
  }
  return next;
}
