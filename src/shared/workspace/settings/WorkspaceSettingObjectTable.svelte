<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Input } from "@lapismd/design-core/shadcn/input";
  import { Switch } from "@lapismd/design-core/shadcn/switch";
  import * as Table from "@lapismd/design-core/shadcn/table";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceSettingAddButton from "./WorkspaceSettingAddButton.svelte";
  import CopyableValue from "./CopyableValue.svelte";
  import {
    asObjectMap,
    asObjectRows,
    createObjectRow,
    nextObjectMapKey,
  } from "./object-collection.js";
  import type {
    WorkspaceObjectProperty,
    WorkspaceObjectRowAction,
  } from "./types.js";

  let {
    label,
    properties,
    mode = "array",
    value,
    disabled = false,
    minimumItems,
    maximumItems,
    addLabel,
    rowKey,
    reorderable = false,
    rowActions = [],
    onValueChange,
  }: {
    label: string;
    properties: WorkspaceObjectProperty[];
    mode?: "array" | "map";
    value: unknown;
    disabled?: boolean;
    minimumItems?: number;
    maximumItems?: number;
    addLabel?: string;
    rowKey?: string;
    reorderable?: boolean;
    rowActions?: WorkspaceObjectRowAction[];
    onValueChange: (value: unknown) => void;
  } = $props();

  let busyActions = $state<Record<string, boolean>>({});
  let visibleProperties = $derived(
    properties.filter((property) => property.presentation !== "hidden"),
  );

  let rows = $derived.by(() => {
    if (mode === "map") {
      return Object.entries(asObjectMap(value)).map(([key, row]) => ({
        key,
        row,
      }));
    }
    return asObjectRows(value).map((row, index) => ({
      key:
        rowKey && typeof row[rowKey] === "string" && String(row[rowKey]).trim()
          ? String(row[rowKey])
          : String(index),
      row,
    }));
  });
  let canAdd = $derived(
    !disabled && (maximumItems === undefined || rows.length < maximumItems),
  );
  let canRemove = $derived(
    !disabled && (minimumItems === undefined || rows.length > minimumItems),
  );
  let resolvedAddLabel = $derived(
    addLabel ?? (mode === "map" ? `Add ${label} entry` : `Add ${label} row`),
  );

  function emitArray(next: Record<string, unknown>[]) {
    onValueChange(next);
  }

  function emitMap(
    nextRows: Array<{ key: string; row: Record<string, unknown> }>,
  ) {
    const next: Record<string, Record<string, unknown>> = {};
    for (const entry of nextRows) next[entry.key] = entry.row;
    onValueChange(next);
  }

  function updateCell(index: number, propertyId: string, nextValue: unknown) {
    if (mode === "map") {
      emitMap(
        rows.map((entry, rowIndex) =>
          rowIndex === index
            ? { ...entry, row: { ...entry.row, [propertyId]: nextValue } }
            : entry,
        ),
      );
      return;
    }
    emitArray(
      rows.map((entry, rowIndex) =>
        rowIndex === index
          ? { ...entry.row, [propertyId]: nextValue }
          : entry.row,
      ),
    );
  }

  function updateKey(index: number, nextKey: string) {
    const trimmed = nextKey.trim();
    if (
      !trimmed ||
      rows.some(
        (entry, rowIndex) => rowIndex !== index && entry.key === trimmed,
      )
    ) {
      return;
    }
    emitMap(
      rows.map((entry, rowIndex) =>
        rowIndex === index ? { ...entry, key: trimmed } : entry,
      ),
    );
  }

  function addRow() {
    if (!canAdd) return;
    if (mode === "map") {
      const current = asObjectMap(value);
      onValueChange({
        ...current,
        [nextObjectMapKey(current)]: createObjectRow(properties),
      });
      return;
    }
    emitArray([...asObjectRows(value), createObjectRow(properties)]);
  }

  function removeRow(index: number) {
    if (!canRemove) return;
    if (mode === "map") {
      emitMap(rows.filter((_, rowIndex) => rowIndex !== index));
      return;
    }
    emitArray(
      rows
        .filter((_, rowIndex) => rowIndex !== index)
        .map((entry) => entry.row),
    );
  }

  function moveRow(index: number, offset: -1 | 1) {
    if (mode !== "array" || disabled || !reorderable) return;
    const target = index + offset;
    if (target < 0 || target >= rows.length) return;
    const next = rows.map((entry) => entry.row);
    [next[index], next[target]] = [next[target]!, next[index]!];
    emitArray(next);
  }

  function actionVisible(
    action: WorkspaceObjectRowAction,
    row: Record<string, unknown>,
  ): boolean {
    return typeof action.hidden === "function"
      ? !action.hidden(row)
      : action.hidden !== true;
  }

  function actionDisabled(
    action: WorkspaceObjectRowAction,
    row: Record<string, unknown>,
    key: string,
  ): boolean {
    const configured =
      typeof action.disabled === "function"
        ? action.disabled(row)
        : action.disabled === true;
    return (
      disabled ||
      configured ||
      busyActions[`${key}:${action.id}`] === true ||
      action.busy?.(row) === true
    );
  }

  async function runRowAction(
    action: WorkspaceObjectRowAction,
    row: Record<string, unknown>,
    index: number,
    key: string,
  ): Promise<void> {
    if (actionDisabled(action, row, key)) return;
    if (action.confirm && !(await action.confirm(row))) return;
    const actionKey = `${key}:${action.id}`;
    busyActions[actionKey] = true;
    try {
      await action.run(row, index);
    } finally {
      busyActions[actionKey] = false;
    }
  }
