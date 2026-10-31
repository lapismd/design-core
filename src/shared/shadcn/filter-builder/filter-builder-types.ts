import type { Component } from "svelte";

export type FilterType =
  | "text"
  | "number"
  | "boolean"
  | "date"
  | "datetime"
  | "enum";
export type FilterValue = string | number | boolean | string[];
export interface FilterOperator {
  id: string;
  label: string;
  value: "none" | "single" | "multiple";
  validate?: ((value: FilterValue) => string | null) | undefined;
}
export interface FilterOption {
  value: string;
  label: string;
}
export interface FilterValueEditorProps {
  value: FilterValue;
  field: FilterField;
  operator: FilterOperator;
  disabled: boolean;
  onValueChange: (value: FilterValue) => void;
}
/** Supply application-specific choices/editors without application imports. */
export interface FilterField {
  id: string;
  label: string;
  type: FilterType;
  allowTypeOverride?: boolean | undefined;
  options?: readonly FilterOption[] | undefined;
  operators?: readonly FilterOperator[] | undefined;
  ValueEditor?: Component<FilterValueEditorProps> | undefined;
}
export interface FilterCondition {
  id: string;
  kind: "condition";
  field: string;
  operator: string;
  value: FilterValue;
}
export interface FilterGroup {
  id: string;
  kind: "group";
  match: "all" | "any" | "none";
  children: FilterNode[];
}
export type FilterNode = FilterCondition | FilterGroup;
/** Applied state only. Incomplete input remains a presentation draft. */
export interface StructuredFilterState {
  root: FilterGroup;
  types: Record<string, FilterType>;
}
export interface FilterBuilderProps {
  fields: readonly FilterField[];
  value: StructuredFilterState;
  onValueChange: (value: StructuredFilterState) => void;
  disabled?: boolean | undefined;
  "aria-label"?: string | undefined;
  class?: string | undefined;
}
export interface FilterDraftContext {
  fields: readonly FilterField[];
  state: StructuredFilterState;
  errors: Record<string, string>;
  disabled: boolean;
  change: (id?: string) => void;
  edit: (
    condition: FilterCondition,
    patch: Partial<Pick<FilterCondition, "field" | "operator" | "value">>,
  ) => void;
  setType: (condition: FilterCondition, type: string) => void;
  setMatch: (group: FilterGroup, match: FilterGroup["match"]) => void;
  add: (group: FilterGroup, kind: "condition" | "group") => void;
  remove: (group: FilterGroup, id: string) => void;
}
