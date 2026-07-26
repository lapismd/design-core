import {
  createDefaultWorkspaceLayout,
  createWorkspaceId,
  createWorkspaceTabs,
  findWorkspaceTab,
  normalizeWorkspaceLayout,
} from "./layout.js";
import { cloneSerializable } from "./serializable.js";
import type {
  WorkspaceLayoutV2,
  WorkspaceNode,
  WorkspaceSidebarGroup,
  WorkspaceTab,
  WorkspaceTabItem,
  WorkspaceTabsNode,
  WorkspaceWindow,
} from "./types.js";

export interface WorkspaceLeafJson {
  id: string;
  type: "leaf";
  state: {
    type: string;
    state: Record<string, unknown>;
    icon: string;
    title: string;
  };
}

export interface WorkspaceSidebarGroupJson {
  id: string;
  type: "sidebar-group";
  name: string;
  icon?: string;
  hiddenLeafIds?: string[];
  collapsed?: Record<string, boolean>;
  panelSizes?: Record<string, number>;
  children: WorkspaceLeafJson[];
}

export interface WorkspaceTabsJson {
  id: string;
  type: "tabs";
  stacked: boolean;
  children: Array<WorkspaceLeafJson | WorkspaceSidebarGroupJson>;
  currentTab: number;
}

export interface WorkspaceSplitJson {
  id: string;
  type: "split";
  direction: "horizontal" | "vertical";
  sizes: number[];
  children: Array<WorkspaceSplitJson | WorkspaceTabsJson>;
}

export interface WorkspaceSidedockJson extends WorkspaceSplitJson {
  width: string;
}

export interface WorkspaceFloatingJson
  extends Omit<WorkspaceSplitJson, "type"> {
  type: "floating";
  mode?: "floating" | "popout";
  displayState?: "collapsed" | "minimized" | "maximized";
  x: number;
  y: number;
  width: number;
  height: number;
}

/** The application-independent layout wire shape used by Lapis. */
export interface WorkspaceJson {
  main: WorkspaceSplitJson;
  left: WorkspaceSidedockJson;
  right: WorkspaceSidedockJson;
  floating?: WorkspaceFloatingJson[];
  active?: string;
}

function leafToJson(tab: WorkspaceTab): WorkspaceLeafJson {
  return {
    id: tab.id,
    type: "leaf",
    state: {
      type: tab.view.type,
      state: cloneSerializable(tab.view.state ?? {}),
      icon: tab.icon ?? "",
      title: tab.title,
    },
  };
}

function groupToJson(group: WorkspaceSidebarGroup): WorkspaceSidebarGroupJson {
  return {
    id: group.id,
    type: "sidebar-group",
    name: group.title,
    ...(group.icon ? { icon: group.icon } : {}),
    ...(group.hiddenTabIds.length
      ? { hiddenLeafIds: [...group.hiddenTabIds] }
      : {}),
    ...(Object.keys(group.collapsedByTabId).length
      ? { collapsed: { ...group.collapsedByTabId } }
      : {}),
    ...(Object.keys(group.panelSizesByTabId).length
      ? { panelSizes: { ...group.panelSizesByTabId } }
      : {}),
    children: group.tabs.map(leafToJson),
  };
}

function itemToJson(
  item: WorkspaceTabItem,
): WorkspaceLeafJson | WorkspaceSidebarGroupJson {
  return item.kind === "tab" ? leafToJson(item) : groupToJson(item);
}

function nodeToJson(
  node: WorkspaceNode,
): WorkspaceSplitJson | WorkspaceTabsJson {
  if (node.kind === "tabs") {
    const currentTab = Math.max(
      0,
      node.items.findIndex((item) => item.id === node.activeItemId),
    );
    return {
      id: node.id,
      type: "tabs",
      stacked: node.presentation === "stacked",
      children: node.items.map(itemToJson),
      currentTab,
    };
  }
  return {
    id: node.id,
    type: "split",
    direction: node.direction,
    sizes: [...node.sizes],
    children: node.children.map(nodeToJson),
  };
}

