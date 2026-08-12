import {
  cloneWorkspaceLayout,
  createDefaultWorkspaceLayout,
  createWorkspaceId,
  createWorkspaceSplit,
  createWorkspaceTabs,
  findWorkspacePane,
  findWorkspaceTab,
  firstWorkspaceTab,
  normalizeWorkspaceLayout,
  normalizeWorkspaceTree,
  replaceWorkspaceNode,
} from "./layout.js";
import {
  createCancelableEvent,
  WorkspaceEventDispatcher,
  type WorkspaceEventRef,
} from "./event-dispatcher.js";
import { createWorkspaceViewRegistry } from "./view-registry.js";
import { WorkspaceMenu } from "./workspace-menu.js";
import type {
  WorkspaceControllerOptions,
  WorkspaceDisplayMode,
  WorkspaceDockPosition,
  WorkspaceDropPosition,
  WorkspaceEventMap,
  WorkspaceFocusModeState,
  WorkspaceLayoutChangeEvent,
  WorkspaceLayoutDropEvent,
  WorkspaceLayout,
  WorkspaceIconName,
  WorkspaceNode,
  WorkspacePopoutHandle,
  WorkspacePopoutHost,
  WorkspaceRibbonItem,
  WorkspaceAction,
  WorkspaceSidebarGroup,
  WorkspaceSide,
  WorkspaceStatusItem,
  WorkspaceTab,
  WorkspaceTabsNode,
  WorkspaceViewRegistry,
  WorkspaceWindow,
  WorkspaceWindowBounds,
  WorkspaceWindowMode,
  WorkspaceWindowState,
} from "./types.js";

function walkWorkspaceTabs(
  node: WorkspaceNode,
  visitor: (pane: WorkspaceTabsNode) => void,
): void {
  if (node.kind === "tabs") {
    visitor(node);
    return;
  }
  for (const child of node.children) walkWorkspaceTabs(child, visitor);
}

function workspaceNodeContains(node: WorkspaceNode, nodeId: string): boolean {
  if (node.id === nodeId) return true;
  return (
    node.kind === "split" &&
    node.children.some((child) => workspaceNodeContains(child, nodeId))
  );
}

function pruneEmptyWorkspacePane(
  root: WorkspaceNode,
  paneId: string,
): WorkspaceNode {
  const prune = (
    node: WorkspaceNode,
    preserveRoot: boolean,
  ): WorkspaceNode | null => {
    if (node.kind === "tabs") {
      if (!preserveRoot && node.id === paneId && node.items.length === 0) {
        return null;
      }
      return node;
    }

    const children = node.children
      .map((child) => prune(child, false))
      .filter((child): child is WorkspaceNode => child !== null);
    if (children.length === 0) {
      return preserveRoot
        ? createWorkspaceTabs([], { id: node.id, presentation: "top" })
        : null;
    }
    if (children.length === 1) return children[0]!;
    return normalizeWorkspaceTree({ ...node, children });
  };

  return (
    prune(root, true) ??
    createWorkspaceTabs([], { id: root.id, presentation: "top" })
  );
}

export class WorkspaceItemRegistry<
  T extends { id: string; priority?: number },
> {
  items = $state<T[]>([]);

  addItem(item: T): () => void {
    this.removeItem(item.id);
    this.items.push(item);
    this.items.sort((a, b) => (a.priority ?? 0) - (b.priority ?? 0));
    return () => this.removeItem(item.id);
  }

  removeItem(id: string): void {
    const index = this.items.findIndex((item) => item.id === id);
    if (index >= 0) this.items.splice(index, 1);
  }

  clear(): void {
    this.items.splice(0);
  }
}

export class WorkspaceShellController {
  layout = $state<WorkspaceLayout>(createDefaultWorkspaceLayout());
  displayMode = $state<WorkspaceDisplayMode>("desktop");
  focusMode = $state<WorkspaceFocusModeState | null>(null);
  // Match appearance-setting defaults until AppShell syncs configuration.
  showTabTitleBar = $state(false);
  showInlineTitle = $state(false);
  layoutReady = $state(false);
  readonly registry: WorkspaceViewRegistry;
  readonly statusBar = new WorkspaceItemRegistry<WorkspaceStatusItem>();
  readonly ribbon = new WorkspaceItemRegistry<WorkspaceRibbonItem>();
  readonly emptyViewActions = new WorkspaceItemRegistry<WorkspaceAction>();

  readonly #events = new WorkspaceEventDispatcher<WorkspaceEventMap>();
  readonly #persistence;
  readonly #saveDebounceMs: number;
  #saveTimer: ReturnType<typeof setTimeout> | null = null;
  #pendingSaveEvent: WorkspaceLayoutChangeEvent | null = null;
  #saveChain: Promise<void> = Promise.resolve();
  #hydrating = false;
  #popoutHost: WorkspacePopoutHost | null = null;
  readonly #popoutHandles = new Map<string, WorkspacePopoutHandle>();

