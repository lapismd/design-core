<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Input } from "@stevejuma/ui/shadcn/input";
  import { Switch } from "@stevejuma/ui/shadcn/switch";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";

  let {
    itemType,
    label,
    value = [],
    disabled = false,
    maximumItems,
    onValueChange,
  }: {
    itemType: "string" | "number" | "integer" | "boolean";
    label: string;
    value?: unknown[];
    disabled?: boolean;
    maximumItems?: number;
    onValueChange: (value: unknown[]) => void;
  } = $props();

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
        <Switch
          aria-label={`${label} item ${index + 1}`}
          checked={Boolean(item)}
          {disabled}
          onCheckedChange={(checked) => update(index, checked)}
        />
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
        aria-label={`Remove ${label} item ${index + 1}`}
        {disabled}
        onclick={() =>
          onValueChange(value.filter((_, itemIndex) => itemIndex !== index))}
      >
        <WorkspaceIcon name="x" />
      </Button>
    </div>
  {/each}
  <Button
    variant="ghost"
    size="sm"
    class="ui-workspace-setting-list__add"
    disabled={disabled ||
      (maximumItems !== undefined && value.length >= maximumItems)}
    onclick={add}
  >
    <WorkspaceIcon name="plus" />
    Add item
  </Button>
</div>
