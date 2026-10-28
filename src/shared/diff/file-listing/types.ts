import type { FileTreeNode } from "../core/file-tree.js";

export type FileListingViewMode = "list" | "tree" | "package";

export interface FileListingFile {
  path: string;
  additions?: number;
  deletions?: number;
  /** Reported by the host; no conflict or filesystem queries are performed. */
  conflicted?: boolean;
}

export interface FileListingSummary {
  additions: number;
  deletions: number;
  knownFiles: number;
  fileCount: number;
  conflicted: boolean;
}

/** Host-owned directory that may be displayed before its children are loaded. */
export interface FileListingDirectory {
  path: string;
}

export interface FileListingFileContext<TFile extends FileListingFile> {
  file: TFile;
  path: string;
  name: string;
  directory: string;
  isSelected: boolean;
  mode: FileListingViewMode;
  node?: FileTreeNode;
}

export interface FileListingDirectoryContext {
  node: FileTreeNode;
  depth: number;
  isCollapsed: boolean;
  /** Counts from loaded descendants, independent of disclosure state. */
  summary?: FileListingSummary;
}
