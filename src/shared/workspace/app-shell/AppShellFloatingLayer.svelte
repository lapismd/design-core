<script lang="ts">
  import type { WorkspaceTab } from "../core/types.js";
  import WorkspaceFloatingLayer from "../floating-layer/WorkspaceFloatingLayer.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  let {
    createTab,
  }: {
    createTab?: (paneId: string) => WorkspaceTab;
  } = $props();

  const context = getAppShellContext();
</script>

<WorkspaceFloatingLayer
  controller={context.controller.renderer}
  drag={context.drag}
  {createTab}
  boundsRoot={context.root}
/>
