<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type { WorkspaceViewContext } from "../core/types.js";

  let { close }: WorkspaceViewContext = $props();
</script>

<section data-ui-component="workspace" data-ui-part="empty-view">
  <div data-ui-component="workspace" data-ui-part="empty-view-content">
    <h2>No view is open</h2>
    <p>This pane is ready for a view supplied by your application.</p>
    <Button type="button" variant="ghost" onclick={close}>Close</Button>
  </div>
</section>

<style>
  [data-ui-component="workspace"][data-ui-part="empty-view"] {
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    align-items: center;
    justify-content: center;
    overflow: auto;
    background: var(--background);
  }

  [data-ui-component="workspace"][data-ui-part="empty-view-content"] {
    width: min(100% - 2.5rem, 30rem);
    margin: 1.25rem;
    text-align: center;
  }

  [data-ui-component="workspace"][data-ui-part="empty-view-content"] h2 {
    margin: 1.25rem 0;
    color: var(--foreground);
    font-size: 1.25rem;
    font-weight: 600;
  }

  [data-ui-component="workspace"][data-ui-part="empty-view-content"] p {
    margin: 0 0 1rem;
    color: var(--muted-foreground);
  }
</style>
