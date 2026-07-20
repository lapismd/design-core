import {
  clampSidebarSize,
  cloneWorkspaceLayout,
  cloneWorkspaceJson,
  createWorkspaceTabs,
  findWorkspaceNode,
  normalizeSizes,
  normalizeWorkspaceLayout,
  pruneWorkspaceNode,
} from "./layout.js";
import { DefaultWorkspaceViewRegistry } from "./view-registry.js";
import type {
  WorkspaceChangeEvent,
  WorkspaceControllerOptions,
  WorkspaceDirection,
  WorkspaceDropPosition,
  WorkspaceLayoutV1,
  WorkspaceNode,
  WorkspaceTab,
  WorkspaceTabsNode,
  WorkspaceViewRegistry,
} from "./types.js";

function findTabGroup(
  node: WorkspaceNode,
  tabId: string,
): WorkspaceTabsNode | null {
  if (node.kind === "tabs")
    return node.tabs.some((tab) => tab.id === tabId) ? node : null;
  for (const child of node.children) {
    const group = findTabGroup(child, tabId);
    if (group) return group;
  }
  return null;
}

function uniqueTabId(tabs: WorkspaceTab[], id: string) {
  return !tabs.some((tab) => tab.id === id);
}

/**
 * Reactive, application-agnostic state for a workspace layout. All public
 * mutation methods replace the layout snapshot so consumers can persist it.
 */
export class WorkspaceController {
  layout: WorkspaceLayoutV1 = $state(normalizeWorkspaceLayout(undefined));
  readonly registry: WorkspaceViewRegistry;
  readonly #onChange?: WorkspaceControllerOptions["onChange"];

  constructor(options: WorkspaceControllerOptions = {}) {
    this.layout = normalizeWorkspaceLayout(options.layout);
    this.registry = options.registry ?? new DefaultWorkspaceViewRegistry();
    this.#onChange = options.onChange;
  }

  replaceLayout(layout: unknown) {
    this.layout = normalizeWorkspaceLayout(layout);
    this.emit({ source: "layout-replace" });
  }

  selectTab(groupId: string, tabId: string) {
    return this.mutate({ source: "tab-select", id: tabId }, (layout) => {
      const found = findWorkspaceNode(layout.main, groupId);
      if (!found || found.node.kind !== "tabs") return false;
      if (!found.node.tabs.some((tab) => tab.id === tabId)) return false;
      found.node.activeTabId = tabId;
      return true;
    });
  }

  addTab(groupId: string, tab: WorkspaceTab, index?: number) {
    return this.mutate({ source: "tab-add", id: tab.id }, (layout) => {
      const found = findWorkspaceNode(layout.main, groupId);
      if (
        !found ||
        found.node.kind !== "tabs" ||
        !uniqueTabId(found.node.tabs, tab.id)
      ) {
        return false;
      }
      const target = Math.max(
        0,
        Math.min(index ?? found.node.tabs.length, found.node.tabs.length),
      );
      found.node.tabs.splice(target, 0, cloneWorkspaceJson(tab));
      found.node.activeTabId = tab.id;
      return true;
    });
  }

  closeTab(groupId: string, tabId: string) {
    return this.mutate({ source: "tab-close", id: tabId }, (layout) => {
      const found = findWorkspaceNode(layout.main, groupId);
      if (!found || found.node.kind !== "tabs") return false;
      const index = found.node.tabs.findIndex((tab) => tab.id === tabId);
      const tab = found.node.tabs[index];
      if (!tab || tab.closable === false) return false;
      found.node.tabs.splice(index, 1);
      if (found.node.activeTabId === tabId) {
        found.node.activeTabId =
          found.node.tabs[index]?.id ?? found.node.tabs[index - 1]?.id ?? null;
      }
      if (found.node.tabs.length === 0) {
        layout.main = pruneWorkspaceNode(layout.main) ?? createWorkspaceTabs();
      }
      return true;
    });
  }

