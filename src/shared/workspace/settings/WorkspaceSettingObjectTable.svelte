<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Input } from "@lapismd/design-core/shadcn/input";
  import { Switch } from "@lapismd/design-core/shadcn/switch";
  import * as Table from "@lapismd/design-core/shadcn/table";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceSettingAddButton from "./WorkspaceSettingAddButton.svelte";
  import {
    asObjectMap,
    asObjectRows,
    createObjectRow,
    nextObjectMapKey,
  } from "./object-collection.js";
  import type { WorkspaceObjectProperty } from "./types.js";

  let {
    label,
    properties,
    mode = "array",
    value,
    disabled = false,
    minimumItems,
    maximumItems,
    addLabel,
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
    onValueChange: (value: unknown) => void;
  } = $props();

  let rows = $derived.by(() => {
    if (mode === "map") {
      return Object.entries(asObjectMap(value)).map(([key, row]) => ({
        key,
        row,
      }));
    }
    return asObjectRows(value).map((row, index) => ({
      key: String(index),
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
</script>

<div class="ui-workspace-setting-object-collection">
  <Table.Root>
    <Table.Header>
      <Table.Row>
        {#if mode === "map"}
          <Table.Head>Name</Table.Head>
        {/if}
        {#each properties as property (property.id)}
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
          {#each properties as property (property.id)}
            <Table.Cell>
              {#if property.type === "boolean"}
                <Switch
                  checked={Boolean(entry.row[property.id])}
                  {disabled}
                  aria-label={`${label} ${property.title} row ${index + 1}`}
                  onCheckedChange={(checked) =>
                    updateCell(index, property.id, checked)}
                />
              {:else}
                <Input
                  type={property.type === "string" ? "text" : "number"}
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
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label={`Remove ${label} row ${index + 1}`}
              disabled={!canRemove}
              onclick={() => removeRow(index)}
            >
              <WorkspaceIcon name="x" />
            </Button>
          </Table.Cell>
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
  <WorkspaceSettingAddButton
    label={resolvedAddLabel}
    disabled={!canAdd}
    onclick={addRow}
  />
</div>
