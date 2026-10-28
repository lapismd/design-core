import {
  buildFileEntryTree,
  buildPackageFileEntryTree,
  type FileTreeNode,
} from "../core/file-tree.js";
import type {
  FileListingDirectory,
  FileListingFile,
  FileListingViewMode,
  FileListingSummary,
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
      summary: FileListingSummary;
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
  const summaries = new Map<string, FileListingSummary>();
  for (const file of files) {
    const parts = file.path.split("/");
    for (let depth = 1; depth < parts.length; depth++) {
      const path = parts.slice(0, depth).join("/");
      const summary = summaries.get(path) ?? {
        additions: 0,
        deletions: 0,
        knownFiles: 0,
        fileCount: 0,
        conflicted: false,
      };
      summary.fileCount++;
      if (file.additions !== undefined && file.deletions !== undefined) {
        summary.additions += file.additions;
        summary.deletions += file.deletions;
        summary.knownFiles++;
      }
      summary.conflicted ||= Boolean(file.conflicted);
      summaries.set(path, summary);
    }
  }

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
      summary: summaries.get(node.path) ?? {
        additions: 0,
        deletions: 0,
        knownFiles: 0,
        fileCount: 0,
        conflicted: false,
      },
    });
    if (!collapsed) {
      for (const child of node.children) visit(child, depth + 1);
    }
  };

  for (const node of tree) visit(node, 0);
  return rows;
}
