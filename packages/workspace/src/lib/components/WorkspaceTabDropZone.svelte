<script lang="ts">
  import type { Snippet } from "svelte";
  import type { WorkspaceController } from "../core/workspace-controller.svelte";
  import type { WorkspaceDropZone, WorkspaceTabsNode } from "../core/types.js";
  import {
    getWorkspaceDropOverlayGeometry,
    type WorkspaceDropOverlayGeometry,
  } from "./drop-geometry.js";
  import {
    clearWorkspaceTabDrag,
    isWorkspaceTabDrag,
    readWorkspaceTabDrag,
  } from "./tab-drag.js";
  import WorkspaceDropOverlay from "./WorkspaceDropOverlay.svelte";

  let {
    controller,
    group,
    dropZones,
    children,
  }: {
    controller: WorkspaceController;
    group: WorkspaceTabsNode;
    /** Limit edge targets; centre remains available for every tab group. */
    dropZones?: WorkspaceDropZone[];
    children: Snippet;
  } = $props();

  let geometry = $state<WorkspaceDropOverlayGeometry | null>(null);

  function clearDrop() {
    geometry = null;
  }

  function updateDrop(event: DragEvent) {
    if (!isWorkspaceTabDrag(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    const payload = readWorkspaceTabDrag(event);
    if (payload?.groupId === group.id && group.tabs.length === 1) {
      clearDrop();
      return;
    }
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
    geometry = getWorkspaceDropOverlayGeometry({
      width: rect.width,
      height: rect.height,
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
      dropZones,
    });
  }

  function leaveDrop(event: DragEvent) {
    const zone = event.currentTarget as HTMLElement;
    if (
      event.relatedTarget instanceof Node &&
      zone.contains(event.relatedTarget)
    ) {
      return;
    }
    clearDrop();
  }

  function performDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const payload = readWorkspaceTabDrag(event);
    const position = geometry?.position ?? "center";
    clearDrop();
    clearWorkspaceTabDrag();
    if (payload) controller.dropTabOnGroup(payload.tabId, group.id, position);
  }
</script>

<div
  data-ui-component="workspace"
  data-ui-part="tab-drop-zone"
  data-drop-active={geometry !== null}
  data-drop-position={geometry?.position}
  role="region"
  aria-label={`Drop a tab into ${group.id}`}
  ondragenter={updateDrop}
  ondragover={updateDrop}
  ondragleave={leaveDrop}
  ondrop={performDrop}
>
  {@render children()}
  {#if geometry}
    <WorkspaceDropOverlay {geometry} />
  {/if}
</div>

<style>
  [data-ui-component="workspace"][data-ui-part="tab-drop-zone"] {
    position: relative;
    display: flex;
    width: 100%;
    min-width: 0;
    min-height: 0;
    height: 100%;
    flex: 1 1 auto;
    overflow: hidden;
    outline: none;
  }
</style>
