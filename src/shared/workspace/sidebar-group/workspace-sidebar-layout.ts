import type { WorkspaceSidebarGroup, WorkspaceTab } from "../core/types.js";

export const DEFAULT_COLLAPSED_PANEL_SIZE = 8;
export const WORKSPACE_SIDEBAR_PANEL_HEADER_PX = 32;

export function collapsedDockPanelSize(
  containerExtent: number | undefined,
  visibleTabCount: number,
  collapsedExtent = WORKSPACE_SIDEBAR_PANEL_HEADER_PX,
): number {
  if (
    !visibleTabCount ||
    !Number.isFinite(containerExtent) ||
    (containerExtent ?? 0) <= 0
  ) {
    return DEFAULT_COLLAPSED_PANEL_SIZE;
  }

  return Math.min(
    100 / visibleTabCount,
    (collapsedExtent / (containerExtent ?? 1)) * 100,
  );
}

export function collapsedSidebarPanelSize(
  stackHeight: number | undefined,
  visibleTabCount: number,
): number {
  return collapsedDockPanelSize(stackHeight, visibleTabCount);
}

export function dockPanelDefaultSizes(
  group: WorkspaceSidebarGroup,
  tabs: WorkspaceTab[],
  collapsedSize: number,
): number[] {
  const fallback = tabs.length ? 100 / tabs.length : 100;
  const collapsedTabIds = new Set(
    tabs
      .filter((tab) => group.collapsedByTabId[tab.id] === true)
      .map((tab) => tab.id),
  );
  const expandedTabs = tabs.filter((tab) => !collapsedTabIds.has(tab.id));

  if (!expandedTabs.length) return tabs.map(() => collapsedSize);

  const collapsedTotal = collapsedTabIds.size * collapsedSize;
  const expandedSpace = 100 - collapsedTotal;
  if (expandedSpace <= 0) return tabs.map(() => fallback);

  const expandedSizes = expandedTabs.map(
    (tab) => group.panelSizesByTabId[tab.id],
  );
  const hasCompleteSizes = expandedSizes.every(
    (size) => Number.isFinite(size) && (size ?? 0) > 0,
  );
  const total = expandedSizes.reduce<number>(
    (sum, size) => sum + (size ?? 0),
    0,
  );
  const expandedFallback = expandedSpace / expandedTabs.length;
  const expandedSizeById = new Map<string, number>();

  if (!hasCompleteSizes || total <= 0) {
    expandedTabs.forEach((tab) => {
      expandedSizeById.set(tab.id, expandedFallback);
    });
  } else {
    expandedTabs.forEach((tab, index) => {
      const size = expandedSizes[index] ?? 0;
      expandedSizeById.set(tab.id, (size / total) * expandedSpace);
    });
  }

  return tabs.map((tab) =>
    collapsedTabIds.has(tab.id)
      ? collapsedSize
      : (expandedSizeById.get(tab.id) ?? expandedFallback),
  );
}

export const sidebarPanelDefaultSizes = dockPanelDefaultSizes;
