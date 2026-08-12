<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import * as Resizable from "@lapismd/design-core/shadcn/resizable";
  import { Collapsible, ContextMenu } from "bits-ui";
  import { onMount } from "svelte";
  import type {
    WorkspaceSidebarGroup,
    WorkspaceTabsNode,
  } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceContextMenuItems from "../menu/WorkspaceContextMenuItems.svelte";
  import WorkspaceViewLabel from "../view-header/WorkspaceViewLabel.svelte";
  import {
    collapsedDockPanelSize,
    dockPanelDefaultSizes,
  } from "../sidebar-group/workspace-sidebar-layout.js";
  import WorkspaceViewHost from "../view-host/WorkspaceViewHost.svelte";

  let {
    controller,
    group,
    pane,
    drag,
  }: {
    controller: WorkspaceShellController;
    group: WorkspaceSidebarGroup;
    pane: WorkspaceTabsNode;
    drag?: WorkspaceDragState;
  } = $props();

  const createInternalDrag = () => new WorkspaceDragState(controller);
  const internalDrag = createInternalDrag();
  let dragState = $derived(drag ?? internalDrag);
  let stackWidth = $state<number>();
  let layoutReady = $state(false);
  let panelDropIndicator = $state<{
    index: number;
    position: "left" | "right";
  } | null>(null);
  let visibleTabs = $derived(
    group.tabs.filter((tab) => !group.hiddenTabIds.includes(tab.id)),
  );
  let collapsedSize = $derived(
    collapsedDockPanelSize(stackWidth, visibleTabs.length),
  );
  let allCollapsed = $derived(
    visibleTabs.length > 0 &&
      visibleTabs.every((tab) => group.collapsedByTabId[tab.id] === true),
  );
  let collapsedSpacerSize = $derived(
    allCollapsed ? Math.max(0, 100 - visibleTabs.length * collapsedSize) : 0,
  );
  let defaultSizes = $derived(
    dockPanelDefaultSizes(group, visibleTabs, collapsedSize),
  );
  let layoutKey = $derived(
    `${visibleTabs
      .map((tab) => `${tab.id}:${group.collapsedByTabId[tab.id] === true}`)
      .join("|")}:${collapsedSize.toFixed(4)}`,
  );

  function observeStack(node: HTMLElement) {
    const update = () => {
      const width = Number(node.getBoundingClientRect().width.toFixed(2));
      if (Number.isFinite(width) && width > 0 && width !== stackWidth) {
        stackWidth = width;
      }
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

  function clearDropIndicator() {
    panelDropIndicator = null;
    if (dragState.target?.sidebarGroupId === group.id) {
      dragState.clearTarget(pane.id);
    }
  }

  function updateDropIndicator(
    rect: DOMRect,
    clientX: number,
    index: number,
    source: "html5" | "pointer",
  ) {
    const position = clientX - rect.left < rect.width / 2 ? "left" : "right";
    const insertionIndex = position === "right" ? index + 1 : index;
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

  function registerDropTarget(node: HTMLElement, index: number) {
    return {
      destroy: dragState.registerPointerDropTarget(node, {
        onMove: (event) =>
          updateDropIndicator(
            node.getBoundingClientRect(),
            event.clientX,
            index,
            "pointer",
          ),
        onDrop: () => {
          dragState.commitCurrentDrop("pointer");
          clearDropIndicator();
        },
        onLeave: clearDropIndicator,
      }),
    };
  }

  function handleDragOver(event: DragEvent, index: number) {
    event.preventDefault();
    event.stopPropagation();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "move";
    if (event.currentTarget instanceof HTMLElement) {
      updateDropIndicator(
        event.currentTarget.getBoundingClientRect(),
        event.clientX,
        index,
        "html5",
      );
    }
  }

  function toggle(tabId: string, collapsed: boolean) {
    controller.selectTab(tabId);
    controller.setSidebarGroupCollapsed(group.id, tabId, !collapsed);
  }

  onMount(() => controller.onLayoutReady(() => (layoutReady = true)));
</script>

<section
  class="ui-workspace-bottom-panel-group"
  data-ui-component="workspace-bottom-panel-group"
  data-sidebar-group-id={group.id}
  aria-label={group.title}
>
  {#if visibleTabs.length}
    <div
      class="ui-workspace-bottom-panel-group__stack"
      data-ui-part="panel-stack"
      use:observeStack
    >
      {#if stackWidth !== undefined}
        {#key layoutKey}
          <Resizable.PaneGroup
            direction="horizontal"
            class="ui-workspace-bottom-panel-group__pane-group"
            {onLayoutChange}
          >
            {#each visibleTabs as tab, panelIndex (tab.id)}
              {#if panelIndex > 0}
                <Resizable.Handle
                  class="ui-workspace-bottom-panel-group__resizer"
                  aria-orientation="vertical"
                />
              {/if}
              {@const collapsed = group.collapsedByTabId[tab.id] === true}
              {@const panelMenu = controller.createPaneMenu(
                tab.id,
                "sidebar-group-panel",
              )}
              <Resizable.Pane
                defaultSize={defaultSizes[panelIndex]}
                minSize={collapsed ? collapsedSize : 12}
                class="ui-workspace-bottom-panel-group__pane"
              >
                <Collapsible.Root
                  open={!collapsed}
                  class="ui-workspace-bottom-panel-group__collapsible"
                >
                  <div
                    class="ui-workspace-bottom-panel-group__panel"
                    data-ui-part="panel"
                    data-bottom-panel-group-panel-id={tab.id}
                    data-active={controller.activeTabId === tab.id}
                    role="group"
                    aria-label={`${tab.title} panel`}
                    use:registerDropTarget={panelIndex}
                    ondragover={(event) => handleDragOver(event, panelIndex)}
                    ondragleave={clearDropIndicator}
                    ondrop={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      dragState.commitCurrentDrop("html5");
                      clearDropIndicator();
                    }}
                  >
                    {#if panelDropIndicator?.index === panelIndex}
                      <div
                        class="ui-workspace-bottom-panel-group__drop-indicator"
                        data-position={panelDropIndicator.position}
                        data-bottom-panel-group-drop-position={panelDropIndicator.position}
                      ></div>
                    {/if}
                    <ContextMenu.Root>
                      <ContextMenu.Trigger>
                        {#snippet child({ props })}
                          <button
                            {...props}
                            type="button"
                            class="ui-workspace-bottom-panel-group__header"
                            data-ui-part="panel-header"
                            draggable="true"
                            aria-expanded={!collapsed}
                            aria-label={`${collapsed ? "Expand" : "Collapse"} ${tab.title}`}
                            data-hint-target="bottom-panel-group"
                            data-hint-group="bottom-panel"
                            data-hint-action="click"
                            data-hint-target-id={`bottom-panel-group:${group.id}:${tab.id}`}
                            data-hint-label={`${collapsed ? "Expand" : "Collapse"} ${tab.title}`}
                            onpointerdown={(event) =>
                              dragState.startPointer(event, tab.id)}
                            ondragstart={(event) =>
                              dragState.startHtml5(event, tab.id)}
                            ondragend={(event) => dragState.endHtml5(event)}
                            onclick={() => toggle(tab.id, collapsed)}
                          >
                            {#if collapsed}
                              <ChevronRight
                                class="ui-workspace-bottom-panel-group__chevron"
                                aria-hidden="true"
                              />
                            {:else}
                              <ChevronDown
                                class="ui-workspace-bottom-panel-group__chevron"
                                aria-hidden="true"
                              />
                            {/if}
                            <span class="ui-workspace-bottom-panel-group__icon">
                              <WorkspaceIcon name={tab.icon ?? "file"} />
                            </span>
                            <WorkspaceViewLabel
                              {controller}
                              {tab}
                              hostId="root"
                              paneId={pane.id}
                              fallbackTitle={tab.title}
                              class="ui-workspace-bottom-panel-group__title"
                            />
                          </button>
                        {/snippet}
                      </ContextMenu.Trigger>
                      <ContextMenu.Portal>
                        <ContextMenu.Content
                          class="ui-workspace-menu__content"
                          data-ui-component="workspace-menu"
                          data-ui-part="content"
                          sideOffset={4}
                        >
                          <WorkspaceContextMenuItems menu={panelMenu} />
                        </ContextMenu.Content>
                      </ContextMenu.Portal>
                    </ContextMenu.Root>
                    <Collapsible.Content
                      class="ui-workspace-bottom-panel-group__content"
                    >
                      <WorkspaceViewHost
                        {controller}
                        {tab}
                        hostId="root"
                        paneId={pane.id}
                      />
                    </Collapsible.Content>
                  </div>
                </Collapsible.Root>
              </Resizable.Pane>
            {/each}
            {#if allCollapsed && collapsedSpacerSize > 0}
              <Resizable.Pane
                defaultSize={collapsedSpacerSize}
                minSize={0}
                class="ui-workspace-bottom-panel-group__spacer"
              />
            {/if}
          </Resizable.PaneGroup>
        {/key}
      {/if}
    </div>
  {:else}
    <div class="ui-workspace-bottom-panel-group__empty">
      <WorkspaceIcon name="panel-top-open" />
      <span>No visible panels in this group.</span>
    </div>
  {/if}
</section>
