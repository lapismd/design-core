<script lang="ts">
  import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";
  import { ContextMenu } from "bits-ui";
  import type { Snippet } from "svelte";
  import type {
    WorkspaceSide,
    WorkspaceSidebarState,
    WorkspaceTab,
    WorkspaceTabItem,
    WorkspaceTabsNode,
  } from "../core/types.js";
  import { WorkspaceMenu } from "../core/workspace-menu.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspaceTabsDrop from "../drop-overlay/WorkspaceTabsDrop.svelte";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceContextMenuItems from "../menu/WorkspaceContextMenuItems.svelte";
  import WorkspaceSidebarEmpty from "../sidebar-empty/WorkspaceSidebarEmpty.svelte";
  import WorkspaceSidebarGroup from "../sidebar-group/WorkspaceSidebarGroup.svelte";
  import WorkspaceSidebarGroupEditor from "../sidebar-group/WorkspaceSidebarGroupEditor.svelte";
  import WorkspaceSidebarGroupVisibilityDialog from "../sidebar-group/WorkspaceSidebarGroupVisibilityDialog.svelte";
  import WorkspaceSidebarToggle from "../sidebar-toggle/WorkspaceSidebarToggle.svelte";
  import WorkspaceTabsMove from "../tabs/WorkspaceTabsMove.svelte";
  import WorkspaceViewLabel from "../view-header/WorkspaceViewLabel.svelte";
  import { resolveWorkspaceViewLabel } from "../view-header/workspace-view-label.js";
  import WorkspaceViewHost from "../view-host/WorkspaceViewHost.svelte";
  import "./WorkspaceSidebar.css";

  let {
    controller,
    side,
    state: suppliedState,
    drag,
    footer,
    width,
    resizable = true,
  }: {
    controller: WorkspaceShellController;
    side: WorkspaceSide;
    state?: WorkspaceSidebarState;
    drag?: WorkspaceDragState;
    footer?: Snippet;
    width?: string;
    resizable?: boolean;
  } = $props();

  const createInternalDrag = () => new WorkspaceDragState(controller);
  const internalDrag = createInternalDrag();
  let dragState = $derived(drag ?? internalDrag);
  let sidebar = $derived(suppliedState ?? controller.layout[side]);
  let pane = $derived(sidebar.root.kind === "tabs" ? sidebar.root : undefined);
  let activeItem = $derived(
    pane?.items.find((item) => item.id === pane?.activeItemId) ??
      pane?.items[0],
  );
  let resizing = $state(false);
  let editingGroup = $state<Extract<
    WorkspaceTabItem,
    { kind: "sidebar-group" }
  > | null>(null);
  let editingGroupOpen = $state(false);
  let visibilityGroup = $state<Extract<
    WorkspaceTabItem,
    { kind: "sidebar-group" }
  > | null>(null);
  let visibilityGroupOpen = $state(false);
  let tabIndicatorRoot = $state<HTMLElement | null>(null);
  let tabIndicatorScope = $derived(`sidebar-${side}-${pane?.id ?? "empty"}`);
  let resizeStartX = 0;
  let resizeStartWidth = 0;

  function tabFor(item: WorkspaceTabItem): WorkspaceTab | undefined {
    return item.kind === "tab" ? item : item.tabs[0];
  }

  function select(item: WorkspaceTabItem) {
    const tab = tabFor(item);
    if (tab) controller.selectTab(tab.id);
  }

  function isSelected(item: WorkspaceTabItem) {
    return pane?.activeItemId === item.id;
  }

  function itemLabel(item: WorkspaceTabItem): string {
    if (item.kind !== "tab") return item.title;
    return resolveWorkspaceViewLabel(
      controller,
      item,
      "root",
      pane?.id ?? `${side}-sidebar`,
      item.title,
    ).accessibleLabel;
  }

  function createItemMenu(
    item: WorkspaceTabItem,
    tab: WorkspaceTab | undefined,
  ): WorkspaceMenu {
    if (item.kind === "tab") {
      return tab ? controller.createPaneMenu(tab.id) : new WorkspaceMenu();
    }

    const hasHiddenPanels = item.hiddenTabIds.length > 0;
    return new WorkspaceMenu().addGroups([
      (menu) =>
        menu
          .addItem((entry) =>
            entry
              .setTitle("Rename group")
              .setIcon("pencil")
              .onClick(() => {
                editingGroup = item;
                editingGroupOpen = true;
              }),
          )
          .addItem((entry) =>
            entry
              .setTitle("Manage visible panels")
              .setIcon("eye")
              .onClick(() => {
                visibilityGroup = item;
                visibilityGroupOpen = true;
              }),
          ),
      (menu) =>
        menu
          .addItem((entry) =>
            entry
              .setTitle("Ungroup into sidebar tabs")
              .setIcon("panel-top-open")
              .onClick(() => {
                controller.ungroupSidebarGroup(item.id);
              }),
          )
          .addItem((entry) =>
            entry
              .setTitle("Close hidden panels")
              .setIcon("eye-off")
              .setDisabled(!hasHiddenPanels)
              .onClick(() => {
                controller.closeHiddenSidebarPanels(item.id);
              }),
          )
          .addItem((entry) =>
            entry
              .setTitle("Close group")
              .setIcon("x")
              .onClick(() => {
                controller.closeSidebarGroup(item.id);
              }),
          ),
    ]);
  }

  function startResize(event: MouseEvent) {
    if (!resizable) return;
    resizing = true;
    resizeStartX = event.clientX;
    resizeStartWidth = sidebar.size;
    event.preventDefault();
    const resize = (moveEvent: MouseEvent) => {
      const direction = side === "left" ? 1 : -1;
      controller.setSidebarSize(
        side,
        resizeStartWidth + (moveEvent.clientX - resizeStartX) * direction,
      );
    };
    const endResize = () => {
      resizing = false;
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", endResize);
    };
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", endResize);
  }

  function handleTabIndicatorLeave(event: DragEvent) {
    if (
      tabIndicatorRoot &&
      event.relatedTarget instanceof Node &&
      tabIndicatorRoot.contains(event.relatedTarget)
    ) {
      return;
    }
    dragState.clearTabMoveIndicator(tabIndicatorScope);
  }
