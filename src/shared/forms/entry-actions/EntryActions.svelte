<script lang="ts">
  import "./EntryActions.css";
  import ArrowDownIcon from "@lucide/svelte/icons/arrow-down";
  import ArrowUpIcon from "@lucide/svelte/icons/arrow-up";
  import XIcon from "@lucide/svelte/icons/x";
  import type { Snippet } from "svelte";

  let {
    index,
    total,
    removeLabel = "Remove",
    onMove = () => {},
    onRemove = () => {},
    children,
  }: {
    index: number;
    total: number;
    removeLabel?: string;
    onMove?: (direction: -1 | 1) => void;
    onRemove?: () => void;
    children?: Snippet;
  } = $props();
</script>

<div class="cv-form-entry-actions" data-ui-component="entry-actions" data-ui-part="entry-actions" data-testid="entry-header">
  <div class="cv-form-entry-move" data-testid="entry-actions-move">
    <button
      type="button"
      disabled={index === 0}
      aria-label="Move up"
      onclick={() => onMove(-1)}
    >
      <ArrowUpIcon />
    </button>
    <button
      type="button"
      disabled={index === total - 1}
      aria-label="Move down"
      onclick={() => onMove(1)}
    >
      <ArrowDownIcon />
    </button>
  </div>

  <div class="cv-form-entry-content">
    {@render children?.()}
  </div>

  <button
    type="button"
    class="cv-form-entry-remove"
    aria-label={removeLabel}
    onclick={onRemove}
  >
    <XIcon />
  </button>
</div>
