<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import type { WorkspaceViewContext } from "../../core/types.js";

  let { tab, active, setState }: WorkspaceViewContext = $props();
</script>

<article
  data-ui-component="workspace-story-view"
  data-ui-part="view"
  data-active={active ? "true" : "false"}
>
  <h2>{tab.title} view</h2>
  <p>{active ? "Active" : "Inactive"} workspace view.</p>
  <Button type="button" size="sm" onclick={() => setState({ visited: true })}
    >Mark visited</Button
  >
</article>

<style>
  [data-ui-component="workspace-story-view"][data-ui-part="view"] {
    display: flex;
    min-height: 100%;
    flex-direction: column;
    gap: 0.5rem;
    padding: 1rem;
  }

  [data-ui-component="workspace-story-view"] h2,
  [data-ui-component="workspace-story-view"] p {
    margin: 0;
  }
</style>
