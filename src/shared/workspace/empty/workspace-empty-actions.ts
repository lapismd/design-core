import type {
  WorkspaceAction,
  WorkspaceNode,
  WorkspaceSide,
  WorkspaceTab,
  WorkspaceTabItem,
  WorkspaceTabsNode,
} from "../core/types.js";
import type { WorkspaceShellController } from "../core/workspace-controller.svelte.js";

type CreateTab = (paneId: string) => WorkspaceTab;

function nodeContains(node: WorkspaceNode, nodeId: string): boolean {
  if (node.id === nodeId) return true;
  return (
    node.kind === "split" &&
    node.children.some((child) => nodeContains(child, nodeId))
  );
}

function visitPanes(
  node: WorkspaceNode,
  visitor: (pane: WorkspaceTabsNode) => void,
): void {
  if (node.kind === "tabs") {
    visitor(node);
    return;
  }
  for (const child of node.children) visitPanes(child, visitor);
}

function visibleTab(item: WorkspaceTabItem): WorkspaceTab | undefined {
  if (item.kind === "tab") return item;
  return item.tabs.find((tab) => !item.hiddenTabIds.includes(tab.id));
}

export function createWorkspaceEmptyActions(
  controller: WorkspaceShellController,
  paneId: string,
  createTab?: CreateTab,
  closeTabId?: string,
): WorkspaceAction[] {
  return [
    ...(createTab
      ? [
          {
            id: "workspace-empty:create-tab",
            label: "Create Tab",
            icon: "file-plus",
            onSelect: (event?: MouseEvent | KeyboardEvent) => {
              event?.stopPropagation();
              controller.addCreatedTab(paneId, createTab(paneId));
            },
          },
        ]
      : []),
    ...controller.emptyViewActions.items.filter(
      (action) => action.id !== "workspace-empty:create-tab",
    ),
    ...(closeTabId
      ? [
          {
            id: `workspace-empty:close:${closeTabId}`,
            label: "Close",
            onSelect: () => {
              controller.closeTab(closeTabId);
            },
          },
        ]
      : []),
  ];
}

export function createWorkspaceSidebarLinks(
  controller: WorkspaceShellController,
  paneId: string,
): WorkspaceAction[] {
  if (!nodeContains(controller.layout.main, paneId)) return [];

  return (["left", "right"] as const).flatMap((side) => {
    const links: WorkspaceAction[] = [];
    visitPanes(controller.layout[side].root, (pane) => {
      for (const item of pane.items) {
        const tab = visibleTab(item);
        if (!tab) continue;
        links.push(createSidebarLink(controller, side, pane, item, tab));
      }
    });
    return links;
  });
}

function createSidebarLink(
  controller: WorkspaceShellController,
  side: WorkspaceSide,
  pane: WorkspaceTabsNode,
  item: WorkspaceTabItem,
  tab: WorkspaceTab,
): WorkspaceAction {
  return {
    id: `workspace-empty:sidebar:${side}:${item.id}`,
    label: item.title,
    icon: item.icon ?? tab.icon,
    onSelect: () => {
      const liveSidebar = controller.layout[side];
      const livePane = findPane(liveSidebar.root, pane.id);
      if (liveSidebar.open && livePane?.activeItemId === item.id) {
        controller.setSidebarOpen(side, false);
        return;
      }
      controller.setSidebarOpen(side, true);
      controller.selectTab(tab.id);
    },
  };
}

function findPane(
  node: WorkspaceNode,
  paneId: string,
): WorkspaceTabsNode | undefined {
  if (node.kind === "tabs") return node.id === paneId ? node : undefined;
  for (const child of node.children) {
    const pane = findPane(child, paneId);
    if (pane) return pane;
  }
  return undefined;
}
