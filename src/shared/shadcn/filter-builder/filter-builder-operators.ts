import type { FilterOperator, FilterType } from "./filter-builder-types.js";

const op = (
  id: string,
  label: string,
  value: FilterOperator["value"] = "single",
): FilterOperator => ({ id, label, value });
const empty = [
  op("empty", "is empty", "none"),
  op("not-empty", "is not empty", "none"),
];
const equal = [op("eq", "is"), op("neq", "is not")];
const ordered = [
  op("lt", "less than"),
  op("lte", "at most"),
  op("gt", "greater than"),
  op("gte", "at least"),
];
const date = [
  op("eq", "on"),
  op("neq", "not on"),
  op("lt", "before"),
  op("lte", "on or before"),
  op("gt", "after"),
  op("gte", "on or after"),
];
const text = [
  ...equal,
  op("contains", "contains"),
  op("not-contains", "does not contain"),
  op("starts-with", "starts with"),
  op("not-starts-with", "does not start with"),
  op("ends-with", "ends with"),
  op("not-ends-with", "does not end with"),
  op("contains-any", "contains any of", "multiple"),
  op("contains-all", "contains all of", "multiple"),
  op("not-contains-any", "does not contain any of", "multiple"),
  op("not-contains-all", "does not contain all of", "multiple"),
];
export const filterTypeLabels: Record<FilterType, string> = {
  text: "Text",
  number: "Number",
  boolean: "Boolean",
  date: "Date",
  datetime: "Date and time",
  enum: "Options",
};
export function filterOperators(type: FilterType): readonly FilterOperator[] {
  if (type === "text") return [...text, ...empty];
  if (type === "number") return [...equal, ...ordered, ...empty];
  if (type === "date" || type === "datetime") return [...date, ...empty];
  return [...equal, ...empty];
}