  constructor(options: WorkspaceControllerOptions = {}) {
    this.registry = options.registry ?? createWorkspaceViewRegistry();
    this.#persistence = options.persistence;
    this.#saveDebounceMs = Math.max(0, options.saveDebounceMs ?? 1000);
    this.layout = normalizeWorkspaceLayout(
      options.layout ?? createDefaultWorkspaceLayout(),
    );
    if (!this.#persistence) {
      this.layoutReady = true;
      queueMicrotask(() => this.#events.trigger("layout-ready"));
    }
  }

  get activeHostId(): string {
    return this.layout.active.hostId;
  }

  get activePaneId(): string | null {
    return this.layout.active.paneId;
  }

  get activeTabId(): string | null {
    return this.layout.active.tabId;
  }

  get activeTab(): WorkspaceTab | null {
    return this.activeTabId
      ? (findWorkspaceTab(this.layout, this.activeTabId)?.tab ?? null)
      : null;
  }

  get activeWindow(): WorkspaceWindow | null {
    if (this.layout.active.hostId === "root") return null;
    return (
      this.layout.windows.find(
        (workspaceWindow) => workspaceWindow.id === this.layout.active.hostId,
      ) ?? null
    );
  }

  on<Name extends keyof WorkspaceEventMap>(
    name: Name,
    listener: (...args: WorkspaceEventMap[Name]) => void,
  ): WorkspaceEventRef<WorkspaceEventMap, Name> {
    return this.#events.on(name, listener);
  }

  once<Name extends keyof WorkspaceEventMap>(
    name: Name,
    listener: (...args: WorkspaceEventMap[Name]) => void,
  ): WorkspaceEventRef<WorkspaceEventMap, Name> {
    return this.#events.once(name, listener);
  }

  off<Name extends keyof WorkspaceEventMap>(
    name: Name,
    listener: (...args: WorkspaceEventMap[Name]) => void,
  ): void {
    this.#events.off(name, listener);
  }

  offref<Name extends keyof WorkspaceEventMap>(
    ref: WorkspaceEventRef<WorkspaceEventMap, Name>,
  ): void {
    this.#events.offref(ref);
  }

  onChange(
    listener: (
      layout: WorkspaceLayout,
      event: WorkspaceLayoutChangeEvent,
    ) => void,
  ): () => void {
    const ref = this.on("layout-change", (event) =>
      listener(this.getLayout(), event),
    );
    return () => this.offref(ref);
  }

  onLayoutReady(listener: () => void): () => void {
    const ref = this.on("layout-ready", listener);
    if (this.layoutReady) queueMicrotask(listener);
    return () => this.offref(ref);
  }

  getLayout(): WorkspaceLayout {
    return cloneWorkspaceLayout(this.layout);
  }

  toJSON(): WorkspaceLayout {
    return this.getLayout();
  }

  changeLayout(
    value: unknown,
    event: WorkspaceLayoutChangeEvent = { source: "layout-replace" },
  ): void {
    this.exitFocusMode();
    this.layout = normalizeWorkspaceLayout(value, this.layout);
    this.#events.trigger("active-tab-change", this.activeTab);
    this.#commit(event);
  }

  async restoreLayout(): Promise<void> {
    if (this.layoutReady) return;
    this.exitFocusMode();
    this.#hydrating = true;
    try {
      const value = await this.#persistence?.load();
      if (value !== null && value !== undefined) {
        this.layout = normalizeWorkspaceLayout(value, this.layout);
      }
      if (this.#persistence) {
        this.#events.trigger("persistence-success", { operation: "load" });
      }
    } catch (error) {
      this.#events.trigger("persistence-error", { operation: "load", error });
    } finally {
      this.#hydrating = false;
      this.layoutReady = true;
      this.#events.trigger("active-tab-change", this.activeTab);
      this.#events.trigger("layout-ready");
    }
  }

  requestSaveLayout(event: WorkspaceLayoutChangeEvent): void {
    if (!this.#persistence || this.#hydrating) return;
    this.#pendingSaveEvent = event;
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    this.#saveTimer = setTimeout(() => {
      this.#saveTimer = null;
      void this.flushSave();
    }, this.#saveDebounceMs);
  }

  async flushSave(): Promise<void> {
    if (this.#saveTimer) {
      clearTimeout(this.#saveTimer);
      this.#saveTimer = null;
    }
    const event = this.#pendingSaveEvent;
    this.#pendingSaveEvent = null;
    if (!event || !this.#persistence) return this.#saveChain;
    const snapshot = this.getLayout();
    this.#saveChain = this.#saveChain.then(async () => {
      try {
        await this.#persistence?.save(snapshot, event);
        this.#events.trigger("persistence-success", { operation: "save" });
      } catch (error) {
        this.#events.trigger("persistence-error", { operation: "save", error });
      }
    });
    return this.#saveChain;
  }

  setDisplayMode(mode: WorkspaceDisplayMode): void {
    if (mode === this.displayMode) return;
    this.displayMode = mode;
    this.#events.trigger("display-mode-change", mode);
    this.#commit({ source: "display-mode" });
  }

  selectTab(tabId: string): boolean {
    const location = findWorkspaceTab(this.layout, tabId);
    if (!location) return false;
    // Leaf content pointerdown calls selectTab on every editor click. Skip the
    // layout-change commit when the tab is already active so CodeMirror fold
    // (and other in-view) interactions are not reset by layout projection.
    const alreadyActive =
      this.layout.active?.tabId === tabId &&
      this.layout.active?.paneId === location.pane.id &&
      this.layout.active?.hostId === location.hostId &&
      location.pane.activeItemId === location.item.id;
    if (alreadyActive) return true;
    if (!this.#activateTab(tabId)) return false;
    this.#commit({ source: "tab-select", id: tabId });
    return true;
  }

  enterFocusMode(tabId: string | null = this.activeTabId): boolean {
    if (!tabId) return false;
    const location = findWorkspaceTab(this.layout, tabId);
    if (
      !location ||
      !workspaceNodeContains(this.layout.main, location.pane.id)
    ) {
      return false;
    }
    if (
      this.focusMode?.tabId === tabId &&
      this.focusMode.paneId === location.pane.id
    ) {
      return false;
    }
    if (this.activeTabId !== tabId) this.#activateTab(tabId);
    const state = { tabId, paneId: location.pane.id };
    this.focusMode = state;
    this.#events.trigger("focus-mode-change", state);
    return true;
  }

  exitFocusMode(): boolean {
    if (!this.focusMode) return false;
    this.focusMode = null;
    this.#events.trigger("focus-mode-change", null);
    return true;
  }

  clearFocusModeForTab(tabId: string): boolean {
    return this.focusMode?.tabId === tabId ? this.exitFocusMode() : false;
  }

  isFocusModeForPane(paneId: string): boolean {
    return this.focusMode?.paneId === paneId;
  }

  addTab(paneId: string, tab: WorkspaceTab, activate = true): boolean {
    const pane = findWorkspacePane(this.layout, paneId);
    if (!pane || findWorkspaceTab(this.layout, tab.id)) return false;
    pane.items.push(tab);
    if (activate) this.#activateTab(tab.id);
    this.#commit({ source: "tab-add", id: tab.id });
    return true;
  }

  closeTab(tabId: string): boolean {
    const location = findWorkspaceTab(this.layout, tabId);
    if (!location || location.tab.closable === false) return false;
    this.clearFocusModeForTab(tabId);
    const sourcePaneId = location.pane.id;
    const sourceHostId = location.hostId;
    if (location.group) {
      const index = location.group.tabs.findIndex((tab) => tab.id === tabId);
      location.group.tabs.splice(index, 1);
      location.group.hiddenTabIds = location.group.hiddenTabIds.filter(
        (id) => id !== tabId,
      );
      delete location.group.collapsedByTabId[tabId];
      delete location.group.panelSizesByTabId[tabId];
      if (location.group.tabs.length === 0) {
        const groupIndex = location.pane.items.findIndex(
          (item) => item.id === location.group?.id,
        );
        if (groupIndex >= 0) location.pane.items.splice(groupIndex, 1);
      }
    } else {
      const index = location.pane.items.findIndex((item) => item.id === tabId);
      location.pane.items.splice(index, 1);
    }
    if (location.pane.activeItemId === location.item.id) {
      location.pane.activeItemId = location.pane.items[0]?.id ?? null;
    }
    this.#pruneEmptyPane(sourceHostId, sourcePaneId);
    this.#pruneEmptyWindow(sourceHostId);
    if (this.layout.active.tabId === tabId) this.#activateFallback();
    this.#commit({ source: "tab-close", id: tabId });
    return true;
  }

  updateViewState(tabId: string, state: Record<string, unknown>): boolean {
    const location = findWorkspaceTab(this.layout, tabId);
    if (!location) return false;
    location.tab.view.state = state;
    this.#commit({ source: "view-state", id: tabId });
    return true;
  }

  splitPane(
    paneId: string,
    position: Exclude<WorkspaceDropPosition, "center">,
    tab: WorkspaceTab,
    commit = true,
  ): boolean {
    const location = this.#findPaneHost(paneId);
    if (!location) return false;
    if (this.#dockForPane(paneId) === "bottom") return false;
    if (this.focusMode?.paneId === paneId) this.exitFocusMode();
    const newPane = createWorkspaceTabs([tab], { activeItemId: tab.id });
    const direction =
      position === "left" || position === "right" ? "horizontal" : "vertical";
    const before = position === "left" || position === "top";
    const replacement = createWorkspaceSplit(
      direction,
      before ? [newPane, location.pane] : [location.pane, newPane],
    );
    this.#replaceHostNode(location.hostId, paneId, replacement);
    this.layout.active = {
      hostId: location.hostId,
      paneId: newPane.id,
      tabId: tab.id,
    };
    this.#events.trigger("active-tab-change", tab);
    if (commit) {
      this.#commit({ source: "split", id: newPane.id, operation: position });
    }
    return true;
  }

  willShowDropOverlay(
    input: Omit<
      WorkspaceLayoutDropEvent,
      "defaultPrevented" | "preventDefault"
    >,
  ): WorkspaceLayoutDropEvent {
    const event = createCancelableEvent(input);
    this.#events.trigger("layout-will-show-overlay", event);
    return event;
  }

  dropTab(
    tabId: string,
    targetPaneId: string,
    position: WorkspaceDropPosition,
    source: WorkspaceLayoutDropEvent["source"] = "api",
    targetIndex?: number,
  ): boolean {
    const sourceLocation = findWorkspaceTab(this.layout, tabId);
    const targetPane = findWorkspacePane(this.layout, targetPaneId);
    if (!sourceLocation || !targetPane) return false;
    if (position !== "center" && this.#dockForPane(targetPaneId) === "bottom") {
      return false;
    }
    const boundedTargetIndex = Math.min(
      Math.max(0, targetIndex ?? targetPane.items.length),
      targetPane.items.length,
    );
    const sourceItemIndex =
      position === "center" &&
      sourceLocation.pane.id === targetPaneId &&
      !sourceLocation.group &&
      sourceLocation.item.kind === "tab"
        ? sourceLocation.pane.items.indexOf(sourceLocation.item)
        : -1;
    const insertionIndex =
      sourceItemIndex >= 0 && sourceItemIndex < boundedTargetIndex
        ? boundedTargetIndex - 1
        : boundedTargetIndex;
    if (sourceItemIndex >= 0 && insertionIndex === sourceItemIndex) {
      return false;
    }
    const event = createCancelableEvent({
      tabId,
      targetPaneId,
      position,
      source,
      operation: position === "center" ? "tab-drop" : "split-drop",
    } as const);
    this.#events.trigger("layout-will-drop", event);
    if (event.defaultPrevented) return false;

    const tab = sourceLocation.tab;
    const sourceHostId = sourceLocation.hostId;
    const sourcePaneId = sourceLocation.pane.id;
    const targetHostId = this.#findPaneHost(targetPaneId)?.hostId ?? "root";
    this.#detachTab(sourceLocation);
    if (sourcePaneId !== targetPaneId) {
      this.#pruneEmptyPane(sourceHostId, sourcePaneId);
    }
    if (sourceHostId !== targetHostId) this.#pruneEmptyWindow(sourceHostId);
    if (position === "center") {
      targetPane.items.splice(insertionIndex, 0, tab);
      targetPane.activeItemId = tab.id;
      const targetHost = this.#findPaneHost(targetPaneId)?.hostId ?? "root";
      this.layout.active = { hostId: targetHost, paneId: targetPaneId, tabId };
    } else {
      this.splitPane(targetPaneId, position, tab, false);
    }
    this.#events.trigger("layout-did-drop", event);
    this.#events.trigger("active-tab-change", tab);
    this.#commit({ source: "drag-drop", id: tabId, operation: position });
    return true;
  }

  dropTabIntoSidebarGroup(
    tabId: string,
    groupId: string,
    targetIndex: number,
    position: Exclude<WorkspaceDropPosition, "center">,
    source: WorkspaceLayoutDropEvent["source"] = "api",
  ): boolean {
    const sourceLocation = findWorkspaceTab(this.layout, tabId);
    const groupLocation = this.#findSidebarGroupLocation(groupId);
    if (!sourceLocation || !groupLocation) return false;
    const event = createCancelableEvent({
      tabId,
      targetPaneId: groupLocation.pane.id,
      position,
      source,
      operation: "tab-drop",
    } as const);
    this.#events.trigger("layout-will-drop", event);
    if (event.defaultPrevented) return false;
    this.clearFocusModeForTab(tabId);

    const tab = sourceLocation.tab;
    const sourceHostId = sourceLocation.hostId;
    const sourcePaneId = sourceLocation.pane.id;
    const targetGroup = groupLocation.group;
    let insertion = Math.min(Math.max(0, targetIndex), targetGroup.tabs.length);

    if (sourceLocation.group?.id === targetGroup.id) {
      const currentIndex = targetGroup.tabs.findIndex(
        (candidate) => candidate.id === tabId,
      );
      if (currentIndex < 0) return false;
      targetGroup.tabs.splice(currentIndex, 1);
      if (currentIndex < insertion) insertion -= 1;
    } else {
      this.#detachTab(sourceLocation);
      this.#pruneEmptyPane(sourceHostId, sourcePaneId);
      this.#pruneEmptyWindow(sourceHostId);
      targetGroup.hiddenTabIds = targetGroup.hiddenTabIds.filter(
        (id) => id !== tabId,
      );
      targetGroup.collapsedByTabId[tabId] = false;
      targetGroup.panelSizesByTabId[tabId] =
        targetGroup.tabs.length > 0 ? 100 / (targetGroup.tabs.length + 1) : 100;
    }

    targetGroup.tabs.splice(insertion, 0, tab);
    groupLocation.pane.activeItemId = targetGroup.id;
    this.layout.active = {
      hostId: "root",
      paneId: groupLocation.pane.id,
      tabId,
    };
    this.#events.trigger("layout-did-drop", event);
    this.#events.trigger("active-tab-change", tab);
    this.#commit({
      source: "drag-drop",
      id: tabId,
      operation: "sidebar-group-reorder",
    });
    return true;
  }

  setSidebarOpen(side: WorkspaceSide, open: boolean): void {
    this.setDockOpen(side, open);
  }

  setDockOpen(position: WorkspaceDockPosition, open: boolean): void {
    this.layout[position].open = open;
    this.#commit({
      source: position === "bottom" ? "bottom-panel" : "sidebar",
      id: position,
      operation: open ? "open" : "close",
    });
  }

  setSplitSizes(splitId: string, sizes: number[], commit = true): boolean {
    const node = this.#findNode(splitId);
    if (
      !node ||
      node.kind !== "split" ||
      sizes.length !== node.children.length
    ) {
      return false;
    }
    const normalized = sizes.map((size) => Math.max(1, size));
    const total = normalized.reduce((sum, size) => sum + size, 0);
    node.sizes = normalized.map((size) => (size / total) * 100);
    if (commit) {
      this.#events.trigger("resize", splitId);
      this.#commit({ source: "resize", id: splitId, operation: "split" });
    }
    return true;
  }

  setTabsPresentation(
    paneId: string,
    presentation: WorkspaceTabsNode["presentation"],
  ): boolean {
    const pane = findWorkspacePane(this.layout, paneId);
    if (!pane || pane.presentation === presentation) return Boolean(pane);
    pane.presentation = presentation;
    this.#commit({
      source: "layout-replace",
      id: paneId,
      operation: `presentation:${presentation}`,
    });
    return true;
  }

  beginDrag(tabId: string, source: "html5" | "pointer"): void {
    this.#events.trigger("layout-drag-start", { tabId, source });
  }

  endDrag(tabId: string, source: "html5" | "pointer"): void {
    this.#events.trigger("layout-drag-end", { tabId, source });
  }

  setSidebarSize(side: WorkspaceSide, size: number): void {
    this.setDockSize(side, size);
  }

  setDockSize(position: WorkspaceDockPosition, size: number): void {
    const minimum = position === "bottom" ? 120 : 180;
    this.layout[position].size = Math.min(640, Math.max(minimum, size));
    this.#events.trigger("resize", position);
    this.#commit({ source: "resize", id: position });
  }

  setSidebarGroupCollapsed(
    groupId: string,
    tabId: string,
    collapsed: boolean,
  ): boolean {
    const group = this.#findSidebarGroup(groupId);
    if (!group || !group.tabs.some((tab) => tab.id === tabId)) return false;
    group.collapsedByTabId[tabId] = collapsed;
    this.#commit({
      source: "sidebar-group",
      id: groupId,
      operation: "collapse",
    });
    return true;
  }

  updateSidebarGroup(
    groupId: string,
    changes: { title?: string; icon?: WorkspaceIconName | null },
  ): boolean {
    const group = this.#findSidebarGroup(groupId);
    if (!group) return false;

    const title =
      changes.title === undefined
        ? group.title
        : changes.title.trim() || group.id;
    const icon =
      "icon" in changes ? changes.icon?.trim() || undefined : group.icon;
    if (title === group.title && icon === group.icon) return true;

    group.title = title;
    group.icon = icon;
    this.#commit({
      source: "sidebar-group",
      id: groupId,
      operation: "metadata",
    });
    return true;
  }

  groupSidebarTabs(
    side: WorkspaceSide,
    tabIds: string[],
    options: { id?: string; title?: string; icon?: string } = {},
  ): WorkspaceSidebarGroup | null {
    return this.groupDockTabs(side, tabIds, options);
  }

  groupDockTabs(
    position: WorkspaceDockPosition,
    tabIds: string[],
    options: { id?: string; title?: string; icon?: string } = {},
  ): WorkspaceSidebarGroup | null {
    const locations = tabIds
      .map((tabId) => findWorkspaceTab(this.layout, tabId))
      .filter((location) => location !== null);
    if (
      !locations.length ||
      locations.length !== tabIds.length ||
      locations.some(
        (location) =>
          location.group ||
          location.hostId !== "root" ||
          this.#dockForPane(location.pane.id) !== position,
      )
    ) {
      return null;
    }
    const pane = locations[0]!.pane;
    if (locations.some((location) => location.pane !== pane)) return null;
    const indexes = locations.map((location) =>
      pane.items.findIndex((item) => item.id === location.item.id),
    );
    if (indexes.some((index) => index < 0)) return null;
    const insertion = Math.min(...indexes);
    const tabs = locations.map((location) => location.tab);
    for (const index of [...indexes].sort((a, b) => b - a)) {
      pane.items.splice(index, 1);
    }
    const first = tabs[0]!;
    const group: WorkspaceSidebarGroup = {
      kind: "sidebar-group",
      id: options.id ?? createWorkspaceId("sidebar-group"),
      title: options.title ?? first.title,
      icon: options.icon ?? first.icon,
      tabs,
      hiddenTabIds: [],
      collapsedByTabId: Object.fromEntries(tabs.map((tab) => [tab.id, false])),
      panelSizesByTabId: Object.fromEntries(
        tabs.map((tab) => [tab.id, 100 / tabs.length]),
      ),
    };
    pane.items.splice(insertion, 0, group);
    pane.activeItemId = group.id;
    this.layout.active = {
      hostId: "root",
      paneId: pane.id,
      tabId: first.id,
    };
    this.#events.trigger("active-tab-change", first);
    this.#commit({
      source: "sidebar-group",
      id: group.id,
      operation: "group",
    });
    return group;
  }

  ungroupSidebarGroup(groupId: string): WorkspaceTab[] {
    const location = this.#findSidebarGroupLocation(groupId);
    if (!location) return [];
    const { pane, group } = location;
    const index = pane.items.findIndex((item) => item.id === group.id);
    if (index < 0) return [];
    const tabs = [...group.tabs];
    pane.items.splice(index, 1, ...tabs);
    pane.activeItemId = tabs[0]?.id ?? pane.items[0]?.id ?? null;
    if (tabs[0]) {
      this.layout.active = {
        hostId: "root",
        paneId: pane.id,
        tabId: tabs[0].id,
      };
      this.#events.trigger("active-tab-change", tabs[0]);
    } else {
      this.#activateFallback();
    }
    this.#commit({
      source: "sidebar-group",
      id: groupId,
      operation: "ungroup",
    });
    return tabs;
  }

  moveSidebarPanelToTabs(groupId: string, tabId: string): boolean {
    const location = this.#findSidebarGroupLocation(groupId);
    if (!location) return false;
    const { group, pane } = location;
    const tabIndex = group.tabs.findIndex((tab) => tab.id === tabId);
    const groupIndex = pane.items.findIndex((item) => item.id === groupId);
    if (tabIndex < 0 || groupIndex < 0) return false;

    const [tab] = group.tabs.splice(tabIndex, 1);
    if (!tab) return false;
    group.hiddenTabIds = group.hiddenTabIds.filter((id) => id !== tabId);
    delete group.collapsedByTabId[tabId];
    delete group.panelSizesByTabId[tabId];

    if (group.tabs.length) {
      pane.items.splice(groupIndex + 1, 0, tab);
    } else {
      pane.items.splice(groupIndex, 1, tab);
    }
    pane.activeItemId = tab.id;
    this.layout.active = {
      hostId: "root",
      paneId: pane.id,
      tabId: tab.id,
    };
    this.#events.trigger("active-tab-change", tab);
    this.#commit({
      source: "sidebar-group",
      id: groupId,
      operation: "move-panel",
    });
    return true;
  }

  closeHiddenSidebarPanels(groupId: string): number {
    const group = this.#findSidebarGroup(groupId);
    if (!group) return 0;
    const hiddenIds = [...group.hiddenTabIds];
    return hiddenIds.reduce(
      (closed, tabId) => closed + Number(this.closeTab(tabId)),
      0,
    );
  }

  closeSidebarGroup(groupId: string): number {
    const group = this.#findSidebarGroup(groupId);
    if (!group) return 0;
    const tabIds = group.tabs.map((tab) => tab.id);
    return tabIds.reduce(
      (closed, tabId) => closed + Number(this.closeTab(tabId)),
      0,
    );
  }

  setSidebarPanelSize(groupId: string, tabId: string, size: number): boolean {
    return this.setSidebarPanelSizes(groupId, { [tabId]: size });
  }

  /** @internal Used by the source-shaped grouped sidebar to commit one layout. */
  setSidebarPanelSizes(
    groupId: string,
    sizesByTabId: Readonly<Record<string, number>>,
  ): boolean {
    const group = this.#findSidebarGroup(groupId);
    if (!group) return false;
    const tabIds = new Set(group.tabs.map((tab) => tab.id));
    const entries = Object.entries(sizesByTabId)
      .filter(
        ([tabId, size]) =>
          tabIds.has(tabId) && Number.isFinite(size) && size > 0,
      )
      .map(([tabId, size]) => [tabId, Number(size.toFixed(4))] as const);
    if (!entries.length) return false;
    const changes = entries.filter(
      ([tabId, size]) => group.panelSizesByTabId[tabId] !== size,
    );
    if (!changes.length) return true;
    for (const [tabId, size] of changes) {
      group.panelSizesByTabId[tabId] = size;
      this.#events.trigger("resize", tabId);
    }
    this.#commit({ source: "resize", id: groupId, operation: "sidebar-panel" });
    return true;
  }

  setSidebarPanelHidden(
    groupId: string,
    tabId: string,
    hidden: boolean,
  ): boolean {
    const group = this.#findSidebarGroup(groupId);
    if (!group || !group.tabs.some((tab) => tab.id === tabId)) return false;
    const ids = new Set(group.hiddenTabIds);
    if (hidden) ids.add(tabId);
    else ids.delete(tabId);
    group.hiddenTabIds = [...ids];
    this.#commit({
      source: "sidebar-group",
      id: tabId,
      operation: "visibility",
    });
    return true;
  }

  openWindow(
    tab: WorkspaceTab,
    mode: WorkspaceWindowMode = "floating",
    bounds: Partial<WorkspaceWindowBounds> = {},
  ): WorkspaceWindow | null {
    const workspaceWindow: WorkspaceWindow = {
      id: createWorkspaceId("window"),
      mode,
      state: "normal",
      bounds: {
        x: bounds.x ?? 120,
        y: bounds.y ?? 90,
        width: Math.max(280, bounds.width ?? 560),
        height: Math.max(180, bounds.height ?? 420),
      },
      root: createWorkspaceTabs([tab], { activeItemId: tab.id }),
    };
    if (mode === "popout" && !this.#openPopout(workspaceWindow, tab.title)) {
      return null;
    }
    this.layout.windows.push(workspaceWindow);
    this.layout.active = {
      hostId: workspaceWindow.id,
      paneId: workspaceWindow.root.id,
      tabId: tab.id,
    };
    this.#events.trigger("active-tab-change", tab);
    this.#commit({
      source: "window-open",
      id: workspaceWindow.id,
      operation: mode,
    });
    return workspaceWindow;
  }

  floatTab(
    tabId: string,
    bounds: Partial<WorkspaceWindowBounds> = {},
  ): WorkspaceWindow | null {
    const location = findWorkspaceTab(this.layout, tabId);
    if (!location) return null;
    this.clearFocusModeForTab(tabId);
    const tab = location.tab;
    const sourceHostId = location.hostId;
    const sourcePaneId = location.pane.id;
    this.#detachTab(location);
    this.#pruneEmptyPane(sourceHostId, sourcePaneId);
    this.#pruneEmptyWindow(sourceHostId);
    return this.openWindow(tab, "floating", bounds);
  }

  popoutTab(tabId: string): WorkspaceWindow | null {
    const location = findWorkspaceTab(this.layout, tabId);
    if (!location) return null;
    const tab = location.tab;
    const workspaceWindow = this.openWindow(tab, "popout");
    if (workspaceWindow) {
      const sourcePaneId = location.pane.id;
      this.#detachTab(location);
      this.#pruneEmptyPane(location.hostId, sourcePaneId);
      this.#pruneEmptyWindow(location.hostId);
    }
    return workspaceWindow;
  }

  setWindowBounds(
    windowId: string,
    bounds: WorkspaceWindowBounds,
    commit = true,
  ): boolean {
    const workspaceWindow = this.#window(windowId);
    if (!workspaceWindow) return false;
    workspaceWindow.bounds = {
      x: Math.max(0, bounds.x),
      y: Math.max(0, bounds.y),
      width: Math.max(280, bounds.width),
      height: Math.max(180, bounds.height),
    };
    if (commit) {
      this.#events.trigger("resize", windowId);
      this.#commit({ source: "window-bounds", id: windowId });
    }
    return true;
  }

  setWindowState(windowId: string, state: WorkspaceWindowState): boolean {
    const workspaceWindow = this.#window(windowId);
    if (!workspaceWindow) return false;
    workspaceWindow.state = state;
    this.#commit({ source: "window-state", id: windowId, operation: state });
    return true;
  }

  focusWindow(windowId: string): boolean {
    const workspaceWindow = this.#window(windowId);
    if (!workspaceWindow) return false;
    this.#bringWindowToFront(windowId);
    const first = firstWorkspaceTab({
      ...this.layout,
      main: workspaceWindow.root,
      left: { ...this.layout.left, root: createWorkspaceTabs([]) },
      right: { ...this.layout.right, root: createWorkspaceTabs([]) },
      windows: [],
    });
    if (first) {
      this.layout.active = {
        hostId: windowId,
        paneId: first.pane.id,
        tabId: first.tab.id,
      };
      this.#events.trigger("active-tab-change", first.tab);
    }
    this.#popoutHandles.get(windowId)?.focus();
    this.#commit({ source: "window-focus", id: windowId });
    return true;
  }

  closeWindow(windowId: string): boolean {
    const index = this.layout.windows.findIndex(
      (workspaceWindow) => workspaceWindow.id === windowId,
    );
    if (index < 0) return false;
    this.layout.windows.splice(index, 1);
    this.#popoutHandles.get(windowId)?.close();
    this.#popoutHandles.delete(windowId);
    if (this.layout.active.hostId === windowId) this.#activateFallback();
    this.#commit({ source: "window-close", id: windowId });
    return true;
  }

  dockWindow(windowId: string, targetPaneId: string): boolean {
    const workspaceWindow = this.#window(windowId);
    const target = findWorkspacePane(this.layout, targetPaneId);
    if (!workspaceWindow || !target) return false;
    const tabs: WorkspaceTab[] = [];
    const collect = (node: WorkspaceNode) => {
      if (node.kind === "split") return node.children.forEach(collect);
      for (const item of node.items) {
        if (item.kind === "tab") tabs.push(item);
        else tabs.push(...item.tabs);
      }
    };
    collect(workspaceWindow.root);
    target.items.push(...tabs);
    target.activeItemId = tabs.at(-1)?.id ?? target.activeItemId;
    this.closeWindow(windowId);
    if (tabs.length) this.selectTab(tabs.at(-1)!.id);
    return true;
  }

  setPopoutHost(host: WorkspacePopoutHost | null): void {
    this.#popoutHost = host;
  }

  supportsPopoutWindows(): boolean {
    return Boolean(this.#popoutHost);
  }

  getPopoutHandle(windowId: string): WorkspacePopoutHandle | null {
    return this.#popoutHandles.get(windowId) ?? null;
  }

  createPaneMenu(
    tabId: string,
    context: "pane" | "sidebar-group-panel" = "pane",
  ): WorkspaceMenu {
    const location = findWorkspaceTab(this.layout, tabId);
    const menu = new WorkspaceMenu();
    if (!location) return menu;
    menu.addGroups([
      (group) =>
        group
          .addItem((item) =>
            item
              .setTitle("Split right")
              .setIcon("separator-vertical")
              .onClick(() => {
                const duplicate = {
                  ...location.tab,
                  id: createWorkspaceId("tab"),
                };
                this.splitPane(location.pane.id, "right", duplicate);
              }),
          )
          .addItem((item) =>
            item
              .setTitle("Split down")
              .setIcon("separator-horizontal")
              .onClick(() => {
                const duplicate = {
                  ...location.tab,
                  id: createWorkspaceId("tab"),
                };
                this.splitPane(location.pane.id, "bottom", duplicate);
              }),
          ),
      (group) =>
        group
          .addItem((item) =>
            item
              .setTitle("Move to floating window")
              .setIcon("picture-in-picture")
              .onClick(() => {
                this.floatTab(tabId);
              }),
          )
          .addItem((item) =>
            item
              .setTitle("Open in new window")
              .setIcon("panel-top-open")
              .setDisabled(!this.#popoutHost)
              .onClick(() => {
                this.popoutTab(tabId);
              }),
          ),
      (group) =>
        group.addItem((item) =>
          item
            .setTitle("Close")
            .setIcon("x")
            .setDisabled(location.tab.closable === false)
            .onClick(() => {
              this.closeTab(tabId);
            }),
        ),
    ]);
    const dock = this.#dockForPane(location.pane.id);
    if (dock) {
      const dockLabel = dock === "bottom" ? "panel" : "sidebar";
      menu.addSeparator();
      if (location.group) {
        if (context === "sidebar-group-panel") {
          menu
            .addItem((item) =>
              item.setTitle("Hide this panel").onClick(() => {
                this.setSidebarPanelHidden(location.group!.id, tabId, true);
              }),
            )
            .addItem((item) =>
              item.setTitle(`Move to normal ${dockLabel} tabs`).onClick(() => {
                this.moveSidebarPanelToTabs(location.group!.id, tabId);
              }),
            );
        } else {
          menu.addItem((item) =>
            item.setTitle(`Ungroup into ${dockLabel} tabs`).onClick(() => {
              this.ungroupSidebarGroup(location.group!.id);
            }),
          );
        }
      } else {
        menu.addItem((item) =>
          item.setTitle(`Convert to ${dockLabel} group`).onClick(() => {
            this.groupDockTabs(dock, [tabId]);
          }),
        );
      }
    }
    const definition = this.registry.resolve(location.tab.view.type);
    definition
      ?.getChrome?.({
        tab: location.tab,
        hostId: location.hostId,
        paneId: location.pane.id,
        active: this.activeTabId === tabId,
        showInlineTitle: this.showInlineTitle,
        activate: () => this.selectTab(tabId),
        close: () => this.closeTab(tabId),
        setState: (state) => this.updateViewState(tabId, state),
      })
      .buildPaneMenu?.(menu, {
        tab: location.tab,
        hostId: location.hostId,
        paneId: location.pane.id,
        active: this.activeTabId === tabId,
        showInlineTitle: this.showInlineTitle,
        activate: () => this.selectTab(tabId),
        close: () => this.closeTab(tabId),
        setState: (state) => this.updateViewState(tabId, state),
      });
    return menu;
  }

  destroy(): void {
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    for (const handle of this.#popoutHandles.values()) handle.close();
    this.#popoutHandles.clear();
    this.#events.clear();
  }

  #commit(event: WorkspaceLayoutChangeEvent): void {
    this.#events.trigger("layout-change", event);
    this.requestSaveLayout(event);
  }

  #activateTab(tabId: string): boolean {
    const location = findWorkspaceTab(this.layout, tabId);
    if (!location) return false;
    location.pane.activeItemId = location.item.id;
    this.layout.active = {
      hostId: location.hostId,
      paneId: location.pane.id,
      tabId,
    };
    if (location.hostId !== "root") this.#bringWindowToFront(location.hostId);
    this.#events.trigger("active-tab-change", location.tab);
    if (
      this.focusMode?.paneId === location.pane.id &&
      this.focusMode.tabId !== tabId
    ) {
      const state = { tabId, paneId: location.pane.id };
      this.focusMode = state;
      this.#events.trigger("focus-mode-change", state);
    }
    return true;
  }

  #activateFallback(): void {
    const first = firstWorkspaceTab(this.layout);
    this.layout.active = first
      ? { hostId: first.hostId, paneId: first.pane.id, tabId: first.tab.id }
      : { hostId: "root", paneId: null, tabId: null };
    this.#events.trigger("active-tab-change", first?.tab ?? null);
  }

  #pruneEmptyWindow(hostId: string): void {
    if (hostId === "root") return;
    const index = this.layout.windows.findIndex((entry) => entry.id === hostId);
    if (index < 0) return;
    const workspaceWindow = this.layout.windows[index]!;
    const hasTabs = (node: WorkspaceNode): boolean =>
      node.kind === "split"
        ? node.children.some(hasTabs)
        : node.items.some((item) =>
            item.kind === "tab" ? true : item.tabs.length > 0,
          );
    if (hasTabs(workspaceWindow.root)) return;
    this.layout.windows.splice(index, 1);
    this.#popoutHandles.get(hostId)?.close();
    this.#popoutHandles.delete(hostId);
  }

  #pruneEmptyPane(hostId: string, paneId: string): void {
    if (hostId !== "root") {
      const workspaceWindow = this.#window(hostId);
      if (!workspaceWindow) return;
      workspaceWindow.root = pruneEmptyWorkspacePane(
        workspaceWindow.root,
        paneId,
      );
      return;
    }
    if (workspaceNodeContains(this.layout.main, paneId)) {
      this.layout.main = pruneEmptyWorkspacePane(this.layout.main, paneId);
      return;
    }
    for (const side of ["left", "right"] as const) {
      if (!workspaceNodeContains(this.layout[side].root, paneId)) continue;
      this.layout[side].root = pruneEmptyWorkspacePane(
        this.layout[side].root,
        paneId,
      );
      return;
    }
    if (workspaceNodeContains(this.layout.bottom.root, paneId)) {
      this.layout.bottom.root = pruneEmptyWorkspacePane(
        this.layout.bottom.root,
        paneId,
      ) as WorkspaceTabsNode;
    }
  }

  #detachTab(location: NonNullable<ReturnType<typeof findWorkspaceTab>>): void {
    this.clearFocusModeForTab(location.tab.id);
    if (location.group) {
      location.group.tabs.splice(
        location.group.tabs.findIndex((tab) => tab.id === location.tab.id),
        1,
      );
      location.group.hiddenTabIds = location.group.hiddenTabIds.filter(
        (id) => id !== location.tab.id,
      );
      delete location.group.collapsedByTabId[location.tab.id];
      delete location.group.panelSizesByTabId[location.tab.id];
      if (location.group.tabs.length === 0) {
        const groupIndex = location.pane.items.findIndex(
          (item) => item.id === location.group?.id,
        );
        if (groupIndex >= 0) location.pane.items.splice(groupIndex, 1);
      }
    } else {
      location.pane.items.splice(
        location.pane.items.findIndex((item) => item.id === location.item.id),
        1,
      );
    }
    if (location.pane.activeItemId === location.item.id) {
      location.pane.activeItemId = location.pane.items[0]?.id ?? null;
    }
  }

  #findPaneHost(
    paneId: string,
  ): { hostId: string; pane: WorkspaceTabsNode } | null {
    const pane = findWorkspacePane(this.layout, paneId);
    if (!pane) return null;
    let hostId = "root";
    for (const workspaceWindow of this.layout.windows) {
      const synthetic: WorkspaceLayout = {
        ...this.layout,
        main: workspaceWindow.root,
        left: { ...this.layout.left, root: createWorkspaceTabs([]) },
        right: { ...this.layout.right, root: createWorkspaceTabs([]) },
        bottom: {
          ...this.layout.bottom,
          root: createWorkspaceTabs([]),
        },
        windows: [],
      };
      if (findWorkspacePane(synthetic, paneId)) hostId = workspaceWindow.id;
    }
    return { hostId, pane };
  }

  #replaceHostNode(
    hostId: string,
    nodeId: string,
    replacement: WorkspaceNode,
  ): void {
    if (hostId === "root") {
      if (workspaceNodeContains(this.layout.main, nodeId)) {
        this.layout.main = normalizeWorkspaceTree(
          replaceWorkspaceNode(this.layout.main, nodeId, replacement),
        );
        return;
      }
      for (const side of ["left", "right"] as const) {
        if (!workspaceNodeContains(this.layout[side].root, nodeId)) continue;
        this.layout[side].root = normalizeWorkspaceTree(
          replaceWorkspaceNode(this.layout[side].root, nodeId, replacement),
        );
        return;
      }
      if (
        replacement.kind === "tabs" &&
        workspaceNodeContains(this.layout.bottom.root, nodeId)
      ) {
        this.layout.bottom.root = replacement;
      }
      return;
    }
    const workspaceWindow = this.#window(hostId);
    if (workspaceWindow) {
      workspaceWindow.root = normalizeWorkspaceTree(
        replaceWorkspaceNode(workspaceWindow.root, nodeId, replacement),
      );
    }
  }

  #findSidebarGroup(groupId: string): WorkspaceSidebarGroup | null {
    return this.#findSidebarGroupLocation(groupId)?.group ?? null;
  }

  #findSidebarGroupLocation(groupId: string): {
    side: WorkspaceDockPosition;
    pane: WorkspaceTabsNode;
    group: WorkspaceSidebarGroup;
  } | null {
    for (const side of ["left", "right", "bottom"] as const) {
      let match: {
        side: WorkspaceDockPosition;
        pane: WorkspaceTabsNode;
        group: WorkspaceSidebarGroup;
      } | null = null;
      walkWorkspaceTabs(this.layout[side].root, (pane) => {
        const group = pane.items.find(
          (item): item is WorkspaceSidebarGroup =>
            item.kind === "sidebar-group" && item.id === groupId,
        );
        if (group) match = { side, pane, group };
      });
      if (match) return match;
    }
    return null;
  }

  #dockForPane(paneId: string): WorkspaceDockPosition | null {
    if (workspaceNodeContains(this.layout.left.root, paneId)) return "left";
    if (workspaceNodeContains(this.layout.right.root, paneId)) return "right";
    if (workspaceNodeContains(this.layout.bottom.root, paneId)) return "bottom";
    return null;
  }

  #findNode(nodeId: string): WorkspaceNode | null {
    const find = (node: WorkspaceNode): WorkspaceNode | null => {
      if (node.id === nodeId) return node;
      if (node.kind === "tabs") return null;
      for (const child of node.children) {
        const match = find(child);
        if (match) return match;
      }
      return null;
    };
    const main = find(this.layout.main);
    if (main) return main;
    const left = find(this.layout.left.root);
    if (left) return left;
    const right = find(this.layout.right.root);
    if (right) return right;
    const bottom = find(this.layout.bottom.root);
    if (bottom) return bottom;
    for (const workspaceWindow of this.layout.windows) {
      const match = find(workspaceWindow.root);
      if (match) return match;
    }
    return null;
  }

  #window(windowId: string): WorkspaceWindow | null {
    return (
      this.layout.windows.find(
        (workspaceWindow) => workspaceWindow.id === windowId,
      ) ?? null
    );
  }

  #bringWindowToFront(windowId: string): void {
    const index = this.layout.windows.findIndex(
      (workspaceWindow) => workspaceWindow.id === windowId,
    );
    if (index < 0 || index === this.layout.windows.length - 1) return;
    const [workspaceWindow] = this.layout.windows.splice(index, 1);
    this.layout.windows.push(workspaceWindow);
  }

  #openPopout(workspaceWindow: WorkspaceWindow, title: string): boolean {
    const handle = this.#popoutHost?.open({
      id: workspaceWindow.id,
      title,
      bounds: workspaceWindow.bounds,
    });
    if (!handle) return false;
    this.#popoutHandles.set(workspaceWindow.id, handle);
    handle.onClose(() => {
      if (this.#window(workspaceWindow.id))
        this.closeWindow(workspaceWindow.id);
    });
    return true;
  }
}
