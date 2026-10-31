<script lang="ts">
  import { untrack } from "svelte";
  import ListFilter from "@lucide/svelte/icons/list-filter";
  import { Button } from "../button/index.js";
  import Group from "./filter-builder-group.svelte";
  import {
    cloneFilterState,
    createFilterState,
    filterConditionCount,
    normalizeFilterState,
    validateFilterState,
    normalizeCondition,
    visitFilterConditions,
  } from "./filter-builder-model.js";
  import type {
    FilterBuilderProps,
    FilterCondition,
    FilterDraftContext,
    FilterGroup,
    FilterType,
    StructuredFilterState,
  } from "./filter-builder-types.js";
  import "./filter-builder.css";
  let {
    fields,
    value,
    onValueChange,
    disabled = false,
    "aria-label": label = "Structured filters",
    class: className,
  }: FilterBuilderProps = $props();
  const prefix = $props.id();
  let sequence = 0;
  let draft = $state<StructuredFilterState>(createFilterState());
  let errors = $state<Record<string, string>>({});
  let pristine = new Set<string>();
  let previous: StructuredFilterState | undefined;
  let previousText = "";
  let emitted: string | null = null;
  function addCondition(group: FilterGroup) {
    const id = prefix + "-" + ++sequence;
    group.children.push({
      id,
      kind: "condition",
      field: fields[0]?.id ?? "",
      operator: "eq",
      value: "",
    });
    pristine.add(id);
  }
  function ensureRow(group: FilterGroup) {
    if (!group.children.length) addCondition(group);
  }
  function change(id?: string) {
    if (id) pristine.delete(id);
    const next = normalizeFilterState(draft, pristine);
    errors = validateFilterState(next, fields);
    if (Object.keys(errors).length) return;
    const serialized = JSON.stringify(next);
    if (serialized !== JSON.stringify(value)) {
      emitted = serialized;
      onValueChange(next);
    }
  }
  function edit(
    condition: FilterCondition,
    patch: Partial<Pick<FilterCondition, "field" | "operator" | "value">>,
  ) {
    Object.assign(condition, patch);
    const field = fields.find((item) => item.id === condition.field);
    if (field) normalizeCondition(condition, field, draft);
    change(condition.id);
  }
  function setType(condition: FilterCondition, next: string) {
    const field = fields.find((item) => item.id === condition.field);
    if (!field) return;
    if (next === "auto") delete draft.types[field.id];
    else draft.types[field.id] = next as FilterType;
    visitFilterConditions(draft.root, (row) => {
      if (row.field === field.id) normalizeCondition(row, field, draft);
    });
    change(condition.id);
  }
  function setMatch(group: FilterGroup, match: FilterGroup["match"]) {
    group.match = match;
    change();
  }
  function add(group: FilterGroup, kind: "condition" | "group") {
    if (kind === "condition") addCondition(group);
    else {
      const nested: FilterGroup = {
        id: prefix + "-" + ++sequence,
        kind: "group",
        match: "all",
        children: [],
      };
      addCondition(nested);
      group.children.push(nested);
    }
    change();
  }
  function remove(group: FilterGroup, id: string) {
    group.children = group.children.filter((node) => node.id !== id);
    ensureRow(group);
    change();
  }
  function clear() {
    draft = createFilterState();
    pristine = new Set();
    ensureRow(draft.root);
    errors = {};
    emitted = JSON.stringify(createFilterState());
    onValueChange(createFilterState());
  }
  $effect(() => {
    const source = value;
    const text = JSON.stringify(source);
    const schema = fields;
    if (source !== previous || text !== previousText) {
      previous = source;
      previousText = text;
      if (text === emitted) {
        emitted = null;
        return;
      }
      untrack(() => {
        draft = cloneFilterState(source);
        pristine = new Set();
        ensureRow(draft.root);
      });
    }
    untrack(() => {
      errors = validateFilterState(
        normalizeFilterState(draft, pristine),
        schema,
      );
    });
  });
  const ctx: FilterDraftContext = $derived({
    fields,
    state: draft,
    errors,
    disabled,
    change,
    edit,
    setType,
    setMatch,
    add,
    remove,
  });
</script>

<div
  data-ui-component="filter-builder"
  data-ui-part="root"
  class={["filter-builder", className].filter(Boolean).join(" ")}
  role="group"
  aria-label={label}
>
  <div class="filter-builder__header">
    <strong
      ><ListFilter /> Filters
      <span class="filter-builder__count">{filterConditionCount(value)}</span
      ></strong
    >
    <Button variant="ghost" size="sm" {disabled} onclick={clear}
      >Clear filters</Button
    >
  </div>
  {#if !fields.length}<p class="filter-builder__empty">
      No filter fields available.
    </p>{/if}
  <Group {ctx} group={draft.root} />
  {#if Object.keys(errors).length}<p
      class="filter-builder__draft-status"
      role="status"
      aria-label="Filter draft status"
    >
      Changes not applied. Complete the highlighted filters.
    </p>{/if}
</div>
