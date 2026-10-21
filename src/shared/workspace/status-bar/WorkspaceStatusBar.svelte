<script lang="ts">
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import WorkspaceStatusItem from "../status-item/WorkspaceStatusItem.svelte";
  import WorkspaceStatusSide from "./WorkspaceStatusSide.svelte";
  import "./WorkspaceStatusBar.css";

  let { controller }: { controller: WorkspaceShellController } = $props();
  let left = $derived(
    controller.statusBar.items.filter(
      (item) => (item.align ?? "left") === "left",
    ),
  );
  let center = $derived(
    controller.statusBar.items.filter((item) => item.align === "center"),
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
  <WorkspaceStatusSide items={left} side="left" />
  <div class="ui-workspace-status-bar__center" data-ui-part="center">
    {#each center as item (item.id)}<WorkspaceStatusItem {item} />{/each}
  </div>
  <WorkspaceStatusSide items={right} side="right" />
</footer>
