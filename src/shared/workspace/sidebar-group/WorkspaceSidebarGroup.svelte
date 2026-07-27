<script lang="ts">
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import * as Resizable from "@stevejuma/ui/shadcn/resizable";
  import { Collapsible } from "bits-ui";
  import { onMount } from "svelte";
  import type {
    WorkspaceSidebarGroup as WorkspaceSidebarGroupModel,
    WorkspaceSide,
    WorkspaceTabsNode,
  } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceViewHost from "../view-host/WorkspaceViewHost.svelte";
  import {
    collapsedSidebarPanelSize,
    sidebarPanelDefaultSizes,
  } from "./workspace-sidebar-layout.js";
  import "./WorkspaceSidebarGroup.css";

  let {
    controller,
    group,
    pane,
    side,
    drag,
  }: {
    controller: WorkspaceShellController;
    group: WorkspaceSidebarGroupModel;
    pane: WorkspaceTabsNode;
    side: WorkspaceSide;
    drag?: WorkspaceDragState;
  } = $props();

  const createInternalDrag = () => new WorkspaceDragState(controller);
  const internalDrag = createInternalDrag();
  let dragState = $derived(drag ?? internalDrag);
  let groupedPanelStackHeight = $state<number>();
  let layoutReady = $state(false);
  let panelDropIndicator = $state<{
    index: number;
    position: "top" | "bottom";
  } | null>(null);
  let visibleTabs = $derived(
    group.tabs.filter((tab) => !group.hiddenTabIds.includes(tab.id)),
  );
  let collapsedSize = $derived(
    collapsedSidebarPanelSize(groupedPanelStackHeight, visibleTabs.length),
  );
  let allCollapsed = $derived(
    visibleTabs.length > 0 &&
      visibleTabs.every((tab) => group.collapsedByTabId[tab.id] === true),
  );
  let collapsedSpacerSize = $derived(
    allCollapsed ? Math.max(0, 100 - visibleTabs.length * collapsedSize) : 0,
  );
  let defaultSizes = $derived(
    sidebarPanelDefaultSizes(group, visibleTabs, collapsedSize),
  );
  let layoutKey = $derived(
    `${visibleTabs
      .map((tab) => `${tab.id}:${group.collapsedByTabId[tab.id] === true}`)
      .join("|")}:${collapsedSize.toFixed(4)}`,
  );

  function observeGroupedPanelStack(node: HTMLElement) {
    const update = () => {
      const nextHeight = Number(node.getBoundingClientRect().height.toFixed(2));
      if (!Number.isFinite(nextHeight) || nextHeight <= 0) return;
      if (groupedPanelStackHeight === nextHeight) return;
      groupedPanelStackHeight = nextHeight;
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(node);
    return { destroy: () => observer.disconnect() };
  }

  function onLayoutChange(sizes: number[]) {
    if (!layoutReady || sizes.length !== visibleTabs.length) return;
    const expandedSizes = Object.fromEntries(
      visibleTabs.flatMap((tab, index) =>
        group.collapsedByTabId[tab.id]
          ? []
          : [[tab.id, sizes[index] ?? 0] as const],
      ),
    );
    if (Object.keys(expandedSizes).length) {
      controller.setSidebarPanelSizes(group.id, expandedSizes);
    }
  }

  function clearPanelDropIndicator() {
    panelDropIndicator = null;
    if (dragState.target?.sidebarGroupId === group.id) {
      dragState.clearTarget(pane.id);
    }
  }

  function updatePanelDropIndicator(
    rect: DOMRect,
    clientY: number,
    index: number,
    source: "html5" | "pointer",
  ) {
    const position = clientY - rect.top < rect.height / 2 ? "top" : "bottom";
    const insertionIndex = position === "bottom" ? index + 1 : index;
    panelDropIndicator = dragState.setSidebarGroupTarget(
      pane.id,
      group.id,
      insertionIndex,
      position,
      source,
    )
      ? { index, position }
      : null;
  }

  function registerPanelDropTarget(node: HTMLElement, index: number) {
    return {
      destroy: dragState.registerPointerDropTarget(node, {
        onMove: (event) =>
          updatePanelDropIndicator(
            node.getBoundingClientRect(),
            event.clientY,
            index,
            "pointer",
          ),
        onDrop: () => {
          dragState.commitCurrentDrop("pointer");
          clearPanelDropIndicator();
        },
        onLeave: clearPanelDropIndicator,
      }),
    };
  }

  function handlePanelDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    if (!(event.currentTarget instanceof HTMLElement)) return;
    updatePanelDropIndicator(
      event.currentTarget.getBoundingClientRect(),
      event.clientY,
      index,
      "html5",
    );
  }

  function handlePanelDragLeave(event: DragEvent) {
    if (
      event.currentTarget instanceof HTMLElement &&
      event.relatedTarget instanceof Node &&
      event.currentTarget.contains(event.relatedTarget)
    ) {
      return;
    }
    clearPanelDropIndicator();
  }

  function handlePanelDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    dragState.commitCurrentDrop("html5");
    clearPanelDropIndicator();
  }

  function toggle(tabId: string, collapsed: boolean) {
    controller.selectTab(tabId);
    controller.setSidebarGroupCollapsed(group.id, tabId, !collapsed);
  }

  onMount(() => controller.onLayoutReady(() => (layoutReady = true)));
