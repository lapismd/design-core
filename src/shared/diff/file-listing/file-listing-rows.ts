import {
  buildFileEntryTree,
  buildPackageFileEntryTree,
  type FileTreeNode,
} from "../core/file-tree.js";
import type {
  FileListingDirectory,
  FileListingFile,
  FileListingViewMode,
} from "./types.js";

export type FileListingRow<TFile extends FileListingFile = FileListingFile> =
  | {
      kind: "file";
      key: string;
      path: string;
      depth?: number;
      file: TFile;
      node?: FileTreeNode;
    }
  | {
      kind: "directory";
      key: string;
      path: string;
      depth: number;
      node: FileTreeNode;
      collapsed: boolean;
    };

export function fileListingRows<TFile extends FileListingFile>(
  files: readonly TFile[],
  mode: FileListingViewMode,
  collapsedDirectoryPaths: ReadonlySet<string>,
  directories: readonly FileListingDirectory[] = [],
): FileListingRow<TFile>[] {
  if (mode === "list") {
    return [...files]
      .sort((left, right) => left.path.localeCompare(right.path))
      .map((file) => ({
        kind: "file" as const,
        key: `file:${file.path}`,
        path: file.path,
        file,
      }));
  }

  const filesByPath = new Map(files.map((file) => [file.path, file]));
  const entries = [
    ...directories.map((directory) => ({
      path: directory.path,
      type: "directory" as const,
    })),
    ...files.map((file) => ({ path: file.path, type: "file" as const })),
  ];
  const tree =
    mode === "package"
      ? buildPackageFileEntryTree(entries)
      : buildFileEntryTree(entries);
  const rows: FileListingRow<TFile>[] = [];

  const visit = (node: FileTreeNode, depth: number): void => {
    if (node.type === "file") {
      const file = filesByPath.get(node.path);
      if (file) {
        rows.push({
          kind: "file",
          key: `file:${node.path}`,
          path: node.path,
          depth,
          file,
          node,
        });
      }
      return;
    }

    const collapsed = collapsedDirectoryPaths.has(node.path);
    rows.push({
      kind: "directory",
      key: `directory:${node.path}`,
      path: node.path,
      depth,
      node,
      collapsed,
    });
    if (!collapsed) {
      for (const child of node.children) visit(child, depth + 1);
    }
  };

  for (const node of tree) visit(node, 0);
  return rows;
}