</script>

<div class="ui-workspace-setting-object-collection">
  <Table.Root>
    <Table.Header>
      <Table.Row>
        {#if mode === "map"}
          <Table.Head>Name</Table.Head>
        {/if}
        {#each visibleProperties as property (property.id)}
          <Table.Head>{property.title}</Table.Head>
        {/each}
        <Table.Head>Actions</Table.Head>
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each rows as entry, index (mode === "map" ? entry.key : index)}
        <Table.Row>
          {#if mode === "map"}
            <Table.Cell>
              <Input
                aria-label={`${label} key row ${index + 1}`}
                value={entry.key}
                {disabled}
                onchange={(event) =>
                  updateKey(index, event.currentTarget.value)}
              />
            </Table.Cell>
          {/if}
          {#each visibleProperties as property (property.id)}
            <Table.Cell>
              {#if property.type === "boolean"}
                <Switch
                  checked={Boolean(entry.row[property.id])}
                  disabled={disabled || property.readOnly}
                  aria-label={`${label} ${property.title} row ${index + 1}`}
                  onCheckedChange={(checked) =>
                    updateCell(index, property.id, checked)}
                />
              {:else if property.presentation === "copyable"}
                <CopyableValue
                  value={String(entry.row[property.id] ?? "")}
                  label={`${label} ${property.title}`}
                />
              {:else if property.presentation === "code"}
                <code class="ui-workspace-setting-object-code"
                  >{String(entry.row[property.id] ?? "")}</code
                >
              {:else if property.presentation === "status"}
                <span class="ui-workspace-setting-object-status"
                  >{String(entry.row[property.id] ?? "")}</span
                >
              {:else if property.readOnly}
                <span class="ui-workspace-setting-object-value"
                  >{String(entry.row[property.id] ?? "")}</span
                >
              {:else}
                <Input
                  type={property.type === "string"
                    ? property.presentation === "url"
                      ? "url"
                      : "text"
                    : "number"}
                  step={property.type === "integer" ? 1 : "any"}
                  aria-label={`${label} ${property.title} row ${index + 1}`}
                  value={String(entry.row[property.id] ?? "")}
                  {disabled}
                  oninput={(event) =>
                    updateCell(
                      index,
                      property.id,
                      property.type === "string"
                        ? event.currentTarget.value
                        : event.currentTarget.valueAsNumber,
                    )}
                />
              {/if}
            </Table.Cell>
          {/each}
          <Table.Cell>
            <div class="ui-workspace-setting-object-actions">
              {#if mode === "array" && reorderable}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move ${label} row ${index + 1} up`}
                  disabled={disabled || index === 0}
                  onclick={() => moveRow(index, -1)}
                >
                  <WorkspaceIcon name="arrow-up" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Move ${label} row ${index + 1} down`}
                  disabled={disabled || index === rows.length - 1}
                  onclick={() => moveRow(index, 1)}
                >
                  <WorkspaceIcon name="arrow-down" />
                </Button>
              {/if}
              {#each rowActions.filter( (action) => actionVisible(action, entry.row), ) as action (action.id)}
                <Button
                  variant={action.variant ?? "ghost"}
                  size={action.icon ? "icon-sm" : "sm"}
                  aria-label={action.label}
                  title={action.label}
                  disabled={actionDisabled(action, entry.row, entry.key)}
                  onclick={() =>
                    void runRowAction(action, entry.row, index, entry.key)}
                >
                  {#if action.icon}<WorkspaceIcon name={action.icon} />{/if}
                  {#if !action.icon}{action.label}{/if}
                </Button>
              {/each}
              {#if !disabled}
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`Remove ${label} row ${index + 1}`}
                  disabled={!canRemove}
                  onclick={() => removeRow(index)}
                >
                  <WorkspaceIcon name="x" />
                </Button>
              {/if}
            </div>
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
  {#if !disabled}
    <WorkspaceSettingAddButton
      label={resolvedAddLabel}
      disabled={!canAdd}
      onclick={addRow}
    />
  {/if}
</div>