function rootSplit(node: WorkspaceNode, id: string): WorkspaceSplitJson {
  const converted = nodeToJson(node);
  return converted.type === "split"
    ? converted
    : {
        id,
        type: "split",
        direction: "vertical",
        sizes: [100],
        children: [converted],
      };
}

function windowToJson(window: WorkspaceWindow): WorkspaceFloatingJson {
  const root = rootSplit(window.root, `${window.id}-root`);
  return {
    ...root,
    id: window.id,
    type: "floating",
    mode: window.mode,
    ...(window.state !== "normal" ? { displayState: window.state } : {}),
    x: window.bounds.x,
    y: window.bounds.y,
    width: window.bounds.width,
    height: window.bounds.height,
  };
}

/** Convert the renderer's compatibility layout into the canonical wire shape. */
export function workspaceLayoutToJson(
  layout: WorkspaceLayoutV2,
): WorkspaceJson {
  return {
    main: rootSplit(layout.main, "main"),
    left: {
      ...rootSplit(layout.left.root, "left"),
      width: layout.left.open ? `${layout.left.size}px` : "0px",
    },
    right: {
      ...rootSplit(layout.right.root, "right"),
      width: layout.right.open ? `${layout.right.size}px` : "0px",
    },
    ...(layout.windows.length
      ? { floating: layout.windows.map(windowToJson) }
      : {}),
    ...(layout.active.tabId ? { active: layout.active.tabId } : {}),
  };
}

