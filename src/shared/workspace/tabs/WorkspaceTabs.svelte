<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Check from "@lucide/svelte/icons/check";
  import Plus from "@lucide/svelte/icons/plus";
  import Close from "@lucide/svelte/icons/x";
  import { DropdownMenu, Tabs } from "bits-ui";
  import type {
    WorkspaceSide,
    WorkspaceTab,
    WorkspaceTabItem,
    WorkspaceTabsNode,
  } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspaceTabsDrop from "../drop-overlay/WorkspaceTabsDrop.svelte";
  import WorkspaceEmpty from "../empty/WorkspaceEmpty.svelte";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceSidebarToggle from "../sidebar-toggle/WorkspaceSidebarToggle.svelte";
  import WorkspaceViewHeader from "../view-header/WorkspaceViewHeader.svelte";
  import WorkspaceViewHost from "../view-host/WorkspaceViewHost.svelte";
  import WorkspaceTabsMove from "./WorkspaceTabsMove.svelte";
  import "./WorkspaceTabs.css";

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
  let selectedItemId = $state("");
  let tabIndicatorRoot = $state<HTMLElement | null>(null);
  let overflowMenuOpen = $state(false);
  let tabIndicatorScope = $derived(`tabs-top-${pane.id}`);
  let isFocusMode = $derived(controller.isFocusModeForPane(pane.id));

  $effect(() => {
    selectedItemId = pane.activeItemId ?? pane.items[0]?.id ?? "";
  });

  function tabFor(item: WorkspaceTabItem): WorkspaceTab | undefined {
    return item.kind === "tab" ? item : item.tabs[0];
  }

  function select(item: WorkspaceTabItem) {
    const tab = tabFor(item);
    if (tab) controller.selectTab(tab.id);
  }

  function selectItem(value: string) {
    const item = pane.items.find((candidate) => candidate.id === value);
    if (item) select(item);
  }

  function addTab(event: MouseEvent) {
    event.stopPropagation();
    if (!createTab) return;
    controller.addTab(pane.id, createTab(pane.id), true);
  }

  function removeTab(event: MouseEvent, tabId: string) {
    event.preventDefault();
    event.stopPropagation();
    controller.closeTab(tabId);
  }

  function handleTabClick(event: MouseEvent, item: WorkspaceTabItem) {
    if (
      event.target instanceof Element &&
      event.target.closest('[data-ui-part="tab-close"]')
    ) {
      const tab = tabFor(item);
      if (tab && tab.closable !== false) removeTab(event, tab.id);
      return;
    }
    select(item);
  }

  function handleTabKeydown(event: KeyboardEvent, item: WorkspaceTabItem) {
    if (event.key !== "Delete") return;
    const tab = tabFor(item);
    if (!tab || tab.closable === false) return;
    event.preventDefault();
    controller.closeTab(tab.id);
  }

  function stopDoubleClick(event: MouseEvent) {
    event.stopPropagation();
  }

  function enterFocusMode(event: MouseEvent, item: WorkspaceTabItem) {
    event.stopPropagation();
    if (
      event.target instanceof Element &&
      event.target.closest('[data-ui-part="tab-close"]')
    ) {
      return;
    }
    const tab = tabFor(item);
    if (tab) controller.enterFocusMode(tab.id);
  }

  function exitFocusMode(event: MouseEvent) {
    event.stopPropagation();
    controller.exitFocusMode();
  }

  function selectedTab(): WorkspaceTab | undefined {
    const item =
      pane.items.find((candidate) => candidate.id === pane.activeItemId) ??
      pane.items[0];
    return item ? tabFor(item) : undefined;
  }

  function closeAllTabs() {
    const tabIds = pane.items.flatMap((item) =>
      item.kind === "tab" ? [item.id] : item.tabs.map((tab) => tab.id),
    );
    for (const tabId of tabIds) controller.closeTab(tabId);
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

<!-- Source shape: packages/workspace/src/lib/components/tabs/tabs-top.svelte -->
<Tabs.Root
  bind:value={selectedItemId}
  onValueChange={selectItem}
  class="workspace-tabs mod-top ui-workspace-tabs"
  data-ui-component="workspace-tabs"
  data-workspace-pane-id={pane.id}
  data-workspace-host-id={hostId}
  data-workspace-pane-presentation="top"
  data-workspace-focus-mode={isFocusMode ? "true" : undefined}
  ondragenter={(event) => event.preventDefault()}
  ondrop={(event) => dragState.dropHtml5(event)}
>
  <!-- svelte-ignore a11y_no_static_element_interactions -->
  <div
    bind:this={tabIndicatorRoot}
    class="ui-workspace-tabs__header"
    data-ui-part="header"
    data-workspace-tab-strip="top"
    ondragleave={handleTabIndicatorLeave}
  >
    <div class="ui-workspace-tabs__header-main" data-ui-part="header-main">
      {#if sidebarToggleSides.includes("left")}
        <div class="ui-workspace-tabs__left-toggle" data-ui-part="left-toggle">
          <WorkspaceSidebarToggle
            side="left"
            label="Open left sidebar"
            onSelect={() => controller.setSidebarOpen("left", true)}
          />
        </div>
      {/if}

      <Tabs.List
        class="workspace-tab-header-container-inner ui-workspace-tabs__list"
        data-ui-part="list"
        aria-label="Workspace tabs"
      >
        {#each pane.items as item, index (item.id)}
          {@const tab = tabFor(item)}
          {@const active = pane.activeItemId === item.id}
          <div
            class="workspace-tab-header ui-workspace-tab"
            data-ui-part="tab"
            data-active={active}
            data-view-type={tab?.view.type}
            data-workspace-tab-id={tab?.id}
            data-workspace-item-id={item.id}
            ondragover={(event) => {
              event.preventDefault();
              dragState.setInsertionTarget(pane.id, index, "html5");
            }}
          >
            <WorkspaceTabsMove
              {pane}
              {index}
              drag={dragState}
              indicatorRoot={tabIndicatorRoot}
              indicatorScope={tabIndicatorScope}
              class="workspace-tab-header-inner ui-workspace-tab__inner"
              data-active={active}
              activate={() => select(item)}
            >
              <div class="ui-workspace-tab__button">
                <Tabs.Trigger
                  value={item.id}
                  class="ui-workspace-tab__trigger"
                  data-hint-target="tab"
                  data-hint-group="tabs"
                  data-hint-action="click"
                  data-hint-target-id={`tab:${tab?.id ?? item.id}`}
                  data-hint-label={item.title}
                  draggable={Boolean(tab)}
                  aria-keyshortcuts={item.kind === "tab" &&
                  item.closable !== false
                    ? "Delete"
                    : undefined}
                  onpointerdown={(event) =>
                    tab && dragState.startPointer(event, tab.id)}
                  ondragstart={(event) =>
                    tab && dragState.startHtml5(event, tab.id)}
                  ondragend={(event) => tab && dragState.endHtml5(event)}
                  onclick={(event) => handleTabClick(event, item)}
                  ondblclick={(event) => enterFocusMode(event, item)}
                  onkeydown={(event) => handleTabKeydown(event, item)}
                >
                  <span
                    class="workspace-tab-header-inner-icon ui-workspace-tab__icon"
                    data-ui-part="tab-icon"
                  >
                    <WorkspaceIcon name={item.icon ?? tab?.icon ?? "file"} />
                  </span>
                  <span
                    class="ui-workspace-tab__title"
                    data-ui-part="tab-title"
                  >
                    {item.title}
                  </span>

                  {#if item.kind === "tab" && item.closable !== false}
                    <span
                      class="workspace-tab-header-inner-close-button ui-workspace-tab__close"
                      data-ui-part="tab-close"
                      data-hint-target="tab-close"
                      data-hint-group="tabs"
                      data-hint-action="click"
                      data-hint-target-id={`tab:${item.id}:close`}
                      data-hint-label={`Close ${item.title}`}
                      role="button"
                      aria-label={`Close ${item.title}`}
                      title={`Close ${item.title}`}
                    >
                      <Close aria-hidden="true" />
                    </span>
                  {/if}
                </Tabs.Trigger>
              </div>
            </WorkspaceTabsMove>
          </div>
        {/each}
      </Tabs.List>
    </div>

    <WorkspaceTabsMove
      {pane}
      index={Math.max(-1, pane.items.length - 1)}
      drag={dragState}
      indicatorRoot={tabIndicatorRoot}
      indicatorScope={tabIndicatorScope}
      class="ui-workspace-tabs__new-area"
    >
      {#if isFocusMode}
        <button
          class="ui-workspace-tabs__icon-button"
          data-ui-part="exit-focus-mode"
          type="button"
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
          class="ui-workspace-tabs__icon-button"
          data-ui-part="new-tab"
          type="button"
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
      <div class="ui-workspace-tabs__spacer" data-ui-part="spacer"></div>
    </WorkspaceTabsMove>

    <div class="ui-workspace-tabs__overflow" data-ui-part="overflow">
      <DropdownMenu.Root bind:open={overflowMenuOpen}>
        <DropdownMenu.Trigger
          class="ui-workspace-tabs__icon-button"
          data-hint-target="tabs-action"
          data-hint-group="tabs"
          data-hint-action="click"
          data-hint-target-id={`tabs:${pane.id}:overflow`}
          data-hint-label="Tab overflow menu"
          aria-label="Tab overflow menu"
          ondblclick={stopDoubleClick}
        >
          <ChevronDown aria-hidden="true" />
        </DropdownMenu.Trigger>
        <DropdownMenu.Portal>
          <DropdownMenu.Content
            class="ui-workspace-tabs__menu"
            data-ui-component="workspace-tabs-menu"
            data-ui-part="menu"
            sideOffset={4}
          >
            <DropdownMenu.Item
              class="ui-workspace-tabs__menu-item"
              onclick={() =>
                controller.setTabsPresentation(
                  pane.id,
                  pane.presentation === "top" ? "stacked" : "top",
                )}
            >
              {pane.presentation === "top" ? "Stack tabs" : "Unstack tabs"}
            </DropdownMenu.Item>
            <DropdownMenu.Item
              class="ui-workspace-tabs__menu-item"
              onclick={() => {
                const tab = selectedTab();
                if (tab) controller.floatTab(tab.id);
              }}
            >
              Float current tab
            </DropdownMenu.Item>
            {#if controller.supportsPopoutWindows()}
              <DropdownMenu.Item
                class="ui-workspace-tabs__menu-item"
                onclick={() => {
                  const tab = selectedTab();
                  if (tab) controller.popoutTab(tab.id);
                }}
              >
                Open current tab in new window
              </DropdownMenu.Item>
            {/if}
            <DropdownMenu.Separator class="ui-workspace-tabs__menu-separator" />
            <DropdownMenu.Item
              class="ui-workspace-tabs__menu-item"
              onclick={closeAllTabs}
            >
              Close all
            </DropdownMenu.Item>
            {#if pane.items.length > 1}
              <DropdownMenu.Separator
                class="ui-workspace-tabs__menu-separator"
              />
              {#each pane.items as item (item.id)}
                <DropdownMenu.CheckboxItem
                  class="ui-workspace-tabs__menu-item"
                  checked={pane.activeItemId === item.id}
                  onclick={() => select(item)}
                >
                  <span
                    class="ui-workspace-tabs__menu-check"
                    aria-hidden="true"
                  >
                    {#if pane.activeItemId === item.id}
                      <Check />
                    {/if}
                  </span>
                  {item.title}
                </DropdownMenu.CheckboxItem>
              {/each}
            {/if}
          </DropdownMenu.Content>
        </DropdownMenu.Portal>
      </DropdownMenu.Root>
    </div>

    {#if sidebarToggleSides.includes("right")}
      <div class="ui-workspace-tabs__right-toggle" data-ui-part="right-toggle">
        <WorkspaceSidebarToggle
          side="right"
          label="Open right sidebar"
          onSelect={() => controller.setSidebarOpen("right", true)}
        />
      </div>
    {/if}

    {#if dragState.tabMoveIndicator.active && dragState.tabMoveIndicator.scope === tabIndicatorScope && dragState.active}
      <div
        class="workspace-tab-drop-indicator ui-workspace-tabs__insertion-marker"
        data-workspace-tab-insertion-marker
        style={`width: ${dragState.tabMoveIndicator.width}px; height: ${dragState.tabMoveIndicator.height}px; transform: translate(${dragState.tabMoveIndicator.x}px, ${dragState.tabMoveIndicator.y}px);`}
      ></div>
    {/if}
  </div>

  <div class="ui-workspace-tabs__content" data-ui-part="content">
    {#each pane.items as item (item.id)}
      <Tabs.Content value={item.id} class="ui-workspace-tabs__panel">
        {#if item.kind === "tab"}
          {@const definition = controller.registry.resolve(item.view.type)}
          <WorkspaceTabsDrop
            {controller}
            drag={dragState}
            parent={pane}
            class="ui-workspace-tabs__drop-target"
          >
            <div
              class="ui-workspace-tabs__leaf-content"
              data-ui-part="leaf-content"
              onpointerdown={() => controller.selectTab(item.id)}
            >
              {#if controller.showTabTitleBar && item.view.type !== "empty" && definition?.showHeader !== false}
                <WorkspaceViewHeader
                  {controller}
                  tab={item}
                  {hostId}
                  paneId={pane.id}
                />
              {/if}
              <div class="ui-workspace-tabs__view-content">
                <WorkspaceViewHost
                  {controller}
                  tab={item}
                  {hostId}
                  paneId={pane.id}
                />
              </div>
            </div>
          </WorkspaceTabsDrop>
        {:else}
          <WorkspaceEmpty />
        {/if}
      </Tabs.Content>
    {/each}

    {#if pane.items.length === 0}
      <WorkspaceTabsDrop
        {controller}
        drag={dragState}
        parent={pane}
        class="ui-workspace-tabs__drop-target"
      >
        <WorkspaceEmpty />
      </WorkspaceTabsDrop>
    {/if}
  </div>
</Tabs.Root>
