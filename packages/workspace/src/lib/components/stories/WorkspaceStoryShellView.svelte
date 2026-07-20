<script lang="ts">
  import type { WorkspaceViewContext } from "../../core/types.js";

  let { tab, active }: WorkspaceViewContext = $props();
</script>

<article
  data-ui-component="workspace-story-shell-view"
  data-ui-part="view"
  data-active={active ? "true" : "false"}
>
  <h2>{tab.title} view</h2>
  <p>{active ? "Active" : "Inactive"} workspace view.</p>
</article>

<style>
  [data-ui-component="workspace-story-shell-view"][data-ui-part="view"] {
    display: flex;
    min-height: 100%;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
    color: var(--muted-foreground);
    font-size: 0.875rem;
  }

  [data-ui-component="workspace-story-shell-view"] h2,
  [data-ui-component="workspace-story-shell-view"] p {
    margin: 0;
  }

  [data-ui-component="workspace-story-shell-view"] h2 {
    color: var(--foreground);
    font-size: 1.125rem;
    font-weight: 600;
  }
</style>
