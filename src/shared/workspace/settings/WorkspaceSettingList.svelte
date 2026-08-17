<script lang="ts">
  import { Button } from "@lapismd/design-core/shadcn/button";
  import { Input } from "@lapismd/design-core/shadcn/input";
  import { Switch } from "@lapismd/design-core/shadcn/switch";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceSettingAddButton from "./WorkspaceSettingAddButton.svelte";

  let {
    itemType,
    label,
    itemLabels = [],
    value = [],
    disabled = false,
    maximumItems,
    onValueChange,
  }: {
    itemType: "string" | "number" | "integer" | "boolean";
    label: string;
    itemLabels?: string[];
    value?: unknown[];
    disabled?: boolean;
    maximumItems?: number;
    onValueChange: (value: unknown[]) => void;
  } = $props();

  function itemLabel(index: number): string {
    return itemLabels[index]?.trim() || `${label} item ${index + 1}`;
  }

  function update(index: number, nextValue: unknown) {
    const next = [...value];
    next[index] = nextValue;
    onValueChange(next);
  }

  function add() {
    onValueChange([
      ...value,
      itemType === "boolean"
        ? false
        : itemType === "number" || itemType === "integer"
          ? 0
          : "",
    ]);
  }
</script>

<div class="ui-workspace-setting-list">
  {#each value as item, index (index)}
    <div>
      {#if itemType === "boolean"}
        <label class="ui-workspace-setting-list__flag">
          <Switch
            checked={Boolean(item)}
            {disabled}
            aria-label={itemLabel(index)}
            onCheckedChange={(checked) => update(index, checked)}
          />
          <span>{itemLabel(index)}</span>
        </label>
      {:else}
        <Input
          type={itemType === "string" ? "text" : "number"}
          step={itemType === "integer" ? 1 : "any"}
          aria-label={`${label} item ${index + 1}`}
          value={String(item ?? "")}
          {disabled}
          oninput={(event) =>
            update(
              index,
              itemType === "string"
                ? event.currentTarget.value
                : event.currentTarget.valueAsNumber,
            )}
        />
      {/if}
      <Button
        variant="ghost"
        size="icon-sm"
        aria-label={`Remove ${itemLabel(index)}`}
        {disabled}
        onclick={() =>
          onValueChange(value.filter((_, itemIndex) => itemIndex !== index))}
      >
        <WorkspaceIcon name="x" />
      </Button>
    </div>
  {/each}
  <WorkspaceSettingAddButton
    label="Add item"
    disabled={disabled ||
      (maximumItems !== undefined && value.length >= maximumItems)}
    onclick={add}
  />
</div>
