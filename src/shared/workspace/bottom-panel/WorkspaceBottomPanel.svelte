<script lang="ts">
  import Plus from "@lucide/svelte/icons/plus";
  import { ContextMenu } from "bits-ui";
  import type {
    WorkspaceBottomPanelState,
    WorkspaceTab,
    WorkspaceTabItem,
  } from "../core/types.js";
  import { WorkspaceMenu } from "../core/workspace-menu.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspaceTabsDrop from "../drop-overlay/WorkspaceTabsDrop.svelte";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceContextMenuItems from "../menu/WorkspaceContextMenuItems.svelte";
  import WorkspaceSidebarGroupEditor from "../sidebar-group/WorkspaceSidebarGroupEditor.svelte";
  import WorkspaceSidebarGroupVisibilityDialog from "../sidebar-group/WorkspaceSidebarGroupVisibilityDialog.svelte";
  import WorkspaceTabsMove from "../tabs/WorkspaceTabsMove.svelte";
  import WorkspaceViewHost from "../view-host/WorkspaceViewHost.svelte";
  import WorkspaceBottomPanelToggle from "./WorkspaceBottomPanelToggle.svelte";
  import WorkspaceBottomPanelGroup from "./WorkspaceBottomPanelGroup.svelte";
  import "./WorkspaceBottomPanel.css";

  let {
    controller,
    state: suppliedState,
    drag,
    createTab,
  }: {
    controller: WorkspaceShellController;
    state?: WorkspaceBottomPanelState;
    drag?: WorkspaceDragState;
    createTab?: (paneId: string) => WorkspaceTab;
  } = $props();

  const createInternalDrag = () => new WorkspaceDragState(controller);
  const internalDrag = createInternalDrag();
  let dragState = $derived(drag ?? internalDrag);
  let panel = $derived(suppliedState ?? controller.layout.bottom);
  let pane = $derived(panel.root);
  let activeItem = $derived(
    pane.items.find((item) => item.id === pane.activeItemId) ?? pane.items[0],
  );
  let resizing = $state(false);
  let resizeStartY = 0;
  let resizeStartHeight = 0;
  let tabIndicatorRoot = $state<HTMLElement | null>(null);
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

  function tabFor(item: WorkspaceTabItem): WorkspaceTab | undefined {
    return item.kind === "tab" ? item : item.tabs[0];
  }

  function select(item: WorkspaceTabItem) {
    const tab = tabFor(item);
    if (tab) controller.selectTab(tab.id);
  }

  function createItemMenu(item: WorkspaceTabItem): WorkspaceMenu {
    const tab = tabFor(item);
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
              .setTitle("Ungroup into panel tabs")
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

  function addTab() {
    if (!createTab) return;
    controller.addTab(pane.id, createTab(pane.id), true);
  }

  function closePanel() {
    controller.setDockOpen("bottom", false);
  }

  function startResize(event: MouseEvent) {
    resizing = true;
    resizeStartY = event.clientY;
    resizeStartHeight = panel.size;
    event.preventDefault();
    const resize = (moveEvent: MouseEvent) => {
      controller.setDockSize(
        "bottom",
        resizeStartHeight - (moveEvent.clientY - resizeStartY),
      );
    };
    const stop = () => {
      resizing = false;
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stop);
    };
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stop);
  }

  function resizeWithKeyboard(event: KeyboardEvent) {
    const step = event.shiftKey ? 50 : 10;
    const next =
      event.key === "ArrowUp"
        ? panel.size + step
        : event.key === "ArrowDown"
          ? panel.size - step
          : event.key === "Home"
            ? 120
            : event.key === "End"
              ? 640
              : null;
    if (next === null) return;
    event.preventDefault();
    controller.setDockSize("bottom", next);
  }

  function moveTabFocus(event: KeyboardEvent, index: number) {
    const targetIndex =
      event.key === "ArrowLeft"
        ? Math.max(0, index - 1)
        : event.key === "ArrowRight"
          ? Math.min(pane.items.length - 1, index + 1)
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? pane.items.length - 1
              : null;
    if (targetIndex === null || targetIndex === index) return;
    event.preventDefault();
    const item = pane.items[targetIndex];
    if (!item) return;
    select(item);
    tabIndicatorRoot
      ?.querySelectorAll<HTMLElement>('[role="tab"]')
      .item(targetIndex)
      .focus();
  }
</script>

