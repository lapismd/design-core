import type {
  WorkspaceDirection,
  WorkspaceLayoutV1,
  WorkspaceNode,
  WorkspaceSidebarState,
  WorkspaceSplitNode,
  WorkspaceTab,
  WorkspaceTabsNode,
} from "./types.js";

const MIN_SIDEBAR_SIZE = 220;
const MAX_SIDEBAR_SIZE = 520;

function nextId(prefix: string) {
  const value =
    globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${prefix}-${value}`;
}

function object(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function string(value: unknown, fallback: string) {
  return typeof value === "string" && value.length > 0 ? value : fallback;
}

function jsonState(value: unknown): Record<string, unknown> {
  return object(value) ?? {};
}

/** Copy JSON-safe state, including Svelte's reactive proxies. */
export function cloneWorkspaceJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function clampSidebarSize(value: unknown, fallback: number) {
  const numeric =
    typeof value === "number" && Number.isFinite(value) ? value : fallback;
  return Math.min(
    MAX_SIDEBAR_SIZE,
    Math.max(MIN_SIDEBAR_SIZE, Math.round(numeric)),
  );
}

export function normalizeSizes(sizes: unknown, count: number): number[] {
  if (count === 0) return [];
  const source = Array.isArray(sizes) ? sizes : [];
  const candidates = Array.from({ length: count }, (_, index) => {
    const value = source[index];
    return typeof value === "number" && Number.isFinite(value) && value > 0
      ? value
      : 1;
  });
  const total = candidates.reduce((sum, value) => sum + value, 0);
  return candidates.map((value) => Number(((value / total) * 100).toFixed(4)));
}

function normalizeSidebar(
  value: unknown,
  fallback: WorkspaceSidebarState,
): WorkspaceSidebarState {
  const source = object(value);
  const collapsedSource = object(source?.collapsedGroups);
  const collapsedGroups = Object.fromEntries(
    Object.entries(collapsedSource ?? {}).filter(
      ([, collapsed]) => typeof collapsed === "boolean",
    ),
  ) as Record<string, boolean>;
  return {
    open: typeof source?.open === "boolean" ? source.open : fallback.open,
    size: clampSidebarSize(source?.size, fallback.size),
    activeTabId:
      typeof source?.activeTabId === "string" ? source.activeTabId : null,
    collapsedGroups,
  };
}

function normalizeTab(value: unknown, seen: Set<string>): WorkspaceTab {
  const source = object(value);
  let id = string(source?.id, nextId("tab"));
  if (seen.has(id)) id = nextId("tab");
  seen.add(id);
  const view = object(source?.view);
  return {
    id,
    title: string(source?.title, "Untitled"),
    ...(source?.closable === false ? { closable: false } : {}),
    view: {
      type: string(view?.type, "empty"),
      state: jsonState(view?.state),
    },
  };
}

function normalizeNode(value: unknown, seen: Set<string>): WorkspaceNode {
  const source = object(value);
  const kind = source?.kind;
  let id = string(source?.id, nextId(kind === "split" ? "split" : "tabs"));
  if (seen.has(id)) id = nextId(kind === "split" ? "split" : "tabs");
  seen.add(id);

  if (kind === "split") {
    const split = source as Record<string, unknown>;
    const children = (Array.isArray(split.children) ? split.children : []).map(
      (child) => normalizeNode(child, seen),
    );
    return {
      kind: "split",
      id,
      direction: split.direction === "vertical" ? "vertical" : "horizontal",
      sizes: normalizeSizes(split.sizes, children.length),
      children,
    };
  }

  const tabs = (Array.isArray(source?.tabs) ? source.tabs : []).map((tab) =>
    normalizeTab(tab, seen),
  );
  const requested =
    typeof source?.activeTabId === "string" ? source.activeTabId : null;
  return {
    kind: "tabs",
    id,
    presentation: source?.presentation === "stacked" ? "stacked" : "top",
    activeTabId: tabs.some((tab) => tab.id === requested)
      ? requested
      : (tabs[0]?.id ?? null),
    tabs,
  };
}

export function createWorkspaceTabs(
  tabs: WorkspaceTab[] = [],
  id = nextId("tabs"),
): WorkspaceTabsNode {
  return normalizeNode(
    { kind: "tabs", id, tabs, activeTabId: tabs[0]?.id ?? null },
    new Set(),
  ) as WorkspaceTabsNode;
}

export function createWorkspaceSplit(
  direction: WorkspaceDirection,
  children: WorkspaceNode[],
  id = nextId("split"),
): WorkspaceSplitNode {
  return normalizeNode(
    { kind: "split", id, direction, children },
    new Set(),
  ) as WorkspaceSplitNode;
}

export function createWorkspaceLayout(): WorkspaceLayoutV1 {
  return {
    version: 1,
    left: { open: true, size: 280, activeTabId: null, collapsedGroups: {} },
    main: createWorkspaceTabs(),
    right: { open: false, size: 320, activeTabId: null, collapsedGroups: {} },
  };
}

/**
 * Remove empty tab groups and simplify their parent splits. A `null` result
 * means the complete tree was empty; callers can then install the root-pane
 * fallback appropriate to their context.
 */
export function pruneWorkspaceNode(node: WorkspaceNode): WorkspaceNode | null {
  if (node.kind === "tabs") return node.tabs.length > 0 ? node : null;

  const children: WorkspaceNode[] = [];
  const sizes: number[] = [];
  for (const [index, child] of node.children.entries()) {
    const pruned = pruneWorkspaceNode(child);
    if (!pruned) continue;
    children.push(pruned);
    sizes.push(node.sizes[index] ?? 1);
  }

  if (children.length === 0) return null;
  if (children.length === 1) return children[0];
  return { ...node, children, sizes: normalizeSizes(sizes, children.length) };
}

/** Repair an untrusted persisted layout into the current layout version. */
export function normalizeWorkspaceLayout(value: unknown): WorkspaceLayoutV1 {
  const source = object(value);
  const fallback = createWorkspaceLayout();
  const seen = new Set<string>();
  return {
    version: 1,
    left: normalizeSidebar(source?.left, fallback.left),
    main: normalizeNode(source?.main, seen),
    right: normalizeSidebar(source?.right, fallback.right),
  };
}

export function cloneWorkspaceLayout(
  layout: WorkspaceLayoutV1,
): WorkspaceLayoutV1 {
  return normalizeWorkspaceLayout(cloneWorkspaceJson(layout));
}

export function findWorkspaceNode(
  node: WorkspaceNode,
  id: string,
  parent: WorkspaceSplitNode | null = null,
): {
  node: WorkspaceNode;
  parent: WorkspaceSplitNode | null;
  index: number;
} | null {
  if (node.id === id) return { node, parent, index: -1 };
  if (node.kind !== "split") return null;
  for (const [index, child] of node.children.entries()) {
    if (child.id === id) return { node: child, parent: node, index };
    const found = findWorkspaceNode(child, id, node);
    if (found) return found;
  }
  return null;
}
