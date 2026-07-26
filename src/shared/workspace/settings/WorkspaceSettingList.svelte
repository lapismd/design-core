<script lang="ts">
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
        <input
          type="checkbox"
          aria-label={`${label} item ${index + 1}`}
          checked={Boolean(item)}
          {disabled}
          onchange={(event) => update(index, event.currentTarget.checked)}
        />
      {:else}
        <input
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
      <button
        type="button"
        aria-label={`Remove ${label} item ${index + 1}`}
        {disabled}
        onclick={() =>
          onValueChange(value.filter((_, itemIndex) => itemIndex !== index))}
      >
        <WorkspaceIcon name="x" />
      </button>
    </div>
  {/each}
  <button
    type="button"
    class="ui-workspace-setting-list__add"
    disabled={disabled ||
      (maximumItems !== undefined && value.length >= maximumItems)}
    onclick={add}
  >
    <WorkspaceIcon name="plus" />
    Add item
  </button>
</div>
