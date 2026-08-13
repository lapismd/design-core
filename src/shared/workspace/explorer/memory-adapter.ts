import {
  basenameExplorerPath,
  dirnameExplorerPath,
  joinExplorerPath,
} from "./path.js";
import { cloneExplorerNodes } from "./tree.js";
import type {
  ExplorerActionsAdapter,
  ExplorerNode,
  ExplorerOpenFileOptions,
  ExplorerPreferencesAdapter,
  ExplorerSelectionAdapter,
  ExplorerTreeAdapter,
} from "./types.js";

export interface MemoryExplorerBundle {
  tree: ExplorerTreeAdapter;
  actions: ExplorerActionsAdapter;
  selection: ExplorerSelectionAdapter;
  preferences: ExplorerPreferencesAdapter;
  readonly nodes: ExplorerNode[];
  readonly openedPaths: string[];
  readonly openRequests: Array<{
    path: string;
    options: ExplorerOpenFileOptions;
  }>;
  setActivePath(path: string | null): void;
  setAutoRevealValue(value: boolean): void;
}

function listSiblingNames(nodes: ExplorerNode[], parentPath: string): string[] {
  return ensureFolder(nodes, parentPath).map((node) => node.name);
}

function uniqueName(existing: string[], base: string): string {
  if (!existing.includes(base)) return base;
  let index = 1;
  while (existing.includes(`${base} ${index}`)) index += 1;
  return `${base} ${index}`;
}

function removeNode(nodes: ExplorerNode[], path: string): ExplorerNode | null {
  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i]!;
    if (node.path === path) {
      nodes.splice(i, 1);
      return node;
    }
    if (node.children) {
      const removed = removeNode(node.children, path);
      if (removed) return removed;
    }
  }
  return null;
}

function findNode(
  nodes: ExplorerNode[],
  path: string,
): ExplorerNode | undefined {
  for (const node of nodes) {
    if (node.path === path) return node;
    if (node.children) {
      const found = findNode(node.children, path);
      if (found) return found;
    }
  }
  return undefined;
}

function ensureFolder(
  nodes: ExplorerNode[],
  folderPath: string,
): ExplorerNode[] {
  if (!folderPath || folderPath === "/") return nodes;
  const parts = folderPath.split("/").filter(Boolean);
  let current = nodes;
  let currentPath = "";
  for (const part of parts) {
    currentPath = currentPath ? joinExplorerPath(currentPath, part) : part;
    let folder = current.find(
      (node) => node.path === currentPath && node.kind === "folder",
    );
    if (!folder) {
      folder = {
        path: currentPath,
        name: part,
        kind: "folder",
        children: [],
      };
      current.push(folder);
    }
    folder.children ??= [];
    current = folder.children;
  }
  return current;
}

function rewriteSubtree(node: ExplorerNode, nextPath: string): ExplorerNode {
  const next: ExplorerNode = {
    ...node,
    path: nextPath,
    name: basenameExplorerPath(nextPath) || node.name,
  };
  if (next.kind === "folder") {
    next.children = (node.children ?? []).map((child) =>
      rewriteSubtree(child, joinExplorerPath(nextPath, child.name)),
    );
  } else {
    delete next.children;
  }
  return next;
}

