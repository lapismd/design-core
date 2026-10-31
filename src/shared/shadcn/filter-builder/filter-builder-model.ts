import { filterOperators } from "./filter-builder-operators.js";
import { filterValueError, isFilterEmpty } from "./filter-builder-values.js";
import type {
  FilterCondition,
  FilterField,
  FilterGroup,
  FilterNode,
  StructuredFilterState,
} from "./filter-builder-types.js";

export function createFilterState(): StructuredFilterState {
  return {
    root: { id: "root", kind: "group", match: "all", children: [] },
    types: {},
  };
}
export function cloneFilterState(
  value: StructuredFilterState,
): StructuredFilterState {
  return JSON.parse(JSON.stringify(value)) as StructuredFilterState;
}
export function effectiveFieldType(
  field: FilterField,
  value: StructuredFilterState,
) {
  return (field.allowTypeOverride && value.types[field.id]) || field.type;
}
export function operatorsForField(
  field: FilterField,
  value: StructuredFilterState,
) {
  return field.operators ?? filterOperators(effectiveFieldType(field, value));
}
export function visitFilterConditions(
  group: FilterGroup,
  visit: (condition: FilterCondition) => void,
) {
  for (const child of group.children) {
    if (child.kind === "group") visitFilterConditions(child, visit);
    else visit(child);
  }
}
export function filterConditionCount(value: StructuredFilterState) {
  let count = 0;
  visitFilterConditions(value.root, () => count++);
  return count;
}
export function normalizeFilterState(
  value: StructuredFilterState,
  pristine = new Set<string>(),
): StructuredFilterState {
  const next = cloneFilterState(value);
  function normalize(group: FilterGroup) {
    group.children = group.children.filter((node) => {
      if (node.kind === "condition") return !pristine.has(node.id);
      normalize(node);
      return node.children.length > 0;
    });
  }
  normalize(next.root);
  return next;
}
export function validateFilterState(
  value: StructuredFilterState,
  fields: readonly FilterField[],
): Record<string, string> {
  const errors: Record<string, string> = {};
  const byId = new Map(fields.map((field) => [field.id, field]));
  const ids = new Set<string>();
  function validate(node: FilterNode) {
    if (ids.has(node.id)) errors[node.id] = "Filter IDs must be unique.";
    ids.add(node.id);
    if (node.kind === "group") {
      if (!["all", "any", "none"].includes(node.match))
        errors[node.id] = "Choose a group match.";
      node.children.forEach(validate);
      return;
    }
    const field = byId.get(node.field);
    if (!field) {
      errors[node.id] = "Choose an available field.";
      return;
    }
    const operator = operatorsForField(field, value).find(
      (op) => op.id === node.operator,
    );
    if (!operator) {
      errors[node.id] = "Choose an operator for this field type.";
      return;
    }
    const custom = operator.validate?.(node.value);
    if (custom) {
      errors[node.id] = custom;
      return;
    }
    if (operator.value === "none") return;
    if (operator.value === "multiple") {
      if (
        !Array.isArray(node.value) ||
        !node.value.length ||
        node.value.some((item) => !item.trim())
      )
        errors[node.id] = "Add at least one value.";
      return;
    }
    const error = filterValueError(
      node.value,
      effectiveFieldType(field, value),
    );
    if (error) errors[node.id] = error;
    if (
      effectiveFieldType(field, value) === "enum" &&
      !field.options?.some((option) => option.value === node.value)
    )
      errors[node.id] = "Choose an available option.";
  }
  validate(value.root);
  return errors;
}
export function normalizeCondition(
  condition: FilterCondition,
  field: FilterField,
  value: StructuredFilterState,
) {
  const operators = operatorsForField(field, value);
  if (!operators.some((op) => op.id === condition.operator))
    condition.operator = operators[0]?.id ?? "eq";
  const operator = operators.find((op) => op.id === condition.operator);
  if (operator?.value === "multiple" && !Array.isArray(condition.value))
    condition.value = [];
  if (operator?.value === "single" && Array.isArray(condition.value))
    condition.value = "";
  if (
    effectiveFieldType(field, value) === "boolean" &&
    isFilterEmpty(condition.value)
  )
    condition.value = true;
}
