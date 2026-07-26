<script lang="ts">
  import type { WorkspaceTab } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspaceFloatingWindow from "../floating-window/WorkspaceFloatingWindow.svelte";
  import "./WorkspaceFloatingLayer.css";

  let {
    controller,
    createTab,
    boundsRoot,
  }: {
    controller: WorkspaceShellController;
    createTab?: (paneId: string) => WorkspaceTab;
    boundsRoot?: HTMLElement | null;
  } = $props();

  const createDrag = () => new WorkspaceDragState(controller);
  const drag = createDrag();
  let windows = $derived(
    controller.layout.windows.filter((entry) => entry.mode === "floating"),
  );
  let minimized = $derived(
    windows.filter((entry) => entry.state === "minimized"),
  );
  let free = $derived(windows.filter((entry) => entry.state !== "minimized"));
</script>

{#if windows.length}
  <div
    class="ui-workspace-floating-layer"
    data-ui-component="workspace-floating-layer"
    data-ui-part="root"
    data-app-shell-floating-layer
  >
    {#each free as workspaceWindow (workspaceWindow.id)}
      <WorkspaceFloatingWindow
        {controller}
        window={workspaceWindow}
        {drag}
        {createTab}
        {boundsRoot}
      />
    {/each}

    {#if minimized.length}
      <div
        class="ui-workspace-floating-layer__minimized"
        data-ui-part="minimized-stack"
        data-floating-minimized-stack="true"
      >
        {#each minimized as workspaceWindow (workspaceWindow.id)}
          <WorkspaceFloatingWindow
            {controller}
            window={workspaceWindow}
            {drag}
            {createTab}
            {boundsRoot}
            dockMode="minimized"
          />
        {/each}
      </div>
    {/if}
  </div>
{/if}
