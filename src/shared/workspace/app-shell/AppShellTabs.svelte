<script lang="ts">
  import { findWorkspacePane } from "../core/layout.js";
  import type { WorkspaceSide, WorkspaceTab } from "../core/types.js";
  import WorkspaceTabs from "../tabs/WorkspaceTabs.svelte";
  import { getAppShellContext } from "./app-shell-context.svelte.js";

  let {
    paneId,
    side,
    createTab,
  }: {
    paneId: string;
    side?: WorkspaceSide;
    createTab?: (paneId: string) => WorkspaceTab;
  } = $props();
  const { controller, drag } = getAppShellContext();
  let pane = $derived(findWorkspacePane(controller.renderer.layout, paneId));
</script>

{#if pane}
  <WorkspaceTabs
    controller={controller.renderer}
    {pane}
    hostId="root"
    {drag}
    sidebarToggleSides={side ? [side] : []}
    {createTab}
  />
{/if}
