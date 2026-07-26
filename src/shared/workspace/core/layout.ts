import type {
  WorkspaceLayoutV2,
  WorkspaceNode,
  WorkspaceSidebarGroup,
  WorkspaceSidebarState,
  WorkspaceSplitNode,
  WorkspaceTab,
  WorkspaceTabItem,
  WorkspaceTabsNode,
  WorkspaceWindow,
} from "./types.js";

let generatedId = 0;

export function createWorkspaceId(prefix: string): string {
  generatedId += 1;
  return `${prefix}-${generatedId.toString(36)}`;
}

export function cloneWorkspaceLayout(
  layout: WorkspaceLayoutV2,
): WorkspaceLayoutV2 {
  return JSON.parse(JSON.stringify(layout)) as WorkspaceLayoutV2;
}

export function createWorkspaceTab(
  input: Partial<WorkspaceTab> & Pick<WorkspaceTab, "title">,
): WorkspaceTab {
  return {
    kind: "tab",
    id: input.id ?? createWorkspaceId("tab"),
    title: input.title,
    icon: input.icon,
    closable: input.closable ?? true,
    view: input.view ?? { type: "empty", state: {} },
  };
}

export function createWorkspaceTabs(
  items: WorkspaceTabItem[] = [],
  input: Partial<Omit<WorkspaceTabsNode, "kind" | "items">> = {},
): WorkspaceTabsNode {
  return {
    kind: "tabs",
    id: input.id ?? createWorkspaceId("pane"),
    activeItemId: input.activeItemId ?? items[0]?.id ?? null,
    presentation: input.presentation ?? "top",
    items,
  };
}

