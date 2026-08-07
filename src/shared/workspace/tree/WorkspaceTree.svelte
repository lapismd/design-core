<script lang="ts">
  import type {
    WorkspaceNode,
    WorkspaceSide,
    WorkspaceTab,
  } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspaceSplit from "../split/WorkspaceSplit.svelte";
  import WorkspaceStackedTabs from "../stacked-tabs/WorkspaceStackedTabs.svelte";
  import WorkspaceTabs from "../tabs/WorkspaceTabs.svelte";
  import WorkspaceTreeRecursive from "./WorkspaceTree.svelte";
  import "./WorkspaceTree.css";

  let {
    controller,
    node,
    hostId = "root",
    drag,
    leftSidebarTogglePaneId,
    rightSidebarTogglePaneId,
    bottomPanelTogglePaneId,
    createTab,
  }: {
    controller: WorkspaceShellController;
    node: WorkspaceNode;
    hostId?: string;
    drag?: WorkspaceDragState;
    leftSidebarTogglePaneId?: string;
    rightSidebarTogglePaneId?: string;
    bottomPanelTogglePaneId?: string;
    createTab?: (paneId: string) => WorkspaceTab;
  } = $props();

  const createInternalDrag = () => new WorkspaceDragState(controller);
  const internalDrag = createInternalDrag();
  let dragState = $derived(drag ?? internalDrag);

  function sidebarToggleSides(paneId: string): WorkspaceSide[] {
    return [
      ...(paneId === leftSidebarTogglePaneId ? (["left"] as const) : []),
      ...(paneId === rightSidebarTogglePaneId ? (["right"] as const) : []),
    ];
  }
</script>

{#if node.kind === "tabs"}
  <div class="ui-workspace-tree__pane" data-ui-part="tree-pane">
    {#if node.presentation === "stacked"}
      <WorkspaceStackedTabs
        {controller}
        pane={node}
        {hostId}
        drag={dragState}
        sidebarToggleSides={sidebarToggleSides(node.id)}
        showBottomPanelToggle={node.id === bottomPanelTogglePaneId}
        {createTab}
      />
    {:else}
      <WorkspaceTabs
        {controller}
        pane={node}
        {hostId}
        drag={dragState}
        sidebarToggleSides={sidebarToggleSides(node.id)}
        showBottomPanelToggle={node.id === bottomPanelTogglePaneId}
        {createTab}
      />
    {/if}
  </div>
{:else}
  <WorkspaceSplit {controller} split={node}>
    {#snippet children(child)}
      <WorkspaceTreeRecursive
        {controller}
        node={child}
        {hostId}
        drag={dragState}
        {leftSidebarTogglePaneId}
        {rightSidebarTogglePaneId}
        {bottomPanelTogglePaneId}
        {createTab}
      />
    {/snippet}
  </WorkspaceSplit>
{/if}