  /** Move or reorder a tab, selecting it in its destination group. */
  moveTab(tabId: string, targetGroupId: string, targetIndex?: number) {
    return this.mutate({ source: "tab-move", id: tabId }, (layout) => {
      const source = findTabGroup(layout.main, tabId);
      const targetFound = findWorkspaceNode(layout.main, targetGroupId);
      if (!source || !targetFound || targetFound.node.kind !== "tabs") {
        return false;
      }
      const target = targetFound.node;
      const sourceIndex = source.tabs.findIndex((tab) => tab.id === tabId);
      const tab = source.tabs[sourceIndex];
      if (!tab) return false;

      source.tabs.splice(sourceIndex, 1);
      if (source.activeTabId === tabId) {
        source.activeTabId =
          source.tabs[sourceIndex]?.id ??
          source.tabs[sourceIndex - 1]?.id ??
          null;
      }

      const insertionIndex = Math.max(
        0,
        Math.min(targetIndex ?? target.tabs.length, target.tabs.length),
      );
      target.tabs.splice(insertionIndex, 0, tab);
      target.activeTabId = tab.id;
      layout.main = pruneWorkspaceNode(layout.main) ?? createWorkspaceTabs();
      return true;
    });
  }

  /** Drop a tab onto a tab group body. Center moves it; edges split it. */
  dropTabOnGroup(
    tabId: string,
    targetGroupId: string,
    position: WorkspaceDropPosition,
  ) {
    if (position === "center") return this.moveTab(tabId, targetGroupId);

    return this.mutate({ source: "split", id: tabId }, (layout) => {
      const source = findTabGroup(layout.main, tabId);
      const targetFound = findWorkspaceNode(layout.main, targetGroupId);
      if (!source || !targetFound || targetFound.node.kind !== "tabs") {
        return false;
      }
      if (source === targetFound.node && source.tabs.length === 1) {
        return false;
      }

      const sourceIndex = source.tabs.findIndex((tab) => tab.id === tabId);
      const tab = source.tabs[sourceIndex];
      if (!tab) return false;

      source.tabs.splice(sourceIndex, 1);
      if (source.activeTabId === tabId) {
        source.activeTabId =
          source.tabs[sourceIndex]?.id ??
          source.tabs[sourceIndex - 1]?.id ??
          null;
      }

      const newGroup = createWorkspaceTabs([tab]);
      const direction: WorkspaceDirection =
        position === "left" || position === "right" ? "horizontal" : "vertical";
      const placement =
        position === "left" || position === "top" ? "before" : "after";
      const target = targetFound.node;

      if (targetFound.parent?.direction === direction) {
        const index = targetFound.index + (placement === "after" ? 1 : 0);
        targetFound.parent.children.splice(index, 0, newGroup);
        targetFound.parent.sizes = normalizeSizes(
          targetFound.parent.sizes,
          targetFound.parent.children.length,
        );
      } else {
        const children =
          placement === "before" ? [newGroup, target] : [target, newGroup];
        const split = {
          kind: "split" as const,
          id: `split-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
          direction,
          sizes: [50, 50],
          children,
        };
        if (targetFound.parent) {
          targetFound.parent.children[targetFound.index] = split;
        } else {
          layout.main = split;
        }
      }

      layout.main = pruneWorkspaceNode(layout.main) ?? createWorkspaceTabs();
      return true;
    });
  }

  /**
   * Restore an empty split by moving a tab into its first tab group. This
   * mirrors Lapis' empty-split recovery target without coupling the package to
   * any application-specific view type.
   */
  dropTabOnEmptySplit(tabId: string, splitId: string) {
    return this.mutate({ source: "tab-move", id: tabId }, (layout) => {
      const source = findTabGroup(layout.main, tabId);
      const splitFound = findWorkspaceNode(layout.main, splitId);
      if (
        !source ||
        !splitFound ||
        splitFound.node.kind !== "split" ||
        splitFound.node.children.length > 0
      ) {
        return false;
      }

      const sourceIndex = source.tabs.findIndex((tab) => tab.id === tabId);
      const tab = source.tabs[sourceIndex];
      if (!tab) return false;

      source.tabs.splice(sourceIndex, 1);
      if (source.activeTabId === tabId) {
        source.activeTabId =
          source.tabs[sourceIndex]?.id ??
          source.tabs[sourceIndex - 1]?.id ??
          null;
      }

      splitFound.node.children = [createWorkspaceTabs([tab])];
      splitFound.node.sizes = [100];
      layout.main = pruneWorkspaceNode(layout.main) ?? createWorkspaceTabs();
      return true;
    });
  }

  setTabPresentation(
    groupId: string,
    presentation: WorkspaceTabsNode["presentation"],
  ) {
    return this.mutate(
      { source: "tab-presentation", id: groupId },
      (layout) => {
        const found = findWorkspaceNode(layout.main, groupId);
        if (!found || found.node.kind !== "tabs") return false;
        found.node.presentation = presentation;
        return true;
      },
    );
  }

  splitTabGroup(
    groupId: string,
    direction: WorkspaceDirection,
    placement: "before" | "after",
    group = createWorkspaceTabs(),
  ) {
    return this.mutate({ source: "split", id: groupId }, (layout) => {
      const found = findWorkspaceNode(layout.main, groupId);
      if (!found || found.node.kind !== "tabs") return false;
      const target = found.node;
      if (found.parent?.direction === direction) {
        const index = found.index + (placement === "after" ? 1 : 0);
        found.parent.children.splice(index, 0, group);
        found.parent.sizes = normalizeSizes(
          found.parent.sizes,
          found.parent.children.length,
        );
        return true;
      }
      const children =
        placement === "before" ? [group, target] : [target, group];
      const split = {
        kind: "split" as const,
        id: `split-${globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)}`,
        direction,
        sizes: [50, 50],
        children,
      };
      if (found.parent) {
        found.parent.children[found.index] = split;
      } else {
        layout.main = split;
      }
      return true;
    });
  }

  setSplitSizes(splitId: string, sizes: number[]) {
    return this.mutate({ source: "resize", id: splitId }, (layout) => {
      const found = findWorkspaceNode(layout.main, splitId);
      if (!found || found.node.kind !== "split") return false;
      found.node.sizes = normalizeSizes(sizes, found.node.children.length);
      return true;
    });
  }

  setSidebarOpen(side: "left" | "right", open: boolean) {
    return this.mutate({ source: "sidebar", id: side }, (layout) => {
      layout[side].open = open;
      return true;
    });
  }

  setSidebarSize(side: "left" | "right", size: number) {
    return this.mutate({ source: "sidebar", id: side }, (layout) => {
      layout[side].size = clampSidebarSize(size, layout[side].size);
      return true;
    });
  }

  setSidebarGroupCollapsed(
    side: "left" | "right",
    groupId: string,
    collapsed: boolean,
  ) {
    return this.mutate(
      { source: "sidebar-group", id: `${side}:${groupId}` },
      (layout) => {
        layout[side].collapsedGroups = {
          ...layout[side].collapsedGroups,
          [groupId]: collapsed,
        };
        return true;
      },
    );
  }

  toggleSidebarGroup(side: "left" | "right", groupId: string) {
    return this.setSidebarGroupCollapsed(
      side,
      groupId,
      !this.layout[side].collapsedGroups[groupId],
    );
  }

  selectSidebarTab(side: "left" | "right", tabId: string) {
    return this.mutate(
      { source: "sidebar-tab", id: `${side}:${tabId}` },
      (layout) => {
        layout[side].activeTabId = tabId;
        return true;
      },
    );
  }

  updateViewState(tabId: string, state: Record<string, unknown>) {
    return this.mutate({ source: "view-state", id: tabId }, (layout) => {
      const group = findTabGroup(layout.main, tabId);
      const tab = group?.tabs.find((candidate) => candidate.id === tabId);
      if (!tab) return false;
      tab.view.state = cloneWorkspaceJson(state);
      return true;
    });
  }

  toJSON(): WorkspaceLayoutV1 {
    return cloneWorkspaceLayout(this.layout);
  }

  private mutate(
    event: WorkspaceChangeEvent,
    change: (layout: WorkspaceLayoutV1) => boolean,
  ) {
    const next = cloneWorkspaceLayout(this.layout);
    if (!change(next)) return false;
    this.layout = normalizeWorkspaceLayout(next);
    this.emit(event);
    return true;
  }

  private emit(event: WorkspaceChangeEvent) {
    this.#onChange?.(this.toJSON(), event);
  }
}