export function createDefaultWorkspaceLayout(): WorkspaceLayoutV2 {
  const tab = createWorkspaceTab({
    id: "welcome",
    title: "No file is open",
    icon: "file",
    view: { type: "empty", state: {} },
  });
  return {
    version: 2,
    main: createWorkspaceTabs([tab], { id: "main-pane" }),
    left: {
      open: false,
      size: 300,
      root: createWorkspaceTabs([], { id: "left-sidebar" }),
    },
    right: {
      open: false,
      size: 300,
      root: createWorkspaceTabs([], { id: "right-sidebar" }),
    },
    windows: [],
    active: { hostId: "root", paneId: "main-pane", tabId: tab.id },
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function finiteNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeSizes(value: unknown, length: number): number[] {
  if (length === 0) return [];
  const equal = 100 / length;
  if (!Array.isArray(value) || value.length !== length) {
    return Array.from({ length }, () => equal);
  }
  const values = value.map((entry) => Math.max(1, finiteNumber(entry, equal)));
  const total = values.reduce((sum, entry) => sum + entry, 0);
  return values.map((entry) => (entry / total) * 100);
}

function uniqueId(raw: unknown, prefix: string, ids: Set<string>): string {
  const requested = stringValue(raw, createWorkspaceId(prefix));
  if (!ids.has(requested)) {
    ids.add(requested);
    return requested;
  }
  let candidate = createWorkspaceId(prefix);
  while (ids.has(candidate)) candidate = createWorkspaceId(prefix);
  ids.add(candidate);
  return candidate;
}

function normalizeTab(value: unknown, ids: Set<string>): WorkspaceTab {
  const record = isRecord(value) ? value : {};
  const title = stringValue(record.title, "No file is open");
  const viewRecord = isRecord(record.view) ? record.view : {};
  return {
    kind: "tab",
    id: uniqueId(record.id, "tab", ids),
    title,
    icon: typeof record.icon === "string" ? record.icon : undefined,
    closable: typeof record.closable === "boolean" ? record.closable : true,
    view: {
      type: stringValue(viewRecord.type, "empty"),
      state: isRecord(viewRecord.state) ? viewRecord.state : {},
    },
  };
}

function normalizeGroup(
  value: unknown,
  ids: Set<string>,
): WorkspaceSidebarGroup {
  const record = isRecord(value) ? value : {};
  const tabs = Array.isArray(record.tabs)
    ? record.tabs.map((tab) => normalizeTab(tab, ids))
    : [];
  const tabIds = new Set(tabs.map((tab) => tab.id));
  const hiddenTabIds = Array.isArray(record.hiddenTabIds)
    ? record.hiddenTabIds.filter(
        (id): id is string => typeof id === "string" && tabIds.has(id),
      )
    : [];
  const collapsedRecord = isRecord(record.collapsedByTabId)
    ? record.collapsedByTabId
    : {};
  const sizesRecord = isRecord(record.panelSizesByTabId)
    ? record.panelSizesByTabId
    : {};
  const collapsedByTabId: Record<string, boolean> = {};
  const panelSizesByTabId: Record<string, number> = {};
  for (const tab of tabs) {
    collapsedByTabId[tab.id] = collapsedRecord[tab.id] === true;
    panelSizesByTabId[tab.id] = Math.max(
      1,
      finiteNumber(sizesRecord[tab.id], 100),
    );
  }
  return {
    kind: "sidebar-group",
    id: uniqueId(record.id, "group", ids),
    title: stringValue(record.title, "Group"),
    icon: typeof record.icon === "string" ? record.icon : undefined,
    tabs,
    hiddenTabIds,
    collapsedByTabId,
    panelSizesByTabId,
  };
}

function normalizeTabs(value: unknown, ids: Set<string>): WorkspaceTabsNode {
  const record = isRecord(value) ? value : {};
  const items = Array.isArray(record.items)
    ? record.items.map((item) =>
        isRecord(item) && item.kind === "sidebar-group"
          ? normalizeGroup(item, ids)
          : normalizeTab(item, ids),
      )
    : [];
  const requestedActive =
    typeof record.activeItemId === "string" ? record.activeItemId : null;
  return {
    kind: "tabs",
    id: uniqueId(record.id, "pane", ids),
    activeItemId: items.some((item) => item.id === requestedActive)
      ? requestedActive
      : (items[0]?.id ?? null),
    presentation: record.presentation === "stacked" ? "stacked" : "top",
    items,
  };
}

function normalizeNode(value: unknown, ids: Set<string>): WorkspaceNode {
  if (isRecord(value) && value.kind === "split") {
    const children = Array.isArray(value.children)
      ? value.children.map((child) => normalizeNode(child, ids))
      : [];
    if (children.length < 2) {
      return children[0] ?? normalizeTabs({}, ids);
    }
    return {
      kind: "split",
      id: uniqueId(value.id, "split", ids),
      direction: value.direction === "vertical" ? "vertical" : "horizontal",
      sizes: normalizeSizes(value.sizes, children.length),
      children,
    };
  }
  return normalizeTabs(value, ids);
}

function normalizeSidebar(
  value: unknown,
  ids: Set<string>,
  fallbackId: string,
): WorkspaceSidebarState {
  const record = isRecord(value) ? value : {};
  const root = normalizeNode(
    isRecord(record.root) ? record.root : { id: fallbackId },
    ids,
  );
  return {
    open: record.open === true,
    size: Math.min(640, Math.max(180, finiteNumber(record.size, 300))),
    root,
  };
}

function normalizeWindow(value: unknown, ids: Set<string>): WorkspaceWindow {
  const record = isRecord(value) ? value : {};
  const bounds = isRecord(record.bounds) ? record.bounds : {};
  const state = ["collapsed", "minimized", "maximized"].includes(
    String(record.state),
  )
    ? (record.state as WorkspaceWindow["state"])
    : "normal";
  return {
    id: uniqueId(record.id, "window", ids),
    mode: record.mode === "popout" ? "popout" : "floating",
    state,
    bounds: {
      x: Math.max(0, finiteNumber(bounds.x, 120)),
      y: Math.max(0, finiteNumber(bounds.y, 100)),
      width: Math.max(280, finiteNumber(bounds.width, 560)),
      height: Math.max(180, finiteNumber(bounds.height, 420)),
    },
    root: normalizeNode(record.root, ids),
  };
}

export function normalizeWorkspaceLayout(
  value: unknown,
  fallback = createDefaultWorkspaceLayout(),
): WorkspaceLayoutV2 {
  if (!isRecord(value) || value.version !== 2) {
    return cloneWorkspaceLayout(fallback);
  }
  const ids = new Set<string>();
  const main = normalizeNode(value.main, ids);
  const left = normalizeSidebar(value.left, ids, "left-sidebar");
  const right = normalizeSidebar(value.right, ids, "right-sidebar");
  const windows = Array.isArray(value.windows)
    ? value.windows.map((entry) => normalizeWindow(entry, ids))
    : [];
  const activeRecord = isRecord(value.active) ? value.active : {};
  const layout: WorkspaceLayoutV2 = {
    version: 2,
    main,
    left,
    right,
    windows,
    active: {
      hostId: stringValue(activeRecord.hostId, "root"),
      paneId:
        typeof activeRecord.paneId === "string" ? activeRecord.paneId : null,
      tabId: typeof activeRecord.tabId === "string" ? activeRecord.tabId : null,
    },
  };
  const activeTab = layout.active.tabId
    ? findWorkspaceTab(layout, layout.active.tabId)
    : null;
  if (!activeTab) {
    const first = firstWorkspaceTab(layout);
    layout.active = first
      ? { hostId: first.hostId, paneId: first.pane.id, tabId: first.tab.id }
      : { hostId: "root", paneId: null, tabId: null };
  }
  return layout;
}

export interface WorkspaceTabLocation {
  hostId: string;
  pane: WorkspaceTabsNode;
  item: WorkspaceTabItem;
  tab: WorkspaceTab;
  group?: WorkspaceSidebarGroup;
}

export function walkWorkspacePanes(
  layout: WorkspaceLayoutV2,
  visitor: (pane: WorkspaceTabsNode, hostId: string) => void,
): void {
  const walk = (node: WorkspaceNode, hostId: string) => {
    if (node.kind === "tabs") {
      visitor(node, hostId);
      return;
    }
    node.children.forEach((child) => walk(child, hostId));
  };
  walk(layout.main, "root");
  walk(layout.left.root, "root");
  walk(layout.right.root, "root");
  layout.windows.forEach((workspaceWindow) =>
    walk(workspaceWindow.root, workspaceWindow.id),
  );
}

export function findWorkspacePane(
  layout: WorkspaceLayoutV2,
  paneId: string,
): WorkspaceTabsNode | null {
  let found: WorkspaceTabsNode | null = null;
  walkWorkspacePanes(layout, (pane) => {
    if (pane.id === paneId) found = pane;
  });
  return found;
}

export function findWorkspaceTab(
  layout: WorkspaceLayoutV2,
  tabId: string,
): WorkspaceTabLocation | null {
  let found: WorkspaceTabLocation | null = null;
  walkWorkspacePanes(layout, (pane, hostId) => {
    for (const item of pane.items) {
      if (item.kind === "tab" && item.id === tabId) {
        found = { hostId, pane, item, tab: item };
        return;
      }
      if (item.kind === "sidebar-group") {
        const tab = item.tabs.find((candidate) => candidate.id === tabId);
        if (tab) found = { hostId, pane, item, tab, group: item };
      }
    }
  });
  return found;
}

export function firstWorkspaceTab(
  layout: WorkspaceLayoutV2,
): WorkspaceTabLocation | null {
  let first: WorkspaceTabLocation | null = null;
  walkWorkspacePanes(layout, (pane, hostId) => {
    if (first) return;
    for (const item of pane.items) {
      if (item.kind === "tab") {
        first = { hostId, pane, item, tab: item };
        return;
      }
      const tab = item.tabs.find(
        (candidate) => !item.hiddenTabIds.includes(candidate.id),
      );
      if (tab) {
        first = { hostId, pane, item, tab, group: item };
        return;
      }
    }
  });
  return first;
}

export function replaceWorkspaceNode(
  root: WorkspaceNode,
  nodeId: string,
  replacement: WorkspaceNode,
): WorkspaceNode {
  if (root.id === nodeId) return replacement;
  if (root.kind === "tabs") return root;
  return {
    ...root,
    children: root.children.map((child) =>
      replaceWorkspaceNode(child, nodeId, replacement),
    ),
  };
}

export function normalizeWorkspaceTree(node: WorkspaceNode): WorkspaceNode {
  if (node.kind === "tabs") return node;
  const children = node.children.map(normalizeWorkspaceTree);
  if (children.length === 1) return children[0];
  return {
    ...node,
    children,
    sizes: normalizeSizes(node.sizes, children.length),
  };
}

export function createWorkspaceSplit(
  direction: WorkspaceSplitNode["direction"],
  children: WorkspaceNode[],
  sizes?: number[],
): WorkspaceSplitNode {
  return {
    kind: "split",
    id: createWorkspaceId("split"),
    direction,
    children,
    sizes: normalizeSizes(sizes, children.length),
  };
}
