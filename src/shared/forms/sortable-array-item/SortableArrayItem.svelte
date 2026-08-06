<script lang="ts">
  import "./SortableArrayItem.css";
  import GripVerticalIcon from "@lucide/svelte/icons/grip-vertical";
  import XIcon from "@lucide/svelte/icons/x";
  import type { Snippet } from "svelte";
  import { Button } from "@lapismd/design-core/shadcn/button";

  let {
    id,
    index,
    sortableGroup = null,
    dragging = false,
    compact = false,
    inset = "normal",
    removable = true,
    onDragStart,
    onRemove,
    children,
  }: {
    id: string;
    index: number;
    sortableGroup?: string | null;
    dragging?: boolean;
    compact?: boolean;
    /** Horizontal padding; `flush` hangs the grip left with no left padding. */
    inset?: "normal" | "tight" | "flush";
    removable?: boolean;
    onDragStart?: (event: PointerEvent, index: number) => void;
    onRemove?: () => void;
    children?: Snippet;
  } = $props();
</script>

<div
  data-ui-component="sortable-array-item"
  data-ui-part="sortable-array-item"
  data-sortable-item
  data-sortable-index={index}
  data-sortable-id={id}
  data-sortable-group={sortableGroup}
  data-compact={compact ? "" : undefined}
  data-inset={inset}
  data-dragging={dragging ? "" : undefined}
>
  {#if onDragStart}
    <button
      type="button"
      aria-label="Drag item"
      data-ui-component="sortable-array-item"
      data-ui-part="sortable-array-item-drag"
      onpointerdown={(event) => onDragStart(event, index)}
    >
      <GripVerticalIcon aria-hidden="true" />
    </button>
  {/if}

  <div
    data-ui-component="sortable-array-item"
    data-ui-part="sortable-array-item-body"
  >
    {@render children?.()}
  </div>

  {#if removable}
    <Button
      type="button"
      variant="ghost"
      size="icon-xs"
      class="ui-sortable-array-item__remove"
      aria-label="Remove item"
      onclick={onRemove}
    >
      <XIcon aria-hidden="true" />
    </Button>
  {/if}
</div>