{#if panel.open}
  <aside
    class="ui-workspace-bottom-panel"
    data-ui-component="workspace-bottom-panel"
    data-ui-part="root"
    data-resizing={resizing}
    style={`--ui-workspace-bottom-panel-height: ${panel.size}px`}
    aria-label="Bottom panel"
  >
    <button
      type="button"
      class="ui-workspace-bottom-panel__resize-rail"
      data-ui-part="resize-rail"
      aria-label="Resize bottom panel"
      title="Resize bottom panel"
      onmousedown={startResize}
      onkeydown={resizeWithKeyboard}
    ></button>

    <header
      bind:this={tabIndicatorRoot}
      class="ui-workspace-bottom-panel__header"
      data-ui-part="header"
      data-workspace-tab-strip="bottom-panel"
    >
      <div
        class="ui-workspace-bottom-panel__tabs"
        role="tablist"
        aria-label="Bottom panel tabs"
      >
        {#each pane.items as item, index (item.id)}
          {@const tab = tabFor(item)}
          {@const menu = createItemMenu(item)}
          <WorkspaceTabsMove
            {pane}
            {index}
            drag={dragState}
            indicatorRoot={tabIndicatorRoot}
            indicatorScope={`bottom-panel-${pane.id}`}
            activate={() => select(item)}
            class="ui-workspace-bottom-panel__tab-move"
            data-ui-part="tab-move-target"
          >
            <ContextMenu.Root>
              <ContextMenu.Trigger>
                {#snippet child({ props })}
                  <button
                    {...props}
                    type="button"
                    role="tab"
                    class="ui-workspace-bottom-panel__tab"
                    data-ui-part="tab"
                    data-state={pane.activeItemId === item.id ? "on" : "off"}
                    data-workspace-item-id={item.id}
                    data-workspace-tab-id={tab?.id}
                    aria-selected={pane.activeItemId === item.id}
                    aria-controls="workspace-bottom-panel-content"
                    draggable={Boolean(tab)}
                    onpointerdown={(event) =>
                      tab && dragState.startPointer(event, tab.id)}
                    ondragstart={(event) =>
                      tab && dragState.startHtml5(event, tab.id)}
                    ondragend={(event) => tab && dragState.endHtml5(event)}
                    onclick={() => select(item)}
                    onkeydown={(event) => moveTabFocus(event, index)}
                  >
                    <WorkspaceIcon
                      name={item.icon ?? tab?.icon ?? "terminal"}
                    />
                    <span>{item.title}</span>
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

      <div class="ui-workspace-bottom-panel__actions" data-ui-part="actions">
        {#if createTab}
          <button
            type="button"
            class="ui-workspace-bottom-panel__action"
            aria-label="New panel tab"
            title="New panel tab"
            onclick={addTab}
          >
            <Plus aria-hidden="true" />
          </button>
        {/if}
        <WorkspaceBottomPanelToggle expanded onSelect={closePanel} />
      </div>

      {#if dragState.tabMoveIndicator.active && dragState.tabMoveIndicator.scope === `bottom-panel-${pane.id}` && dragState.active}
        <div
          class="ui-workspace-bottom-panel__insertion-marker"
          data-workspace-tab-insertion-marker
          style={`width: ${dragState.tabMoveIndicator.width}px; height: ${dragState.tabMoveIndicator.height}px; transform: translate(${dragState.tabMoveIndicator.x}px, ${dragState.tabMoveIndicator.y}px);`}
        ></div>
      {/if}
    </header>

    <div
      class="ui-workspace-bottom-panel__content"
      data-ui-part="content"
      id="workspace-bottom-panel-content"
      role="tabpanel"
    >
      {#if activeItem?.kind === "sidebar-group"}
        <WorkspaceBottomPanelGroup
          {controller}
          group={activeItem}
          {pane}
          drag={dragState}
        />
      {:else if activeItem?.kind === "tab"}
        <WorkspaceTabsDrop
          {controller}
          drag={dragState}
          parent={pane}
          dropZones={[]}
          class="ui-workspace-bottom-panel__drop-target"
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
          class="ui-workspace-bottom-panel__drop-target"
        >
          <div class="ui-workspace-bottom-panel__empty">
            <WorkspaceIcon name="terminal" />
            <div>
              <strong>Bottom panel is empty</strong>
              <span>Drag a tab here or open a panel view.</span>
            </div>
          </div>
        </WorkspaceTabsDrop>
      {/if}
    </div>
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