</script>

{#if sidebar.open}
  <aside
    class="ui-workspace-sidebar"
    data-ui-component="workspace-sidebar"
    data-ui-part="sidebar"
    data-app-shell-sidebar={side}
    data-workspace-sidebar-side={side}
    data-workspace-surface={`${side}-sidebar`}
    style={`width: ${width ?? `${sidebar.size}px`}`}
    aria-label={`${side === "left" ? "Left" : "Right"} sidebar`}
  >
    {#if pane}
      <!-- svelte-ignore a11y_no_static_element_interactions -->
      <div
        bind:this={tabIndicatorRoot}
        class="ui-workspace-sidebar__tab-bar"
        data-ui-part="sidebar-tab-bar"
        data-workspace-tab-strip="sidebar"
        ondragleave={handleTabIndicatorLeave}
      >
        <div
          class="ui-workspace-sidebar__tab-list"
          role="tablist"
          aria-label={`${side === "left" ? "Left" : "Right"} sidebar tabs`}
        >
          {#each pane.items as item, index (item.id)}
            {@const tab = tabFor(item)}
            {@const menu = createItemMenu(item, tab)}
            <WorkspaceTabsMove
              {pane}
              {index}
              drag={dragState}
              indicatorRoot={tabIndicatorRoot}
              indicatorScope={tabIndicatorScope}
              activate={() => select(item)}
              class="ui-workspace-sidebar__tab-move"
              data-ui-part="sidebar-tab-move-target"
            >
              <ContextMenu.Root>
                <ContextMenu.Trigger>
                  {#snippet child({ props })}
                    <button
                      {...props}
                      type="button"
                      role="tab"
                      class="ui-workspace-sidebar__tab"
                      data-ui-part="sidebar-tab"
                      data-state={isSelected(item) ? "on" : "off"}
                      aria-selected={isSelected(item)}
                      aria-controls={`workspace-sidebar-panel-${side}`}
                      id={`workspace-sidebar-tab-${side}-${item.id}`}
                      aria-label={itemLabel(item)}
                      title={itemLabel(item)}
                      draggable={Boolean(tab)}
                      data-workspace-tab-id={tab?.id}
                      data-workspace-item-id={item.id}
                      onpointerdown={(event) =>
                        tab && dragState.startPointer(event, tab.id)}
                      ondragstart={(event) =>
                        tab && dragState.startHtml5(event, tab.id)}
                      ondragend={(event) => tab && dragState.endHtml5(event)}
                      onclick={() => select(item)}
                    >
                      <WorkspaceIcon name={item.icon ?? tab?.icon ?? "file"} />
                      {#if item.kind === "tab"}
                        <WorkspaceViewLabel
                          {controller}
                          tab={item}
                          hostId="root"
                          paneId={pane?.id ?? `${side}-sidebar`}
                          fallbackTitle={item.title}
                          showTitle={false}
                          announce={false}
                        />
                      {:else}
                        <span class="sr-only">{item.title}</span>
                      {/if}
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
                    <WorkspaceContextMenuItems {menu} />
                  </ContextMenu.Content>
                </ContextMenu.Portal>
              </ContextMenu.Root>
            </WorkspaceTabsMove>
          {/each}
        </div>

        <div class="ui-workspace-sidebar__tab-spacer"></div>

        <WorkspaceSidebarToggle
          {side}
          size="small"
          expanded
          label={`Close ${side} sidebar`}
          onSelect={() => controller.setSidebarOpen(side, false)}
        />

        {#if dragState.tabMoveIndicator.active && dragState.tabMoveIndicator.scope === tabIndicatorScope && dragState.active}
          <div
            class="workspace-tab-drop-indicator ui-workspace-sidebar__insertion-marker"
            data-workspace-tab-insertion-marker
            style={`width: ${dragState.tabMoveIndicator.width}px; height: ${dragState.tabMoveIndicator.height}px; transform: translate(${dragState.tabMoveIndicator.x}px, ${dragState.tabMoveIndicator.y}px);`}
          ></div>
        {/if}
      </div>

      <ScrollArea class="ui-workspace-sidebar__body">
        <div
          class="ui-workspace-sidebar__body-content"
          data-ui-part="sidebar-body"
          data-content-kind={activeItem?.kind ?? "empty"}
          id={`workspace-sidebar-panel-${side}`}
          role="tabpanel"
          aria-labelledby={activeItem
            ? `workspace-sidebar-tab-${side}-${activeItem.id}`
            : undefined}
        >
          {#if activeItem?.kind === "sidebar-group"}
            <WorkspaceSidebarGroup
              {controller}
              group={activeItem}
              {pane}
              {side}
              drag={dragState}
            />
          {:else if activeItem?.kind === "tab"}
            <WorkspaceTabsDrop
              {controller}
              drag={dragState}
              parent={pane}
              dropZones={["top", "bottom"]}
              class="ui-workspace-sidebar__drop-target"
            >
              <WorkspaceViewHost
                {controller}
                tab={activeItem}
                hostId="root"
                paneId={pane.id}
              />
            </WorkspaceTabsDrop>
          {:else}
            <WorkspaceTabsDrop
              {controller}
              drag={dragState}
              parent={pane}
              dropZones={[]}
              class="ui-workspace-sidebar__drop-target"
            >
              <WorkspaceSidebarEmpty
                {side}
                onClose={() => controller.setSidebarOpen(side, false)}
              />
            </WorkspaceTabsDrop>
          {/if}
        </div>
      </ScrollArea>
    {:else}
      <WorkspaceSidebarEmpty
        {side}
        onClose={() => controller.setSidebarOpen(side, false)}
      />
    {/if}
    {@render footer?.()}
    {#if resizable}
      <button
        type="button"
        class="ui-workspace-sidebar__resize-rail"
        data-ui-part="sidebar-resize-rail"
        data-side={side}
        data-resizing={resizing}
        aria-label={`Resize ${side} sidebar`}
        title={`Resize ${side} sidebar`}
        onmousedown={startResize}
      ></button>
    {/if}
  </aside>
{/if}

{#if editingGroup}
  {#key editingGroup.id}
    <WorkspaceSidebarGroupEditor
      {controller}
      group={editingGroup}
      bind:open={editingGroupOpen}
    />
  {/key}
{/if}

{#if visibilityGroup}
  {#key visibilityGroup.id}
    <WorkspaceSidebarGroupVisibilityDialog
      {controller}
      group={visibilityGroup}
      bind:open={visibilityGroupOpen}
    />
  {/key}
{/if}
