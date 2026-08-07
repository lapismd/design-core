<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Plus from "@lucide/svelte/icons/plus";
  import Close from "@lucide/svelte/icons/x";
  import { ContextMenu, DropdownMenu } from "bits-ui";
  import { onMount } from "svelte";
  import type {
    WorkspaceSide,
    WorkspaceTab,
    WorkspaceTabItem,
    WorkspaceTabsNode,
  } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspaceTabsDrop from "../drop-overlay/WorkspaceTabsDrop.svelte";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceContextMenuItems from "../menu/WorkspaceContextMenuItems.svelte";
  import WorkspaceMenuItems from "../menu/WorkspaceMenuItems.svelte";
  import WorkspaceSidebarToggle from "../sidebar-toggle/WorkspaceSidebarToggle.svelte";
  import WorkspaceTabsMove from "../tabs/WorkspaceTabsMove.svelte";
  import WorkspaceViewHeader from "../view-header/WorkspaceViewHeader.svelte";
  import WorkspaceViewHost from "../view-host/WorkspaceViewHost.svelte";
  import "./WorkspaceStackedTabs.css";

  let {
    controller,
    pane,
    hostId = "root",
    drag,
    sidebarToggleSides = [],
    createTab,
  }: {
    controller: WorkspaceShellController;
    pane: WorkspaceTabsNode;
    hostId?: string;
    drag?: WorkspaceDragState;
    sidebarToggleSides?: WorkspaceSide[];
    createTab?: (paneId: string) => WorkspaceTab;
  } = $props();

  const createInternalDrag = () => new WorkspaceDragState(controller);
  const internalDrag = createInternalDrag();
  let dragState = $derived(drag ?? internalDrag);
  let container = $state<HTMLElement | null>(null);
  let containerWidth = $state(700);
  let itemCount = $derived(Math.max(1, pane.items.length));
  let maximumPaneWidth = $derived(Math.max(0, containerWidth - itemCount * 40));
  let minimumPaneWidth = $derived(maximumPaneWidth / itemCount);
  let isFocusMode = $derived(controller.isFocusModeForPane(pane.id));
  let tabIndicatorScope = $derived(`tabs-stacked-${pane.id}`);

  function tabFor(item: WorkspaceTabItem): WorkspaceTab | undefined {
    return item.kind === "tab" ? item : item.tabs[0];
  }

  function select(item: WorkspaceTabItem, index: number) {
    const tab = tabFor(item);
    if (tab) controller.selectTab(tab.id);
    if (!container) return;
    if (index === 0) container.scrollLeft = 0;
    else if (index === pane.items.length - 1) {
      container.scrollLeft = container.scrollWidth - container.clientWidth;
    } else {
      container.scrollLeft = index * maximumPaneWidth + (index - 1) * 40;
    }
  }

  function handleTabClick(item: WorkspaceTabItem, index: number) {
    select(item, index);
  }

  function handleTabKeydown(event: KeyboardEvent, item: WorkspaceTabItem) {
    if (event.key === "Delete") {
      const tab = tabFor(item);
      if (tab && tab.closable !== false) {
        event.preventDefault();
        controller.closeTab(tab.id);
      }
      return;
    }
  }

  function removeTab(event: MouseEvent, tabId: string) {
    event.preventDefault();
    event.stopPropagation();
    controller.closeTab(tabId);
  }

  function addTab(event: MouseEvent) {
    event.stopPropagation();
    if (createTab) controller.addTab(pane.id, createTab(pane.id), true);
  }

  function stopDoubleClick(event: MouseEvent) {
    event.stopPropagation();
  }

  function toggleFocusMode(event: MouseEvent, item: WorkspaceTabItem) {
    event.stopPropagation();
    if (controller.isFocusModeForPane(pane.id)) {
      controller.exitFocusMode();
      return;
    }
    const tab = tabFor(item);
    if (!tab) return;
    controller.selectTab(tab.id);
    controller.enterFocusMode(tab.id);
  }

  function exitFocusMode(event: MouseEvent) {
    event.stopPropagation();
    controller.exitFocusMode();
  }

  function handleTabIndicatorLeave(event: DragEvent) {
    if (
      container &&
      event.relatedTarget instanceof Node &&
      container.contains(event.relatedTarget)
    ) {
      return;
    }
    dragState.clearTabMoveIndicator(tabIndicatorScope);
  }

  onMount(() => {
    if (!container) return;
    const observer = new ResizeObserver(([entry]) => {
      if (entry) containerWidth = entry.contentRect.width;
    });
    observer.observe(container);
    containerWidth = container.getBoundingClientRect().width;
    return () => observer.disconnect();
  });
</script>

