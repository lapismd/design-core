<script lang="ts">
  import type { Snippet } from "svelte";
  import type {
    WorkspaceLayoutDropEvent,
    WorkspaceTabsNode,
  } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import type { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import {
    resolveWorkspaceDropOverlay,
    type WorkspaceDropZone,
  } from "./workspace-tabs-drop.js";
  import "./WorkspaceDropOverlay.css";

  let {
    class: className,
    controller,
    drag,
    parent,
    children,
    dropZones = ["left", "right", "top", "bottom"],
  }: {
    class?: string;
    controller: WorkspaceShellController;
    drag: WorkspaceDragState;
    parent: WorkspaceTabsNode;
    children?: Snippet;
    dropZones?: WorkspaceDropZone[];
  } = $props();

  let container = $state<HTMLElement>();
  let position = $state({ style: "", active: false });

  function containsOnlyDraggedTab(): boolean {
    if (!drag.active || parent.items.length !== 1) return false;
    const only = parent.items[0];
    if (!only) return false;
    if (only.kind === "tab") return only.id === drag.active.tabId;
    return only.tabs.length === 1 && only.tabs[0]?.id === drag.active.tabId;
  }

  function clearDropOverlay() {
    if (drag.target?.paneId === parent.id) drag.clearTarget(parent.id);
    position.active = false;
  }

  function updateDropOverlay(
    clientX: number,
    clientY: number,
    source: WorkspaceLayoutDropEvent["source"],
  ) {
    if (!drag.active || !container || containsOnlyDraggedTab()) {
      clearDropOverlay();
      return;
    }

    const next = resolveWorkspaceDropOverlay(
      clientX,
      clientY,
      container.getBoundingClientRect(),
      dropZones,
    );
    const overlayEvent = controller.willShowDropOverlay({
      tabId: drag.active.tabId,
      targetPaneId: parent.id,
      position: next.position,
      source,
      operation: next.position === "center" ? "tab-drop" : "split-drop",
    });
    if (overlayEvent.defaultPrevented) {
      clearDropOverlay();
      return;
    }

    position = { style: next.style, active: true };
    drag.setBodyTarget(parent.id, next.position);
  }

  function registerDropTarget(node: HTMLElement) {
    return {
      destroy: drag.registerPointerDropTarget(node, {
        onMove: (event) =>
          updateDropOverlay(event.clientX, event.clientY, "pointer"),
        onDrop: () => performDrop("pointer"),
        onLeave: clearDropOverlay,
      }),
    };
  }

  function handleDragOver(event: DragEvent) {
    event.preventDefault();
    if (!event.dataTransfer || !drag.active) return;
    event.dataTransfer.dropEffect = "move";
    updateDropOverlay(event.clientX, event.clientY, "html5");
  }

  function handleDragEnter(event: DragEvent) {
    event.preventDefault();
  }

  function handleDragLeave(event: DragEvent) {
    if (
      container &&
      event.relatedTarget instanceof Node &&
      container.contains(event.relatedTarget)
    ) {
      return;
    }
    clearDropOverlay();
  }

  function performDrop(source: "html5" | "pointer") {
    position.active = false;
    drag.commitCurrentDrop(source);
  }

  function handleDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
    performDrop("html5");
  }
</script>

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div
  bind:this={container}
  class={["ui-workspace-tabs-drop", className].filter(Boolean).join(" ")}
  data-ui-component="workspace-tabs-drop"
  data-workspace-pane-id={parent.id}
  use:registerDropTarget
  ondragenter={handleDragEnter}
  ondragover={handleDragOver}
  ondragleave={handleDragLeave}
  ondrop={handleDrop}
>
  {@render children?.()}
  {#if position.active && drag.active}
    <div
      class="workspace-drop-overlay ui-workspace-drop-overlay"
      data-ui-part="overlay"
      data-drop-position={drag.target?.position}
      style={position.style}
    ></div>
  {/if}
</div>
