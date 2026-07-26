<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronUp from "@lucide/svelte/icons/chevron-up";
  import GripHorizontal from "@lucide/svelte/icons/grip-horizontal";
  import Maximize from "@lucide/svelte/icons/maximize-2";
  import Minus from "@lucide/svelte/icons/minus";
  import PanelTopClose from "@lucide/svelte/icons/panel-top-close";
  import Square from "@lucide/svelte/icons/square";
  import Close from "@lucide/svelte/icons/x";
  import type {
    WorkspaceNode,
    WorkspaceTab,
    WorkspaceWindow,
    WorkspaceWindowBounds,
  } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import type { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspaceTree from "../tree/WorkspaceTree.svelte";
  import "./WorkspaceFloatingWindow.css";

  type ResizeEdge = "n" | "e" | "s" | "w" | "ne" | "nw" | "se" | "sw";

  let {
    controller,
    window: workspaceWindow,
    drag,
    createTab,
    dockMode = "free",
    boundsRoot,
  }: {
    controller: WorkspaceShellController;
    window: WorkspaceWindow;
    drag: WorkspaceDragState;
    createTab?: (paneId: string) => WorkspaceTab;
    dockMode?: "free" | "minimized";
    boundsRoot?: HTMLElement | null;
  } = $props();

  function firstTab(node: WorkspaceNode): WorkspaceTab | null {
    if (node.kind === "split") {
      for (const child of node.children) {
        const tab = firstTab(child);
        if (tab) return tab;
      }
      return null;
    }
    for (const item of node.items) {
      if (item.kind === "tab") return item;
      if (item.tabs[0]) return item.tabs[0];
    }
    return null;
  }

  function firstPaneId(node: WorkspaceNode): string {
    return node.kind === "tabs" ? node.id : firstPaneId(node.children[0]!);
  }

  function countTabs(node: WorkspaceNode): number {
    if (node.kind === "split") {
      return node.children.reduce(
        (count, child) => count + countTabs(child),
        0,
      );
    }
    return node.items.reduce(
      (count, item) => count + (item.kind === "tab" ? 1 : item.tabs.length),
      0,
    );
  }

  let title = $derived(
    firstTab(workspaceWindow.root)?.title ?? "Floating pane",
  );
  let tabCount = $derived(countTabs(workspaceWindow.root));
  let summary = $derived(tabCount > 1 ? `${title} (${tabCount} tabs)` : title);
  let isCollapsed = $derived(workspaceWindow.state === "collapsed");
  let isMaximized = $derived(workspaceWindow.state === "maximized");
  let index = $derived(
    controller.layout.windows.findIndex(
      (entry) => entry.id === workspaceWindow.id,
    ),
  );
  let style = $derived.by(() => {
    if (dockMode === "minimized") return `z-index: ${index + 1};`;
    if (isMaximized) {
      return "left: 0; top: 0; width: 100%; height: 100%; z-index: calc(var(--ui-workspace-overlay-z-index) + 2);";
    }
    return `left: ${workspaceWindow.bounds.x}px; top: ${workspaceWindow.bounds.y}px; width: ${workspaceWindow.bounds.width}px; height: ${isCollapsed ? 44 : workspaceWindow.bounds.height}px; z-index: ${index + 1};`;
  });

  function clamp(bounds: WorkspaceWindowBounds): WorkspaceWindowBounds {
    const rootWidth = boundsRoot?.clientWidth ?? window.innerWidth;
    const rootHeight = boundsRoot?.clientHeight ?? window.innerHeight;
    const width = Math.max(
      280,
      Math.min(bounds.width, Math.max(280, rootWidth)),
    );
    const height = Math.max(
      180,
      Math.min(bounds.height, Math.max(180, rootHeight)),
    );
    return {
      x: Math.max(0, Math.min(bounds.x, Math.max(0, rootWidth - width))),
      y: Math.max(0, Math.min(bounds.y, Math.max(0, rootHeight - height))),
      width,
      height,
    };
  }

  function beginMove(event: PointerEvent) {
    if (event.button !== 0 || dockMode === "minimized" || isMaximized) return;
    controller.focusWindow(workspaceWindow.id);
    const start = { x: event.clientX, y: event.clientY };
    const initial = { ...workspaceWindow.bounds };
    const pointerId = event.pointerId;
    const target = event.currentTarget as HTMLElement;
    const ownerWindow = target.ownerDocument.defaultView ?? window;
    target.setPointerCapture?.(pointerId);
    const move = (moveEvent: PointerEvent) => {
      controller.setWindowBounds(
        workspaceWindow.id,
        clamp({
          ...initial,
          x: initial.x + moveEvent.clientX - start.x,
          y: initial.y + moveEvent.clientY - start.y,
        }),
        false,
      );
    };
    const finish = () => {
      controller.setWindowBounds(
        workspaceWindow.id,
        workspaceWindow.bounds,
        true,
      );
      target.releasePointerCapture?.(pointerId);
      ownerWindow.removeEventListener("pointermove", move);
      ownerWindow.removeEventListener("pointerup", finish);
      ownerWindow.removeEventListener("pointercancel", finish);
    };
    ownerWindow.addEventListener("pointermove", move);
    ownerWindow.addEventListener("pointerup", finish);
    ownerWindow.addEventListener("pointercancel", finish);
  }

  function beginResize(edge: ResizeEdge, event: PointerEvent) {
    if (event.button !== 0 || isCollapsed || isMaximized) return;
    event.stopPropagation();
    controller.focusWindow(workspaceWindow.id);
    const start = { x: event.clientX, y: event.clientY };
    const initial = { ...workspaceWindow.bounds };
    const pointerId = event.pointerId;
    const target = event.currentTarget as HTMLElement;
    const ownerWindow = target.ownerDocument.defaultView ?? window;
    target.setPointerCapture?.(pointerId);
    const move = (moveEvent: PointerEvent) => {
      const dx = moveEvent.clientX - start.x;
      const dy = moveEvent.clientY - start.y;
      const next = { ...initial };
      if (edge.includes("e")) next.width += dx;
      if (edge.includes("s")) next.height += dy;
      if (edge.includes("w")) {
        next.x += dx;
        next.width -= dx;
      }
      if (edge.includes("n")) {
        next.y += dy;
        next.height -= dy;
      }
      if (next.width < 280) {
        if (edge.includes("w")) next.x -= 280 - next.width;
        next.width = 280;
      }
      if (next.height < 180) {
        if (edge.includes("n")) next.y -= 180 - next.height;
        next.height = 180;
      }
      controller.setWindowBounds(workspaceWindow.id, clamp(next), false);
    };
    const finish = () => {
      controller.setWindowBounds(
        workspaceWindow.id,
        workspaceWindow.bounds,
        true,
      );
      target.releasePointerCapture?.(pointerId);
      ownerWindow.removeEventListener("pointermove", move);
      ownerWindow.removeEventListener("pointerup", finish);
      ownerWindow.removeEventListener("pointercancel", finish);
    };
    ownerWindow.addEventListener("pointermove", move);
    ownerWindow.addEventListener("pointerup", finish);
    ownerWindow.addEventListener("pointercancel", finish);
  }

  function redock() {
    controller.dockWindow(
      workspaceWindow.id,
      firstPaneId(controller.layout.main),
    );
  }
</script>

{#if dockMode === "minimized"}
  <div
    class="ui-workspace-floating-window ui-workspace-floating-window--minimized"
    data-ui-component="workspace-floating-window"
    data-ui-part="minimized"
    data-floating-window-id={workspaceWindow.id}
    data-floating-window-state="minimized"
    {style}
  >
    <button
      type="button"
      class="ui-workspace-floating-window__restore"
      aria-label={`Restore floating pane ${title}`}
      onclick={() => controller.setWindowState(workspaceWindow.id, "normal")}
    >
      <GripHorizontal aria-hidden="true" />
      <span>{summary}</span>
    </button>
    <button
      type="button"
      class="ui-workspace-floating-window__control"
      aria-label="Close floating pane"
      onclick={() => controller.closeWindow(workspaceWindow.id)}
    >
      <Close aria-hidden="true" />
    </button>
  </div>
{:else}
  <div
    class="ui-workspace-floating-window"
    class:ui-workspace-floating-window--maximized={isMaximized}
    data-ui-component="workspace-floating-window"
    data-ui-part="window"
    data-floating-window-id={workspaceWindow.id}
    data-floating-window-state={workspaceWindow.state}
    role="dialog"
    aria-label={title}
    tabindex="-1"
    {style}
    onpointerdown={() => controller.focusWindow(workspaceWindow.id)}
  >
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
      class="ui-workspace-floating-window__header"
      data-ui-part="header"
      data-floating-pane-header="true"
      onpointerdown={beginMove}
    >
      <div class="ui-workspace-floating-window__title">
        <GripHorizontal aria-hidden="true" />
        <span data-floating-pane-title="true">{summary}</span>
      </div>
      <div class="ui-workspace-floating-window__controls">
        <button
          type="button"
          class="ui-workspace-floating-window__control"
          aria-label={isCollapsed
            ? "Restore floating pane"
            : "Collapse floating pane"}
          onpointerdown={(event) => event.stopPropagation()}
          onclick={() =>
            controller.setWindowState(
              workspaceWindow.id,
              isCollapsed ? "normal" : "collapsed",
            )}
        >
          {#if isCollapsed}
            <ChevronUp aria-hidden="true" />
          {:else}
            <ChevronDown aria-hidden="true" />
          {/if}
        </button>
        <button
          type="button"
          class="ui-workspace-floating-window__control"
          aria-label="Minimize floating pane"
          onpointerdown={(event) => event.stopPropagation()}
          onclick={() =>
            controller.setWindowState(workspaceWindow.id, "minimized")}
        >
          <Minus aria-hidden="true" />
        </button>
        <button
          type="button"
          class="ui-workspace-floating-window__control"
          aria-label={isMaximized
            ? "Restore floating pane size"
            : "Maximize floating pane"}
          onpointerdown={(event) => event.stopPropagation()}
          onclick={() =>
            controller.setWindowState(
              workspaceWindow.id,
              isMaximized ? "normal" : "maximized",
            )}
        >
          {#if isMaximized}
            <Square aria-hidden="true" />
          {:else}
            <Maximize aria-hidden="true" />
          {/if}
        </button>
        <button
          type="button"
          class="ui-workspace-floating-window__control"
          aria-label="Redock floating pane"
          onpointerdown={(event) => event.stopPropagation()}
          onclick={redock}
        >
          <PanelTopClose aria-hidden="true" />
        </button>
        <button
          type="button"
          class="ui-workspace-floating-window__control"
          aria-label="Close floating pane"
          onpointerdown={(event) => event.stopPropagation()}
          onclick={() => controller.closeWindow(workspaceWindow.id)}
        >
          <Close aria-hidden="true" />
        </button>
      </div>
    </div>

    {#if !isCollapsed}
      <div class="ui-workspace-floating-window__body" data-ui-part="body">
        <WorkspaceTree
          {controller}
          node={workspaceWindow.root}
          hostId={workspaceWindow.id}
          {drag}
          {createTab}
        />
      </div>
    {/if}

    {#if !isCollapsed && !isMaximized}
      {#each ["n", "e", "s", "w", "ne", "nw", "se", "sw"] as edge}
        <button
          type="button"
          class="ui-workspace-floating-window__resize"
          data-edge={edge}
          aria-label={`Resize floating pane ${edge}`}
          onpointerdown={(event) => beginResize(edge as ResizeEdge, event)}
        ></button>
      {/each}
    {/if}
  </div>
{/if}
