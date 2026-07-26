<script lang="ts">
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceStatusItem from "../status-item/WorkspaceStatusItem.svelte";
  import "./WorkspaceStatusBar.css";

  let { controller }: { controller: WorkspaceShellController } = $props();
  let left = $derived(
    controller.statusBar.items.filter(
      (item) => (item.align ?? "left") === "left",
    ),
  );
  let right = $derived(
    controller.statusBar.items.filter((item) => item.align === "right"),
  );
</script>

<footer
  class="ui-workspace-status-bar"
  data-ui-component="workspace-status-bar"
  data-ui-part="root"
  id="workspace-status-bar"
  aria-label="Workspace status"
  data-workspace-status-bar
>
  <div class="ui-workspace-status-bar__items" data-ui-part="left">
    {#each left as item (item.id)}
      <WorkspaceStatusItem {item} />
    {/each}
  </div>
  <div class="ui-workspace-status-bar__spacer" aria-hidden="true"></div>
  <div class="ui-workspace-status-bar__items" data-ui-part="right">
    {#each right as item (item.id)}
      <WorkspaceStatusItem {item} />
    {/each}
  </div>
</footer>