</script>

<!-- Source shape: packages/workspace/src/lib/components/tabs/tabs-sidebar.svelte -->
<section
  class="ui-workspace-sidebar-group"
  data-ui-component="workspace-sidebar-group"
  data-sidebar-group-id={group.id}
  data-workspace-sidebar-side={side}
  aria-label={group.title}
>
  {#if visibleTabs.length}
    <div
      class="ui-workspace-sidebar-group__stack"
      data-ui-part="panel-stack"
      use:observeGroupedPanelStack
    >
      {#if groupedPanelStackHeight !== undefined}
        {#key layoutKey}
          <Resizable.PaneGroup
            direction="vertical"
            class="ui-workspace-sidebar-group__pane-group"
            {onLayoutChange}
          >
            {#each visibleTabs as tab, panelIndex (tab.id)}
              {#if panelIndex > 0}
                <Resizable.Handle
                  class="ui-workspace-sidebar-group__resizer"
                  aria-orientation="horizontal"
                />
              {/if}
              {@const collapsed = group.collapsedByTabId[tab.id] === true}
              <Resizable.Pane
                defaultSize={defaultSizes[panelIndex]}
                minSize={collapsed ? collapsedSize : 12}
                class="ui-workspace-sidebar-group__pane"
              >
                <Collapsible.Root
                  open={!collapsed}
                  class="ui-workspace-sidebar-group__collapsible"
                >
                  <div
                    class="ui-workspace-sidebar-group__panel"
                    data-ui-part="panel"
                    data-sidebar-group-panel-id={tab.id}
                    data-active={controller.activeTabId === tab.id}
                    role="group"
                    aria-label={`${tab.title} panel`}
                    use:registerPanelDropTarget={panelIndex}
                    ondragover={(event) =>
                      handlePanelDragOver(event, panelIndex)}
                    ondragleave={handlePanelDragLeave}
                    ondrop={handlePanelDrop}
                  >
                    {#if panelDropIndicator?.index === panelIndex}
                      <div
                        class="ui-workspace-sidebar-group__drop-indicator"
                        data-position={panelDropIndicator.position}
                        data-sidebar-group-drop-position={panelDropIndicator.position}
                      ></div>
                    {/if}
                    <button
                      type="button"
                      class="ui-workspace-sidebar-group__header"
                      data-ui-part="panel-header"
                      draggable="true"
                      aria-expanded={!collapsed}
                      aria-label={`${collapsed ? "Expand" : "Collapse"} ${tab.title}`}
                      data-hint-target="sidebar-group"
                      data-hint-group="sidebar"
                      data-hint-action="click"
                      data-hint-target-id={`sidebar-group:${group.id}:${tab.id}`}
                      data-hint-label={`${collapsed ? "Expand" : "Collapse"} ${tab.title}`}
                      onpointerdown={(event) =>
                        dragState.startPointer(event, tab.id)}
                      ondragstart={(event) =>
                        dragState.startHtml5(event, tab.id)}
                      ondragend={(event) => dragState.endHtml5(event)}
                      onclick={() => toggle(tab.id, collapsed)}
                    >
                      <ChevronRight
                        class="ui-workspace-sidebar-group__chevron"
                        data-expanded={!collapsed}
                        aria-hidden="true"
                      />
                      <span class="ui-workspace-sidebar-group__icon">
                        <WorkspaceIcon name={tab.icon ?? "file"} />
                      </span>
                      <span class="ui-workspace-sidebar-group__title">
                        {tab.title}
                      </span>
                    </button>
                    <Collapsible.Content
                      class="ui-workspace-sidebar-group__content"
                    >
                      <div class="ui-workspace-sidebar-group__body">
                        <WorkspaceViewHost
                          {controller}
                          {tab}
                          hostId="root"
                          paneId={pane.id}
                        />
                      </div>
                    </Collapsible.Content>
                  </div>
                </Collapsible.Root>
              </Resizable.Pane>
            {/each}
            {#if allCollapsed && collapsedSpacerSize > 0}
              <Resizable.Pane
                defaultSize={collapsedSpacerSize}
                minSize={0}
                class="ui-workspace-sidebar-group__spacer"
              />
            {/if}
          </Resizable.PaneGroup>
        {/key}
      {/if}
    </div>
  {:else}
    <div class="ui-workspace-sidebar-group__empty">
      <WorkspaceIcon name="panel-top-open" />
      <span>No visible panels in this group.</span>
    </div>
  {/if}
</section>
