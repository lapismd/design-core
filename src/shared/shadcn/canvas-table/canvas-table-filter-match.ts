import {
  effectiveFieldType,
  normalizeFilterState,
  validateFilterState,
} from "../filter-builder/filter-builder-model.js";
import {
  isFilterEmpty,
  parseFilterValue,
} from "../filter-builder/filter-builder-values.js";
import type {
  FilterCondition,
  FilterField,
  FilterNode,
  StructuredFilterState,
} from "../filter-builder/filter-builder-types.js";
import type { CanvasTableProps, CanvasTableRow } from "./canvas-table-types.js";

export interface CanvasTableResolvedField extends FilterField {
  column: number;
}
function matchesCondition(
  row: CanvasTableRow,
  condition: FilterCondition,
  field: CanvasTableResolvedField,
  state: StructuredFilterState,
): boolean {
  const raw = row.cells[field.column] ?? "";
  const op = condition.operator;
  if (op === "empty") return isFilterEmpty(raw);
  if (op === "not-empty") return !isFilterEmpty(raw);
  const type = effectiveFieldType(field, state);
  const left = parseFilterValue(raw, type);
  if (left === null) return false;
  if (type === "text") {
    const text = String(left).toLocaleLowerCase();
    const values = (
      Array.isArray(condition.value)
        ? condition.value
        : [String(condition.value)]
    ).map((value) => value.toLocaleLowerCase());
    const value = values[0] ?? "";
    const negative = op.startsWith("not-");
    const operation = negative ? op.slice(4) : op;
    let result: boolean;
    if (operation === "contains") result = text.includes(value);
    else if (operation === "starts-with") result = text.startsWith(value);
    else if (operation === "ends-with") result = text.endsWith(value);
    else if (operation === "contains-any")
      result = values.some((item) => text.includes(item));
    else if (operation === "contains-all")
      result = values.every((item) => text.includes(item));
    else return op === "eq" ? text === value : op === "neq" && text !== value;
    return negative ? !result : result;
  }
  const right = parseFilterValue(condition.value, type);
  if (right === null) return false;
  if (op === "eq")
    return typeof left === "string" && typeof right === "string"
      ? left.toLocaleLowerCase() === right.toLocaleLowerCase()
      : left === right;
  if (op === "neq")
    return typeof left === "string" && typeof right === "string"
      ? left.toLocaleLowerCase() !== right.toLocaleLowerCase()
      : left !== right;
  const compare =
    typeof left === "number" && typeof right === "number"
      ? left - right
      : typeof left === "string" && typeof right === "string"
        ? left.localeCompare(right)
        : NaN;
  return op === "gt"
    ? compare > 0
    : op === "gte"
      ? compare >= 0
      : op === "lt"
        ? compare < 0
        : op === "lte" && compare <= 0;
}
export function canvasTableFilterMatches(
  row: CanvasTableRow,
  node: FilterNode,
  fields: readonly CanvasTableResolvedField[],
  state: StructuredFilterState,
): boolean {
  if (node.kind === "condition") {
    const field = fields.find((item) => item.id === node.field);
    return Boolean(field && matchesCondition(row, node, field, state));
  }
  if (!node.children.length) return true;
  const matches = (child: FilterNode) =>
    canvasTableFilterMatches(row, child, fields, state);
  return node.match === "all"
    ? node.children.every(matches)
    : node.match === "any"
      ? node.children.some(matches)
      : !node.children.some(matches);
}
export function filteredCanvasTableIds(
  props: CanvasTableProps,
  fields: readonly CanvasTableResolvedField[],
) {
  const config = props.filtering;
  if (!config) return props.visibleRowIds;
  const value = normalizeFilterState(config.value);
  if (Object.keys(validateFilterState(value, fields)).length) return [];
  const header = (props.headerRow ?? true) ? props.rows[0]?.id : undefined;
  const byId = new Map(props.rows.map((row) => [row.id, row]));
  return (props.visibleRowIds ?? props.rows.map((row) => row.id)).filter(
    (id) => {
      const row = byId.get(id);
      return (
        row &&
        id !== header &&
        canvasTableFilterMatches(row, value.root, fields, value)
      );
    },
  );
}
