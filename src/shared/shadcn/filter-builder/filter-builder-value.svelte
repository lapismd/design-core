<script lang="ts">
  import { Input } from "../input/index.js";
  import { Checkbox } from "../checkbox/index.js";
  import Select from "./filter-builder-select.svelte";
  import Multiple from "./filter-builder-multiple.svelte";
  import {
    datetimeInputValue,
    parseFilterValue,
  } from "./filter-builder-values.js";
  import type {
    FilterField,
    FilterOperator,
    FilterType,
    FilterValue,
  } from "./filter-builder-types.js";
  let {
    field,
    operator,
    type,
    value,
    onValueChange,
    disabled,
    invalid,
    describedBy,
  }: {
    field: FilterField;
    operator: FilterOperator;
    type: FilterType;
    value: FilterValue;
    onValueChange: (value: FilterValue) => void;
    disabled: boolean;
    invalid: boolean;
    describedBy: string | undefined;
  } = $props();
  const Custom = $derived(field.ValueEditor);
  const label = $derived(field.label + " filter value");
</script>

{#if operator.value === "none"}
  <span class="filter-builder__no-value" aria-hidden="true">—</span>
{:else if Custom}
  <Custom {field} {operator} {value} {disabled} {onValueChange} />
{:else if operator.value === "multiple"}
  <Multiple
    values={Array.isArray(value) ? value : []}
    {label}
    {disabled}
    {onValueChange}
    {invalid}
    {describedBy}
  />
{:else if type === "boolean"}
  <div class="filter-builder__boolean">
    <Checkbox
      checked={parseFilterValue(value, "boolean") === true}
      onCheckedChange={(checked) => onValueChange(checked === true)}
      {disabled}
      aria-label={label}
      aria-invalid={invalid || undefined}
      aria-describedby={describedBy}
    />
    <span>{parseFilterValue(value, "boolean") === true ? "True" : "False"}</span
    >
  </div>
{:else if type === "enum"}
  <Select
    {label}
    value={String(value)}
    options={field.options ?? []}
    {invalid}
    {describedBy}
    {disabled}
    {onValueChange}
  />
{:else if type === "datetime"}
  <Input
    type="datetime-local"
    value={datetimeInputValue(value)}
    {disabled}
    aria-label={label}
    aria-invalid={invalid || undefined}
    aria-describedby={describedBy}
    oninput={(event) => {
      const raw = event.currentTarget.value;
      const date = new Date(raw);
      onValueChange(
        raw && Number.isFinite(date.valueOf()) ? date.toISOString() : raw,
      );
    }}
  />
{:else}
  <Input
    type={type === "number" ? "number" : type === "date" ? "date" : "text"}
    value={String(value)}
    {disabled}
    aria-label={label}
    aria-invalid={invalid || undefined}
    aria-describedby={describedBy}
    placeholder="Enter a value…"
    oninput={(event) => onValueChange(event.currentTarget.value)}
  />
{/if}