function record(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function string(value: unknown, fallback: string): string {
  return typeof value === "string" && value ? value : fallback;
}

function number(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function leafFromJson(value: unknown): WorkspaceTab | null {
  const input = record(value);
  if (!input || input.type !== "leaf") return null;
  const state = record(input.state) ?? {};
  return {
    kind: "tab",
    id: string(input.id, createWorkspaceId("leaf")),
    title: string(state.title, "New Tab"),
    ...(typeof state.icon === "string" && state.icon
      ? { icon: state.icon }
      : {}),
    closable: true,
    view: {
      type: string(state.type, "empty"),
      state: record(state.state) ?? {},
    },
  };
}

function groupFromJson(value: unknown): WorkspaceSidebarGroup | null {
  const input = record(value);
  if (!input || input.type !== "sidebar-group") return null;
  const tabs = (Array.isArray(input.children) ? input.children : [])
    .map(leafFromJson)
    .filter((tab): tab is WorkspaceTab => Boolean(tab));
  const ids = new Set(tabs.map((tab) => tab.id));
  const hiddenTabIds = (
    Array.isArray(input.hiddenLeafIds) ? input.hiddenLeafIds : []
  ).filter((id): id is string => typeof id === "string" && ids.has(id));
  const collapsed = record(input.collapsed) ?? {};
  const panelSizes = record(input.panelSizes) ?? {};
  return {
    kind: "sidebar-group",
    id: string(input.id, createWorkspaceId("sidebar-group")),
    title: string(input.name, tabs[0]?.title ?? "Group"),
    ...(typeof input.icon === "string" && input.icon
      ? { icon: input.icon }
      : {}),
    tabs,
    hiddenTabIds,
    collapsedByTabId: Object.fromEntries(
      tabs.map((tab) => [tab.id, Boolean(collapsed[tab.id])]),
    ),
    panelSizesByTabId: Object.fromEntries(
      tabs.map((tab) => [
        tab.id,
        number(panelSizes[tab.id], 100 / tabs.length),
      ]),
    ),
  };
}

function tabsFromJson(value: unknown): WorkspaceTabsNode | null {
  const input = record(value);
  if (!input || input.type !== "tabs") return null;
  const items = (Array.isArray(input.children) ? input.children : [])
    .map((child) => {
      const childRecord = record(child);
      return childRecord?.type === "sidebar-group"
        ? groupFromJson(child)
        : leafFromJson(child);
    })
    .filter((item): item is WorkspaceTabItem => Boolean(item));
  const index = Math.min(
    Math.max(0, Math.trunc(number(input.currentTab, 0))),
    Math.max(0, items.length - 1),
  );
  return {
    kind: "tabs",
    id: string(input.id, createWorkspaceId("tabs")),
    presentation: input.stacked === true ? "stacked" : "top",
    activeItemId: items[index]?.id ?? null,
    items,
  };
}

function nodeFromJson(value: unknown): WorkspaceNode | null {
  const input = record(value);
  if (!input) return null;
  if (input.type === "tabs") return tabsFromJson(value);
  if (input.type !== "split" && input.type !== "floating") return null;
  const children = (Array.isArray(input.children) ? input.children : [])
    .map(nodeFromJson)
    .filter((child): child is WorkspaceNode => Boolean(child));
  if (!children.length) return null;
  return {
    kind: "split",
    id: string(input.id, createWorkspaceId("split")),
    direction: input.direction === "horizontal" ? "horizontal" : "vertical",
    sizes: children.map((_, index) =>
      number(Array.isArray(input.sizes) ? input.sizes[index] : undefined, 50),
    ),
    children,
  };
}

function sidedockFromJson(
  value: unknown,
  fallback: WorkspaceLayoutV2["left"],
): WorkspaceLayoutV2["left"] {
  const input = record(value);
  const width = input && typeof input.width === "string" ? input.width : "";
  const parsedWidth = Number.parseFloat(width);
  return {
    open: !/^0(?:px|rem|em|%)?$/.test(width.trim()),
    size:
      Number.isFinite(parsedWidth) && parsedWidth > 0
        ? parsedWidth
        : fallback.size,
    root:
      nodeFromJson(value) ??
      createWorkspaceTabs([], {
        id: string(input?.id, createWorkspaceId("sidebar-tabs")),
      }),
  };
}

function windowFromJson(value: unknown): WorkspaceWindow | null {
  const input = record(value);
  if (!input || input.type !== "floating") return null;
  if (input.mode === "popout") return null;
  const root = nodeFromJson({ ...input, type: "split" });
  if (!root) return null;
  const displayState = input.displayState;
  return {
    id: string(input.id, createWorkspaceId("window")),
    mode: "floating",
    state:
      displayState === "collapsed" ||
      displayState === "minimized" ||
      displayState === "maximized"
        ? displayState
        : "normal",
    bounds: {
      x: number(input.x, 100),
      y: number(input.y, 100),
      width: number(input.width, 800),
      height: number(input.height, 600),
    },
    root,
  };
}

export function isWorkspaceJson(value: unknown): value is WorkspaceJson {
  const input = record(value);
  return Boolean(
    input &&
      record(input.main)?.type === "split" &&
      record(input.left)?.type === "split" &&
      record(input.right)?.type === "split",
  );
}

/**
 * Convert canonical Lapis workspace JSON or the former V2 shape into the
 * renderer model. Popouts are intentionally discarded during restoration.
 */
export function workspaceLayoutFromJson(
  value: unknown,
  fallback: WorkspaceLayoutV2 = createDefaultWorkspaceLayout(),
): WorkspaceLayoutV2 {
  if (!isWorkspaceJson(value)) return normalizeWorkspaceLayout(value, fallback);
  const main = nodeFromJson(value.main) ?? fallback.main;
  const windows = (value.floating ?? [])
    .map(windowFromJson)
    .filter((window): window is WorkspaceWindow => Boolean(window));
  const layout = normalizeWorkspaceLayout({
    version: 2,
    main,
    left: sidedockFromJson(value.left, fallback.left),
    right: sidedockFromJson(value.right, fallback.right),
    windows,
    active: { hostId: "root", paneId: null, tabId: value.active ?? null },
  });
  if (value.active) {
    const active = findWorkspaceTab(layout, value.active);
    if (active) {
      layout.active = {
        hostId: active.hostId,
        paneId: active.pane.id,
        tabId: active.tab.id,
      };
    }
  }
  return layout;
}
