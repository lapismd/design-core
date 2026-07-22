<script lang="ts">
  import ChevronsDownUpIcon from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDownIcon from "@lucide/svelte/icons/chevrons-up-down";
  import type { Snippet } from "svelte";

  let {
    collapsedAll,
    collapseLabel = "Collapse all",
    expandLabel = "Expand all",
    onToggleCollapse,
    actions,
    leading,
  }: {
    /** Whether every descendant disclosure is collapsed. */
    collapsedAll: boolean;
    collapseLabel?: string;
    expandLabel?: string;
    /** Collapses or expands every descendant disclosure. */
    onToggleCollapse: () => void;
    actions?: Snippet;
    leading?: Snippet;
  } = $props();

  const toggleLabel = $derived(collapsedAll ? expandLabel : collapseLabel);
</script>

<div
  class="ui-form-toolbar"
  data-ui-component="form-toolbar"
  data-ui-part="form-toolbar"
  data-testid="form-toolbar"
>
  <div class="ui-form-toolbar-leading" data-ui-part="form-toolbar-leading">
    {#if leading}
      {@render leading()}
    {/if}
    <button
      type="button"
      class="ui-form-toolbar-collapse"
      data-ui-part="form-toolbar-collapse"
      aria-label={toggleLabel}
      title={toggleLabel}
      onclick={onToggleCollapse}
    >
      {#if collapsedAll}
        <ChevronsUpDownIcon aria-hidden="true" />
      {:else}
        <ChevronsDownUpIcon aria-hidden="true" />
      {/if}
    </button>
  </div>

  {#if actions}
    <div class="ui-form-toolbar-actions" data-ui-part="form-toolbar-actions">
      {@render actions()}
    </div>
  {/if}
</div>

<style>
  .ui-form-toolbar {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: space-between;
    gap: 0.75rem;
    padding-inline: 0.15rem;
  }

  .ui-form-toolbar-leading {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.35rem;
  }

  .ui-form-toolbar-collapse {
    display: grid;
    width: 1.5rem;
    height: 1.5rem;
    place-items: center;
    flex-shrink: 0;
    border: 0;
    border-radius: 0.25rem;
    background: transparent;
    color: var(--ui-form-muted);
    cursor: pointer;
    padding: 0;
  }

  .ui-form-toolbar-collapse:hover,
  .ui-form-toolbar-collapse:focus-visible {
    color: var(--ui-form-foreground);
    outline: 0;
  }

  .ui-form-toolbar-collapse :global(svg) {
    width: 1rem;
    height: 1rem;
  }

  .ui-form-toolbar-actions {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.35rem;
  }
</style>