export function createMemoryExplorerAdapter(
  seed: ExplorerNode[] = [],
  options: { autoReveal?: boolean } = {},
): MemoryExplorerBundle {
  let nodes = cloneExplorerNodes(seed);
  const treeListeners = new Set<() => void>();
  const selectionListeners = new Set<(path: string | null) => void>();
  let autoReveal = options.autoReveal ?? false;
  let activePath: string | null = null;
  const openedPaths: string[] = [];
  const openRequests: Array<{
    path: string;
    options: ExplorerOpenFileOptions;
  }> = [];

  const notifyTree = () => {
    for (const listener of treeListeners) listener();
  };

  const notifySelection = () => {
    for (const listener of selectionListeners) listener(activePath);
  };

  const actions: ExplorerActionsAdapter = {
    async openFile(path, options = { disposition: "current" }) {
      openRequests.push({ path, options });
      if (!openedPaths.includes(path)) openedPaths.push(path);
      activePath = path;
      notifySelection();
    },
    async createFile(parentPath) {
      const siblings = listSiblingNames(nodes, parentPath);
      const stemNames = siblings.map((name) => name.replace(/\.md$/i, ""));
      const base = uniqueName(stemNames, "Untitled");
      const name = `${base}.md`;
      const path = joinExplorerPath(parentPath, name);
      ensureFolder(nodes, parentPath).push({ path, name, kind: "file" });
      notifyTree();
      await actions.openFile(path);
      return path;
    },
    async createFolder(parentPath) {
      const siblings = listSiblingNames(nodes, parentPath);
      const name = uniqueName(siblings, "Untitled");
      const path = joinExplorerPath(parentPath, name);
      ensureFolder(nodes, parentPath).push({
        path,
        name,
        kind: "folder",
        children: [],
      });
      notifyTree();
      return path;
    },
    async rename(path, nextBaseName) {
      const parent = dirnameExplorerPath(path);
      const nextPath = joinExplorerPath(parent, nextBaseName);
      if (nextPath === path) return path;
      const removed = removeNode(nodes, path);
      if (!removed) throw new Error(`Missing path: ${path}`);
      ensureFolder(nodes, parent).push(rewriteSubtree(removed, nextPath));
      if (activePath === path || activePath?.startsWith(`${path}/`)) {
        activePath =
          activePath === path
            ? nextPath
            : `${nextPath}${activePath.slice(path.length)}`;
        notifySelection();
      }
      notifyTree();
      return nextPath;
    },
    async move(path, destinationFolderPath) {
      const destination = destinationFolderPath.replace(/^\/+|\/+$/g, "");
      if (dirnameExplorerPath(path) === destination) return path;
      const removed = removeNode(nodes, path);
      if (!removed) throw new Error(`Missing path: ${path}`);
      const nextPath = joinExplorerPath(destination, removed.name);
      ensureFolder(nodes, destination).push(rewriteSubtree(removed, nextPath));
      if (activePath === path || activePath?.startsWith(`${path}/`)) {
        activePath =
          activePath === path
            ? nextPath
            : `${nextPath}${activePath!.slice(path.length)}`;
        notifySelection();
      }
      notifyTree();
      return nextPath;
    },
    async delete(path) {
      const node = findNode(nodes, path);
      if (!node) return;
      if (node.kind === "folder" && (node.children?.length ?? 0) > 0) {
        throw new Error("Cannot delete a non-empty folder");
      }
      removeNode(nodes, path);
      if (activePath === path) {
        activePath = null;
        notifySelection();
      }
      notifyTree();
    },
    async importExternalFiles(folderPath, files) {
      const target = ensureFolder(nodes, folderPath);
      for (const file of files) {
        const path = joinExplorerPath(folderPath, file.name);
        if (!findNode(nodes, path)) {
          target.push({ path, name: file.name, kind: "file" });
        }
      }
      notifyTree();
    },
    async copyText(_label, value) {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(value);
      }
    },
  };

  return {
    tree: {
      listEntries() {
        return cloneExplorerNodes(nodes);
      },
      subscribe(onChange) {
        treeListeners.add(onChange);
        return () => treeListeners.delete(onChange);
      },
    },
    actions,
    selection: {
      subscribe(onActivePath) {
        selectionListeners.add(onActivePath);
        onActivePath(activePath);
        return () => selectionListeners.delete(onActivePath);
      },
    },
    preferences: {
      getAutoReveal() {
        return autoReveal;
      },
      setAutoReveal(value) {
        autoReveal = value;
      },
    },
    get nodes() {
      return cloneExplorerNodes(nodes);
    },
    get openedPaths() {
      return [...openedPaths];
    },
    get openRequests() {
      return openRequests.map((request) => ({
        path: request.path,
        options: { ...request.options },
      }));
    },
    setActivePath(path) {
      activePath = path;
      notifySelection();
    },
    setAutoRevealValue(value) {
      autoReveal = value;
    },
  };
}
