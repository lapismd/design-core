<script lang="ts">
  import "./FormToolbar.css";
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
