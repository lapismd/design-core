<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Check from "@lucide/svelte/icons/check";
  import Maximize from "@lucide/svelte/icons/maximize";
  import Plus from "@lucide/svelte/icons/plus";
  import Close from "@lucide/svelte/icons/x";
  import { ContextMenu, DropdownMenu, Tabs } from "bits-ui";
  import type { HTMLAttributes, HTMLButtonAttributes } from "svelte/elements";
  import type {
    WorkspaceSide,
    WorkspaceNode,
    WorkspaceTab,
    WorkspaceTabItem,
    WorkspaceTabsNode,
  } from "../core/types.js";
  import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";
  import { WorkspaceDragState } from "../drag/workspace-drag.svelte.js";
  import WorkspaceTabsDrop from "../drop-overlay/WorkspaceTabsDrop.svelte";
  import WorkspaceEmpty from "../empty/WorkspaceEmpty.svelte";
  import WorkspaceIcon from "../icon/WorkspaceIcon.svelte";
  import WorkspaceContextMenuItems from "../menu/WorkspaceContextMenuItems.svelte";
  import WorkspaceMenuItems from "../menu/WorkspaceMenuItems.svelte";
  import WorkspaceBottomPanelToggle from "../bottom-panel/WorkspaceBottomPanelToggle.svelte";
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
    showBottomPanelToggle = false,
    createTab,
  }: {
    controller: WorkspaceShellController;
    pane: WorkspaceTabsNode;
    hostId?: string;
    drag?: WorkspaceDragState;
    sidebarToggleSides?: WorkspaceSide[];
    showBottomPanelToggle?: boolean;
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
  let canFocusMode = $derived(
    nodeContainsPane(controller.layout.main, pane.id),
  );

  $effect(() => {
    selectedItemId = pane.activeItemId ?? pane.items[0]?.id ?? "";
  });

  function tabFor(item: WorkspaceTabItem): WorkspaceTab | undefined {
    return item.kind === "tab" ? item : item.tabs[0];
  }

  function nodeContainsPane(node: WorkspaceNode, paneId: string): boolean {
    if (node.id === paneId) return true;
    return (
      node.kind === "split" &&
      node.children.some((child) => nodeContainsPane(child, paneId))
    );
  }

  function select(item: WorkspaceTabItem) {
    const tab = tabFor(item);
    if (!tab) return;
    selectedItemId = item.id;
    controller.selectTab(tab.id);
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

  function handleTabClick(item: WorkspaceTabItem) {
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

  function togglePaneFocusMode(event: MouseEvent) {
    event.stopPropagation();
    if (isFocusMode) {
      controller.exitFocusMode();
      return;
    }
    const tab = selectedTab();
    if (tab) controller.enterFocusMode(tab.id);
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

  function toolbarListProps(props: HTMLAttributes<HTMLDivElement>) {
    const { role: _role, "aria-orientation": _orientation, ...rest } = props;
    return rest;
  }

  function toolbarTabProps(props: HTMLButtonAttributes) {
    const { role: _role, "aria-selected": _selected, ...rest } = props;
    return rest;
  }
</script>

<!-- Source shape: packages/workspace/src/lib/components/tabs/tabs-top.svelte -->
<Tabs.Root
  bind:value={selectedItemId}
  onValueChange={selectItem}
  activationMode="manual"
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

      <Tabs.List>
        {#snippet child({ props: listProps })}
          <div
            {...toolbarListProps(listProps)}
            role="toolbar"
            aria-label="Workspace tabs"
            class="workspace-tab-header-container-inner ui-workspace-tabs__list"
            data-ui-part="list"
          >
            {#each pane.items as item, index (item.id)}
              {@const tab = tabFor(item)}
              {@const active = pane.activeItemId === item.id}
              {@const menu = tab
                ? controller.createPaneMenu(tab.id)
                : undefined}
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
                <ContextMenu.Root>
                  <WorkspaceTabsMove
                    {pane}
                    {index}
                    drag={dragState}
                    indicatorRoot={tabIndicatorRoot}
                    indicatorScope={tabIndicatorScope}
                    insertionReferenceSelector="[data-workspace-tab-title-trigger]"
                    class="workspace-tab-header-inner ui-workspace-tab__inner"
                    data-active={active}
                    activate={() => select(item)}
                  >
                    <div class="ui-workspace-tab__button">
                      {#if tab && menu}
                        <DropdownMenu.Root
                          onOpenChange={(open) => open && select(item)}
                        >
                          <DropdownMenu.Trigger
                            class="workspace-tab-header-inner-icon ui-workspace-tab__icon"
                            data-ui-part="tab-menu-trigger"
                            aria-label={`Open ${item.title} tab menu`}
                            title={`Open ${item.title} tab menu`}
                            onpointerdown={() => select(item)}
                            ondblclick={stopDoubleClick}
                          >
                            <WorkspaceIcon
                              name={item.icon ?? tab.icon ?? "file"}
                            />
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
                          <Tabs.Trigger
                            {...props}
                            value={item.id}
                            class="ui-workspace-tab__trigger"
                            data-ui-part="tab-menu-context-trigger"
                            data-workspace-tab-title-trigger
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
                            ondragend={(event) =>
                              tab && dragState.endHtml5(event)}
                            onclick={() => handleTabClick(item)}
                            ondblclick={(event) => toggleFocusMode(event, item)}
                            onkeydown={(event) => handleTabKeydown(event, item)}
                          >
                            {#snippet child({ props: triggerProps })}
                              <button
                                {...toolbarTabProps(triggerProps)}
                                aria-pressed={active}
                                class="ui-workspace-tab__trigger"
                                data-ui-part="tab-menu-context-trigger"
                                data-workspace-tab-title-trigger
                              >
                                <span
                                  class="ui-workspace-tab__title"
                                  data-ui-part="tab-title"
                                >
                                  {item.title}
                                </span>
                              </button>
                            {/snippet}
                          </Tabs.Trigger>
                        {/snippet}
                      </ContextMenu.Trigger>

                      {#if item.kind === "tab" && item.closable !== false}
                        <button
                          type="button"
                          class="workspace-tab-header-inner-close-button ui-workspace-tab__close"
                          data-ui-part="tab-close"
                          data-hint-target="tab-close"
                          data-hint-group="tabs"
                          data-hint-action="click"
                          data-hint-target-id={`tab:${item.id}:close`}
                          data-hint-label={`Close ${item.title}`}
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
              </div>
            {/each}
          </div>
        {/snippet}
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
      {#if canFocusMode}
        <button
          class="ui-workspace-tabs__icon-button ui-workspace-tabs__focus-toggle"
          data-ui-part="focus-mode-toggle"
          type="button"
          aria-label={isFocusMode ? "Restore tab group" : "Maximize tab group"}
          aria-pressed={isFocusMode}
          title={isFocusMode ? "Restore tab group" : "Maximize tab group"}
          data-hint-target="focus-mode-toggle"
          data-hint-group="tabs"
          data-hint-action="click"
          data-hint-target-id={`tabs:${pane.id}:focus-mode-toggle`}
          data-hint-label={isFocusMode
            ? "Restore tab group"
            : "Maximize tab group"}
          onclick={togglePaneFocusMode}
          ondblclick={stopDoubleClick}
        >
          <Maximize aria-hidden="true" />
        </button>
      {/if}
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
        {#if showBottomPanelToggle}
          <WorkspaceBottomPanelToggle
            size="small"
            expanded={controller.layout.bottom.open}
            onSelect={() =>
              controller.setDockOpen("bottom", !controller.layout.bottom.open)}
          />
        {/if}
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
