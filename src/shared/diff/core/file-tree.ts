export interface FileTreeNode {
  name: string;
  path: string;
  type: "file" | "directory";
  children: FileTreeNode[];
}

export interface FileTreeEntry {
  path: string;
  type: "file" | "directory";
}

export function getFilePathName(path: string): string {
  return path.split("/").filter(Boolean).at(-1) ?? path;
}

export function getFileDirectory(path: string): string {
  return path.includes("/") ? path.slice(0, path.lastIndexOf("/")) : "";
}

export function buildFileTree(paths: string[]): FileTreeNode[] {
  return buildFileEntryTree(paths.map((path) => ({ path, type: "file" })));
}

export function buildFileEntryTree(
  entries: readonly FileTreeEntry[],
): FileTreeNode[] {
  const root: FileTreeNode[] = [];

  for (const entry of entries) {
    const parts = entry.path.split("/").filter(Boolean);
    let currentLevel = root;
    let currentPath = "";

    for (const [index, part] of parts.entries()) {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      const isLeaf = index === parts.length - 1;

      const type = isLeaf ? entry.type : "directory";
      let node = currentLevel.find((candidate) => candidate.name === part);
      if (!node) {
        node = {
          name: part,
          path: currentPath,
          type,
          children: [],
        };
        currentLevel.push(node);
      } else if (type === "directory" || node.children.length > 0) {
        node.type = "directory";
      }

      if (!isLeaf) {
        currentLevel = node.children;
      }
    }
  }

  function sortNodes(nodes: FileTreeNode[]): FileTreeNode[] {
    return nodes
      .map((node) => ({ ...node, children: sortNodes(node.children) }))
      .sort((left, right) => {
        if (left.type === right.type) {
          return left.name.localeCompare(right.name);
        }
        return left.type === "directory" ? -1 : 1;
      });
  }

  return sortNodes(root);
}

export function buildPackageFileTree(paths: string[]): FileTreeNode[] {
  return buildPackageFileEntryTree(
    paths.map((path) => ({ path, type: "file" })),
  );
}

export function buildPackageFileEntryTree(
  entries: readonly FileTreeEntry[],
): FileTreeNode[] {
  function compactNode(node: FileTreeNode): FileTreeNode {
    let current: FileTreeNode = {
      ...node,
      children: node.children.map(compactNode),
    };

    while (
      current.type === "directory" &&
      current.children.length === 1 &&
      current.children[0]?.type === "directory"
    ) {
      const child = current.children[0];
      current = {
        ...child,
        name: `${current.name}/${child.name}`,
        path: child.path,
      };
    }

    return current;
  }

  return buildFileEntryTree(entries).map(compactNode);
}
