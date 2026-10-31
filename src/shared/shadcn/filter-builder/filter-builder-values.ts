import type { FilterType, FilterValue } from "./filter-builder-types.js";

export function isFilterEmpty(value: unknown) {
  return value == null || (typeof value === "string" && value.trim() === "");
}
export function parseFilterNumber(value: unknown): number | null {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const text = value.trim();
  if (!/^[+-]?(?:\d+(?:\.\d*)?|\.\d+)(?:e[+-]?\d+)?$/i.test(text)) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}
export function isFilterDate(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value))
    return false;
  const instant = new Date(value + "T00:00:00Z");
  return (
    Number.isFinite(instant.valueOf()) &&
    instant.toISOString().slice(0, 10) === value
  );
}
export function isFilterDatetime(value: unknown): value is string {
  if (typeof value !== "string") return false;
  if (
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d{1,3})?)?(?:Z|[+-]\d{2}:\d{2})$/.test(
      value,
    )
  )
    return false;
  return isFilterDate(value.slice(0, 10)) && Number.isFinite(Date.parse(value));
}
export function parseFilterValue(
  value: unknown,
  type: FilterType,
): string | number | boolean | null {
  if (type === "number") return parseFilterNumber(value);
  if (type === "boolean") {
    if (typeof value === "boolean") return value;
    return typeof value === "string" && /^(true|false)$/i.test(value.trim())
      ? value.trim().toLowerCase() === "true"
      : null;
  }
  if (type === "date") return isFilterDate(value) ? value : null;
  if (type === "datetime")
    return isFilterDatetime(value) ? Date.parse(value) : null;
  return typeof value === "string" ? value : null;
}
export function filterValueError(
  value: FilterValue,
  type: FilterType,
): string | null {
  if (isFilterEmpty(value)) return "Enter a value.";
  if (parseFilterValue(value, type) === null)
    return "Enter a valid " + type + " value.";
  return null;
}
export function datetimeInputValue(value: FilterValue): string {
  if (!isFilterDatetime(value)) return String(value ?? "");
  const date = new Date(value);
  const local = new Date(date.valueOf() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}
