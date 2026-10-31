<script lang="ts">
  import Trash from "@lucide/svelte/icons/trash-2";
  import { Button } from "../button/index.js";
  import Field from "./filter-builder-field.svelte";
  import Select from "./filter-builder-select.svelte";
  import Value from "./filter-builder-value.svelte";
  import {
    effectiveFieldType,
    operatorsForField,
  } from "./filter-builder-model.js";
  import { filterTypeLabels } from "./filter-builder-operators.js";
  import type {
    FilterCondition,
    FilterDraftContext,
    FilterGroup,
  } from "./filter-builder-types.js";
  let {
    ctx,
    condition,
    group,
    label,
  }: {
    ctx: FilterDraftContext;
    condition: FilterCondition;
    group: FilterGroup;
    label: string;
  } = $props();
  const errorId = $props.id();
  const field = $derived(
    ctx.fields.find((item) => item.id === condition.field),
  );
  const type = $derived(field ? effectiveFieldType(field, ctx.state) : "text");
  const operators = $derived(field ? operatorsForField(field, ctx.state) : []);
  const operator = $derived(
    operators.find((item) => item.id === condition.operator),
  );
  const error = $derived(ctx.errors[condition.id]);
</script>

<div class="filter-builder__row" data-filter-condition={condition.id}>
  <span class="filter-builder__join">{label}</span>
  <div class="filter-builder__condition">
    <div class="filter-builder__segments" data-invalid={Boolean(error)}>
      <Field
        fields={ctx.fields}
        value={condition.field}
        onValueChange={(field) => ctx.edit(condition, { field, value: "" })}
        disabled={ctx.disabled}
      />
      <Select
        label={(field?.label ?? "Field") + " filter operator"}
        value={condition.operator}
        options={operators.map((item) => ({
          value: item.id,
          label: item.label,
        }))}
        disabled={ctx.disabled}
        onValueChange={(operator) => ctx.edit(condition, { operator })}
      />
      <div class="filter-builder__value">
        {#if field && operator}
          <Value
            {field}
            {operator}
            {type}
            value={condition.value}
            disabled={ctx.disabled}
            invalid={Boolean(error)}
            describedBy={error ? errorId : undefined}
            onValueChange={(value) => ctx.edit(condition, { value })}
          />
        {/if}
      </div>
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label="Remove filter"
        disabled={ctx.disabled}
        onclick={() => ctx.remove(group, condition.id)}><Trash /></Button
      >
    </div>
    {#if field?.allowTypeOverride}
      <div class="filter-builder__type">
        <span>Field type</span>
        <Select
          label={field.label + " field type"}
          value={ctx.state.types[field.id] ?? "auto"}
          disabled={ctx.disabled}
          options={[
            { value: "auto", label: "Auto · " + filterTypeLabels[field.type] },
            ...Object.entries(filterTypeLabels)
              .filter(([id]) => id !== "enum" || field.options?.length)
              .map(([value, label]) => ({ value, label })),
          ]}
          onValueChange={(type) => ctx.setType(condition, type)}
        />
      </div>
    {/if}
    {#if error}<p id={errorId} class="filter-builder__error" role="alert">
        {error}
      </p>{/if}
  </div>
</div>