<!-- Source shape: packages/workspace/src/lib/components/tabs/tabs-stacked.svelte -->
<section
  class="ui-workspace-stacked-tabs"
  data-ui-component="workspace-stacked-tabs"
  data-workspace-pane-id={pane.id}
  data-workspace-host-id={hostId}
  data-workspace-pane-presentation="stacked"
  data-workspace-focus-mode={isFocusMode ? "true" : undefined}
  aria-label={`Workspace pane ${pane.id}`}
  ondragenter={(event) => event.preventDefault()}
  ondragover={(event) => dragState.moveHtml5(event)}
  ondrop={(event) => dragState.dropHtml5(event)}
>
  <header class="ui-workspace-stacked-tabs__chrome" data-ui-part="chrome">
    {#if sidebarToggleSides.includes("left")}
      <WorkspaceSidebarToggle
        side="left"
        label="Open left sidebar"
        onSelect={() => controller.setSidebarOpen("left", true)}
      />
    {/if}

    <div class="ui-workspace-stacked-tabs__chrome-main">
      {#if isFocusMode}
        <button
          type="button"
          class="ui-workspace-stacked-tabs__chrome-button"
          data-ui-part="exit-focus-mode"
          aria-label="Exit focus mode"
          title="Exit focus mode"
          data-hint-target="focus-mode-exit"
          data-hint-group="tabs"
          data-hint-action="click"
          data-hint-target-id={`tabs:${pane.id}:exit-focus-mode`}
          data-hint-label="Exit focus mode"
          onclick={exitFocusMode}
          ondblclick={stopDoubleClick}
        >
          <Close aria-hidden="true" />
        </button>
      {/if}
      {#if createTab}
        <button
          type="button"
          class="ui-workspace-stacked-tabs__chrome-button"
          aria-label="New tab"
          data-hint-target="tab-add"
          data-hint-group="tabs"
          data-hint-action="click"
          data-hint-target-id={`tabs:${pane.id}:add`}
          data-hint-label="Add tab"
          onclick={addTab}
          ondblclick={stopDoubleClick}
        >
          <Plus aria-hidden="true" />
        </button>
      {/if}
    </div>

    <div class="ui-workspace-stacked-tabs__chrome-actions">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger
          class="ui-workspace-stacked-tabs__chrome-button"
          aria-label="Tab options"
          data-hint-target="tabs-action"
          data-hint-group="tabs"
          data-hint-action="click"
          data-hint-target-id={`tabs:${pane.id}:overflow`}
          data-hint-label="Tab overflow menu"
          ondblclick={stopDoubleClick}
        >
          <ChevronDown aria-hidden="true" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            align="end"
            sideOffset={4}
            class="ui-workspace-stacked-tabs__menu"
          >
            <DropdownMenu.Item
              class="ui-workspace-stacked-tabs__menu-item"
              onclick={() => controller.setTabsPresentation(pane.id, "top")}
            >
              Unstack tabs
            </DropdownMenu.Item>
            <DropdownMenu.Separator
              class="ui-workspace-stacked-tabs__menu-separator"
            />
            {#each pane.items as item, index (item.id)}
              <DropdownMenu.Item
                class="ui-workspace-stacked-tabs__menu-item"
                onclick={() => select(item, index)}
              >
                <WorkspaceIcon
                  name={item.icon ?? tabFor(item)?.icon ?? "file"}
                />
                {item.title}
              </DropdownMenu.Item>
            {/each}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>

    {#if sidebarToggleSides.includes("right")}
      <WorkspaceSidebarToggle
        side="right"
        label="Open right sidebar"
        onSelect={() => controller.setSidebarOpen("right", true)}
      />
    {/if}
  </header>

  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={container}
    class="ui-workspace-stacked-tabs__container"
    data-ui-part="container"
    data-workspace-tab-strip="stacked"
    ondragleave={handleTabIndicatorLeave}
  >
    {#each pane.items as item, index (item.id)}
      {@const tab = tabFor(item)}
      {@const definition = tab
        ? controller.registry.resolve(tab.view.type)
        : undefined}
      {@const active = pane.activeItemId === item.id}
      {@const menu = tab ? controller.createPaneMenu(tab.id) : undefined}
      <ContextMenu.Root>
        <div
          class="ui-workspace-stacked-tabs__tab-header"
          class:ui-workspace-stacked-tabs__tab-header--active={active}
          data-ui-part="stacked-tab-header"
          data-active={active}
          data-workspace-tab-id={tab?.id}
          style={`left: calc(2.5rem * ${index}); right: calc(2.5rem * ${pane.items.length - 1 - index});`}
        >
          <WorkspaceTabsMove
            {pane}
            {index}
            drag={dragState}
            indicatorRoot={container}
            indicatorScope={tabIndicatorScope}
            activate={() => select(item, index)}
            class="ui-workspace-stacked-tabs__tab-move"
            data-ui-part="stacked-tab-move-target"
          >
            <div class="ui-workspace-stacked-tabs__tab-inner">
              {#if tab && menu}
                <DropdownMenu.Root
                  onOpenChange={(open) => open && select(item, index)}
                >
                  <DropdownMenu.Trigger
                    class="ui-workspace-stacked-tabs__tab-icon"
                    data-ui-part="stacked-tab-menu-trigger"
                    aria-label={`Open ${item.title} tab menu`}
                    title={`Open ${item.title} tab menu`}
                    onpointerdown={() => select(item, index)}
                    ondblclick={stopDoubleClick}
                  >
                    <WorkspaceIcon name={item.icon ?? tab.icon ?? "file"} />
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Portal>
                    <DropdownMenu.Content
                      class="ui-workspace-menu__content"
                      data-ui-component="workspace-menu"
                      data-ui-part="content"
                      sideOffset={4}
                    >
                      <WorkspaceMenuItems {menu} />
                    </DropdownMenu.Content>
                  </DropdownMenu.Portal>
                </DropdownMenu.Root>
              {/if}
              <ContextMenu.Trigger>
                {#snippet child({ props })}
                  <button
                    {...props}
                    type="button"
                    class="ui-workspace-stacked-tabs__tab-trigger"
                    data-ui-part="stacked-tab-menu-context-trigger"
                    data-workspace-stacked-tab-title-trigger
                    aria-pressed={active}
                    aria-keyshortcuts={item.kind === "tab" &&
                    item.closable !== false
                      ? "Delete"
                      : undefined}
                    data-hint-target="tab"
                    data-hint-group="tabs"
                    data-hint-action="click"
                    data-hint-target-id={`tab:${tab?.id ?? item.id}`}
                    data-hint-label={item.title}
                    draggable={Boolean(tab)}
                    onpointerdown={(event) =>
                      tab && dragState.startPointer(event, tab.id)}
                    ondragstart={(event) =>
                      tab && dragState.startHtml5(event, tab.id)}
                    ondragend={(event) => tab && dragState.endHtml5(event)}
                    onclick={() => handleTabClick(item, index)}
                    ondblclick={(event) => toggleFocusMode(event, item)}
                    onkeydown={(event) => handleTabKeydown(event, item)}
                  >
                    <span class="ui-workspace-stacked-tabs__tab-title">
                      {item.title}
                    </span>
                  </button>
                {/snippet}
              </ContextMenu.Trigger>
              {#if item.kind === "tab" && item.closable !== false}
                <button
                  type="button"
                  class="ui-workspace-stacked-tabs__tab-close"
                  data-ui-part="stacked-tab-close"
                  aria-label={`Close ${item.title}`}
                  title={`Close ${item.title}`}
                  onclick={(event) => removeTab(event, item.id)}
                  ondblclick={stopDoubleClick}
                >
                  <Close aria-hidden="true" />
                </button>
              {/if}
            </div>
          </WorkspaceTabsMove>
        </div>
        {#if menu}
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
        {/if}
      </ContextMenu.Root>

      <div
        class="ui-workspace-stacked-tabs__tab-content"
        data-ui-part="stacked-tab-content"
        data-active={active}
        style={pane.items.length <= 1
          ? "width: calc(100% - 2.5rem);"
          : `left: calc(2.5rem * ${index + 1}); min-width: ${minimumPaneWidth}px; max-width: ${maximumPaneWidth}px;`}
      >
        {#if tab}
          <WorkspaceTabsDrop
            {controller}
            drag={dragState}
            parent={pane}
            class="ui-workspace-stacked-tabs__drop-target"
          >
            <div class="ui-workspace-stacked-tabs__leaf-content">
              {#if controller.showTabTitleBar && tab.view.type !== "empty" && definition?.showHeader !== false}
                <WorkspaceViewHeader
                  {controller}
                  {tab}
                  {hostId}
                  paneId={pane.id}
                />
              {/if}
              <div class="ui-workspace-stacked-tabs__view-content">
                <WorkspaceViewHost
                  {controller}
                  {tab}
                  {hostId}
                  paneId={pane.id}
                />
              </div>
            </div>
          </WorkspaceTabsDrop>
        {/if}
      </div>
    {/each}

    {#if dragState.tabMoveIndicator.active && dragState.tabMoveIndicator.scope === tabIndicatorScope && dragState.active}
      <div
        class="workspace-tab-drop-indicator ui-workspace-stacked-tabs__insertion-marker"
        data-workspace-tab-insertion-marker
        style={`width: ${dragState.tabMoveIndicator.width}px; height: ${dragState.tabMoveIndicator.height}px; transform: translate(${dragState.tabMoveIndicator.x}px, ${dragState.tabMoveIndicator.y}px);`}
      ></div>
    {/if}
  </div>
</section>
