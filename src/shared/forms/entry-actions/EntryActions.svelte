<script lang="ts">
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

<div class="cv-form-entry-actions" data-testid="entry-header">
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

<style>
  .cv-form-entry-actions {
    position: relative;
  }

  .cv-form-entry-content {
    min-width: 0;
  }

  .cv-form-entry-move {
    position: absolute;
    top: 50%;
    left: -1.35rem;
    z-index: 2;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0;
    translate: 0 -50%;
    opacity: 0;
    transition: opacity 140ms ease;
  }

  .cv-form-entry-actions:hover .cv-form-entry-move,
  .cv-form-entry-actions:focus-within .cv-form-entry-move,
  .cv-form-entry-actions:hover .cv-form-entry-remove,
  .cv-form-entry-actions:focus-within .cv-form-entry-remove {
    opacity: 1;
  }

  .cv-form-entry-move button,
  .cv-form-entry-remove {
    display: grid;
    width: 1rem;
    height: 1rem;
    place-items: center;
    border: 0;
    border-radius: 0.25rem;
    background: transparent;
    color: var(--ui-form-muted);
    cursor: pointer;
    padding: 0;
  }

  .cv-form-entry-move button:disabled {
    cursor: default;
    opacity: 0.28;
  }

  .cv-form-entry-move button:hover,
  .cv-form-entry-remove:hover,
  .cv-form-entry-move button:focus-visible,
  .cv-form-entry-remove:focus-visible {
    color: var(--ui-form-foreground);
    outline: 0;
  }

  .cv-form-entry-move :global(svg),
  .cv-form-entry-remove :global(svg) {
    width: 0.75rem;
    height: 0.75rem;
  }

  .cv-form-entry-remove {
    position: absolute;
    top: 50%;
    right: -1.35rem;
    translate: 0 -50%;
    opacity: 0;
    transition: opacity 140ms ease;
  }
</style>
