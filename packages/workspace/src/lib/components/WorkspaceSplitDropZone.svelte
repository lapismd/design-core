<script lang="ts">
  import type { Snippet } from "svelte";
  import type { WorkspaceController } from "../core/workspace-controller.svelte";
  import type { WorkspaceSplitNode } from "../core/types.js";
  import {
    clearWorkspaceTabDrag,
    isWorkspaceTabDrag,
    readWorkspaceTabDrag,
  } from "./tab-drag.js";

  let {
    controller,
    split,
    children,
  }: {
    controller: WorkspaceController;
    split: WorkspaceSplitNode;
    children: Snippet;
  } = $props();

  let active = $state(false);

  function updateDrop(event: DragEvent) {
    if (!isWorkspaceTabDrag(event)) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    active = true;
  }

  function leaveDrop(event: DragEvent) {
    const zone = event.currentTarget as HTMLElement;
    if (
      event.relatedTarget instanceof Node &&
      zone.contains(event.relatedTarget)
    ) {
      return;
    }
    active = false;
  }

  function performDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    const payload = readWorkspaceTabDrag(event);
    active = false;
    clearWorkspaceTabDrag();
    if (payload) controller.dropTabOnEmptySplit(payload.tabId, split.id);
  }
</script>

<div
  data-ui-component="workspace"
  data-ui-part="split-drop-zone"
  data-drop-active={active}
  role="region"
  aria-label={`Drop a tab into empty split ${split.id}`}
  ondragenter={updateDrop}
  ondragover={updateDrop}
  ondragleave={leaveDrop}
  ondrop={performDrop}
>
  {@render children()}
</div>

<style>
  [data-ui-component="workspace"][data-ui-part="split-drop-zone"] {
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

  [data-ui-component="workspace"][data-ui-part="split-drop-zone"][data-drop-active="true"] {
    outline: 2px solid var(--ui-workspace-drop-overlay, var(--primary));
    outline-offset: -2px;
  }
</style>
