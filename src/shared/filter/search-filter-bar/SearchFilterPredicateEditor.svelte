<script lang="ts">
  import { untrack } from "svelte";
  import { Button } from "../../shadcn/button/index.js";
  import { Input } from "../../shadcn/input/index.js";
  import * as Select from "../../shadcn/select/index.js";
  import { Switch } from "../../shadcn/switch/index.js";
  import {
    searchFilterFieldByName,
    type SearchFilterField,
    type SearchFilterSyntax,
  } from "./search-filter-syntax.js";
  import {
    formatTermExpr,
    unwrapPredicateValue,
    type PredicateChipEditSession,
  } from "./search-filter-predicate-chips.js";
  import SearchFilterValueAutocomplete from "./SearchFilterValueAutocomplete.svelte";

  const OPERATOR_LABELS: Record<string, string> = {
    ":": "contains",
    "=": "equals",
    "!=": "not equals",
    ">": "greater than",
    ">=": "at least",
    "<": "less than",
    "<=": "at most",
    "~": "matches",
    "!~": "does not match",
  };

  let {
    session,
    filterSyntax = undefined,
    disabled = false,
    onCancel,
    onApply,
  }: {
    session: PredicateChipEditSession;
    filterSyntax?: SearchFilterSyntax;
    disabled?: boolean;
    onCancel: () => void;
    onApply: (next: string) => void;
  } = $props();

  let field = $state(untrack(() => session.field));
  let operator = $state(untrack(() => session.operator));
  let value = $state(untrack(() => unwrapPredicateValue(session.value)));
  let panelEl = $state<HTMLDivElement | null>(null);

  const anchor = $derived(session.getAnchorRect());
  const style = $derived(
    `top: ${Math.round(anchor.bottom + 6)}px; left: ${Math.round(anchor.left)}px;`,
  );

  const activeField = $derived(
    searchFilterFieldByName(filterSyntax, field) ??
      ({
        name: field,
        description: field,
        operators: Object.keys(OPERATOR_LABELS),
        valueKind: "text",
      } satisfies SearchFilterField),
  );

  const valueKind = $derived(activeField.valueKind ?? "text");
  const ValueEditor = $derived(activeField.ValueEditor);

  const fieldOptions = $derived.by(() => {
    const names = filterSyntax?.fields.map((item) => item.name) ?? [];
    if (field && !names.includes(field)) return [field, ...names];
    return names.length ? names : [field].filter(Boolean);
  });

  const operatorOptions = $derived.by(() => {
    const ops = [...activeField.operators];
    if (operator && !ops.includes(operator)) return [operator, ...ops];
    return ops;
  });

  const canApply = $derived.by(() => {
    if (valueKind === "boolean") return true;
    return value.trim().length > 0;
  });

  const booleanChecked = $derived(/^(true|1|yes)$/i.test(value.trim()));

  function operatorLabel(op: string) {
    return OPERATOR_LABELS[op] ?? op;
  }

  function operatorsForField(name: string) {
    const match = searchFilterFieldByName(filterSyntax, name);
    return match?.operators
      ? [...match.operators]
      : Object.keys(OPERATOR_LABELS);
  }

  function handleFieldChange(next: string | undefined) {
    if (!next) return;
    field = next;
    const ops = operatorsForField(next);
    if (!ops.includes(operator)) {
      operator = ops[0] ?? operator;
    }
    const nextField = searchFilterFieldByName(filterSyntax, next);
    const kind = nextField?.valueKind ?? "text";
    if (kind === "boolean" && value.trim() === "") {
      value = "true";
    }
  }

  function handleApply() {
    if (!canApply) return;
    const serialized =
      valueKind === "boolean"
        ? /^(true|1|yes)$/i.test(value.trim())
          ? "true"
          : "false"
        : value;
    onApply(formatTermExpr(field, operator, serialized));
  }

  function onWindowKeydown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
    }
  }

  function onWindowPointerDown(event: PointerEvent) {
    const target = event.target;
    if (!(target instanceof Node)) return;
    if (panelEl?.contains(target)) return;
    if (
      target instanceof Element &&
      target.closest(
        '[data-slot="select-content"], [data-slot="popover-content"], [data-slot="command-item"], [role="listbox"]',
      )
    ) {
      return;
    }
    onCancel();
  }
</script>

<svelte:window
  onkeydown={onWindowKeydown}
  onpointerdown={onWindowPointerDown}
/>

<div
  bind:this={panelEl}
  class="cv-search-filter-bar__predicate-editor"
  style={style}
  role="dialog"
  aria-label="Edit filter"
>
  <div class="cv-search-filter-bar__predicate-editor-row">
    <Select.Root
      type="single"
      value={field}
      onValueChange={handleFieldChange}
      {disabled}
    >
      <Select.Trigger
        class="cv-search-filter-bar__predicate-editor-trigger"
        aria-label="Field"
      >
        {field || "Field"}
      </Select.Trigger>
      <Select.Portal>
        <Select.Content aria-label="Field options">
          {#each fieldOptions as name (name)}
            <Select.Item value={name} label={name}>{name}</Select.Item>
          {/each}
        </Select.Content>
      </Select.Portal>
    </Select.Root>

    <Select.Root type="single" bind:value={operator} {disabled}>
      <Select.Trigger
        class="cv-search-filter-bar__predicate-editor-trigger"
        aria-label="Operator"
      >
        {operatorLabel(operator)}
      </Select.Trigger>
      <Select.Portal>
        <Select.Content aria-label="Operator options">
          {#each operatorOptions as op (op)}
            <Select.Item value={op} label={operatorLabel(op)}
              >{operatorLabel(op)}</Select.Item
            >
          {/each}
        </Select.Content>
      </Select.Portal>
    </Select.Root>

    {#if ValueEditor}
      <ValueEditor
        {value}
        field={activeField}
        {disabled}
        onValueChange={(next) => {
          value = next;
        }}
      />
    {:else if valueKind === "boolean"}
      <label class="cv-search-filter-bar__predicate-editor-boolean">
        <Switch
          size="sm"
          checked={booleanChecked}
          {disabled}
          onCheckedChange={(checked) => {
            value = checked ? "true" : "false";
          }}
        />
        <span>{booleanChecked ? "true" : "false"}</span>
      </label>
    {:else if valueKind === "number"}
      <Input
        class="cv-search-filter-bar__predicate-editor-value"
        type="number"
        aria-label="Value"
        placeholder="Enter number…"
        {disabled}
        bind:value
        onkeydown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleApply();
          }
        }}
      />
    {:else if valueKind === "date"}
      <Input
        class="cv-search-filter-bar__predicate-editor-value"
        type="date"
        aria-label="Value"
        {disabled}
        bind:value
        onkeydown={(event) => {
          if (event.key === "Enter") {
            event.preventDefault();
            handleApply();
          }
        }}
      />
    {:else}
      <SearchFilterValueAutocomplete
        bind:value
        field={activeField}
        {disabled}
        allowCustom={valueKind !== "enum"}
        placeholder={valueKind === "enum"
          ? "Select value…"
          : "Enter value..."}
      />
    {/if}
  </div>

  <div class="cv-search-filter-bar__predicate-editor-actions">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      {disabled}
      onclick={onCancel}
    >
      Cancel
    </Button>
    <Button
      type="button"
      size="sm"
      disabled={disabled || !canApply}
      onclick={handleApply}>Apply</Button
    >
  </div>
</div>
