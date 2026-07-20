<script lang="ts">
  import ChevronDownIcon from "@lucide/svelte/icons/chevron-down";
  import PlusIcon from "@lucide/svelte/icons/plus";
  import type { Snippet } from "svelte";

  let {
    title,
    addLabel,
    count = 0,
    open = true,
    onToggle = () => {},
    onAdd = () => {},
    children,
  }: {
    title: string;
    addLabel: string;
    count?: number;
    open?: boolean;
    onToggle?: () => void;
    onAdd?: () => void;
    children?: Snippet;
  } = $props();
</script>

<section class="cv-form-item-list">
  <header>
    <button
      type="button"
      class="cv-form-item-list-toggle"
      aria-label={open ? `Collapse ${title}` : `Expand ${title}`}
      aria-expanded={open}
      onclick={onToggle}
    >
      <ChevronDownIcon />
      <span>{title}</span>
    </button>
    <small>{count}</small>
  </header>

  {#if open}
    <div class="cv-form-item-list-body">
      <div class="cv-form-item-list-content">
        {@render children?.()}
      </div>
      <button type="button" class="cv-form-item-list-add" onclick={onAdd}>
        <PlusIcon />
        Add {addLabel}
      </button>
    </div>
  {/if}
</section>

<style>
  .cv-form-item-list {
    display: grid;
    gap: 0.25rem;
  }

  .cv-form-item-list > header {
    position: relative;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: 0.75rem;
    border-bottom: 1px solid
      var(--ui-form-border);
    padding: 0 0 0.2rem;
  }

  .cv-form-item-list-toggle,
  .cv-form-item-list-add {
    display: inline-flex;
    align-items: center;
    border: 0;
    background: transparent;
    color: var(--ui-form-muted);
    cursor: pointer;
    font: inherit;
    padding: 0;
  }

  .cv-form-item-list-toggle {
    position: relative;
    min-width: 0;
    min-height: 1.5rem;
    justify-self: stretch;
    color: var(--ui-form-foreground);
    font-family: inherit;
    font-size: 1rem;
    font-weight: 600;
    line-height: 1.5;
    text-align: left;
  }

  .cv-form-item-list-toggle :global(svg) {
    position: absolute;
    top: 50%;
    left: -1.35rem;
    width: 0.75rem;
    height: 0.75rem;
    color: var(--ui-form-muted);
    translate: 0 -50%;
  }

  .cv-form-item-list-toggle[aria-expanded="false"] :global(svg) {
    rotate: -90deg;
  }

  .cv-form-item-list > header > small {
    display: inline-flex;
    min-width: 1.35rem;
    height: 1.35rem;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: var(--ui-form-selection);
    color: var(--ui-form-accent);
    font-size: 0.7rem;
    font-weight: 750;
  }

  .cv-form-item-list-add {
    gap: 0.25rem;
    width: fit-content;
    font-size: 0.75rem;
    font-weight: 500;
    margin-top: 0.15rem;
  }

  .cv-form-item-list-add :global(svg) {
    width: 0.8rem;
    height: 0.8rem;
  }

  .cv-form-item-list-toggle:hover,
  .cv-form-item-list-toggle:focus-visible,
  .cv-form-item-list-add:hover,
  .cv-form-item-list-add:focus-visible {
    color: var(--ui-form-foreground);
    outline: 0;
  }

  .cv-form-item-list-body {
    display: grid;
    gap: 0.35rem;
    padding-left: 1rem;
  }

  .cv-form-item-list-content {
    min-width: 0;
  }
</style>
