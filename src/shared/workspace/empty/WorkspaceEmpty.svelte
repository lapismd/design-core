<script lang="ts">
  import type { WorkspaceAction } from "../core/types.js";
  import "./WorkspaceEmpty.css";

  let {
    missingViewType = null,
    actions = [],
  }: {
    /** Missing serializable view type, or `null` for an ordinary empty leaf. */
    missingViewType?: string | null;
    actions?: WorkspaceAction[];
  } = $props();
</script>

<!-- Source: packages/workspace/src/lib/views/empty/empty-view.svelte -->
<div
  class="ui-workspace-empty"
  data-ui-component="workspace-empty"
  data-workspace-missing-view={missingViewType ?? undefined}
>
  <div class="ui-workspace-empty__body" data-ui-part="body">
    {#if missingViewType}
      <h2 class="ui-workspace-empty__title" data-ui-part="title">
        Plugin no longer active
      </h2>
      <p class="ui-workspace-empty__description" data-ui-part="description">
        The plugin that created this view ({missingViewType}) has gone away
      </p>
    {:else}
      <h2 class="ui-workspace-empty__title" data-ui-part="title">
        No file is open
      </h2>
    {/if}

    {#if actions.length > 0}
      <div class="ui-workspace-empty__actions" data-ui-part="actions">
        {#each actions as action (action.id)}
          <button
            class="ui-workspace-empty__action"
            data-ui-part="action"
            type="button"
            disabled={action.disabled}
            onclick={(event) => action.onSelect(event)}
          >
            {action.label}
          </button>
        {/each}
      </div>
    {/if}
  </div>
</div>
