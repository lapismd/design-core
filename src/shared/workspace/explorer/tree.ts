import type { ExplorerNode, ExplorerSortMode } from "./types.js";
import { joinExplorerPath } from "./path.js";

export function compareExplorerNodes(
  left: ExplorerNode,
  right: ExplorerNode,
  sortMode: ExplorerSortMode,
): number {
  if (left.kind !== right.kind) {
    return left.kind === "folder" ? -1 : 1;
  }
  const direction = sortMode === "name-desc" ? -1 : 1;
  return (
    direction *
      (left.name.localeCompare(right.name, undefined, {
        numeric: true,
        sensitivity: "base",
      }) ||
        left.path.localeCompare(right.path, undefined, {
          numeric: true,
          sensitivity: "base",
        }))
  );
}

export function sortExplorerChildren(
  node: ExplorerNode,
  sortMode: ExplorerSortMode,
): void {
  if (node.kind !== "folder" || !node.children) return;
  node.children.sort((left, right) =>
    compareExplorerNodes(left, right, sortMode),
  );
  for (const child of node.children) {
    sortExplorerChildren(child, sortMode);
  }
}

/** Rebuild a rooted folder tree from a flat (or nested) entry list. */
export function buildExplorerTree(
  entries: ExplorerNode[],
  sortMode: ExplorerSortMode,
): ExplorerNode {
  const root: ExplorerNode = {
    path: "/",
    name: "/",
    kind: "folder",
    children: [],
  };
  const lookup = new Map<string, ExplorerNode>();
  lookup.set("", root);
  lookup.set("/", root);

  const flat: ExplorerNode[] = [];
  const visit = (node: ExplorerNode) => {
    if (node.path !== "/" && node.path !== "") {
      flat.push({
        path: node.path.replace(/^\/+|\/+$/g, ""),
        name: node.name,
        kind: node.kind,
      });
    }
    if (node.children) {
      for (const child of node.children) visit(child);
    }
  };
  for (const entry of entries) visit(entry);

  for (const entry of flat) {
    if (!entry.path) continue;
    const parts = entry.path.split("/").filter(Boolean);
    let currentPath = "";
    let parent = root;
    for (let i = 0; i < parts.length; i++) {
      const name = parts[i]!;
      currentPath = currentPath ? joinExplorerPath(currentPath, name) : name;
      const isLast = i === parts.length - 1;
      let node = lookup.get(currentPath);
      if (!node) {
        node = {
          path: currentPath,
          name,
          kind: isLast ? entry.kind : "folder",
          children: isLast && entry.kind === "file" ? undefined : [],
        };
        lookup.set(currentPath, node);
        parent.children ??= [];
        parent.children.push(node);
      } else if (isLast) {
        node.kind = entry.kind;
        node.name = name;
        if (entry.kind === "folder") {
          node.children ??= [];
        } else {
          delete node.children;
        }
      }
      parent = node;
    }
  }

  sortExplorerChildren(root, sortMode);
  return root;
}

export function findExplorerNode(
  root: ExplorerNode,
  path: string,
): ExplorerNode | undefined {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  if (!normalized || normalized === "/") return root;
  const parts = normalized.split("/");
  let current: ExplorerNode | undefined = root;
  let currentPath = "";
  for (const part of parts) {
    currentPath = currentPath ? joinExplorerPath(currentPath, part) : part;
    current = current?.children?.find((child) => child.path === currentPath);
    if (!current) return undefined;
  }
  return current;
}

export function collectFolderPaths(root: ExplorerNode): string[] {
  const paths: string[] = [];
  const visit = (node: ExplorerNode) => {
    if (node.kind === "folder" && node.path !== "/" && node.path !== "") {
      paths.push(node.path);
    }
    for (const child of node.children ?? []) visit(child);
  };
  visit(root);
  return paths;
}

export function cloneExplorerNodes(nodes: ExplorerNode[]): ExplorerNode[] {
  return nodes.map((node) => ({
    path: node.path,
    name: node.name,
    kind: node.kind,
    children: node.children ? cloneExplorerNodes(node.children) : undefined,
  }));
}
