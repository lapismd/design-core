import type { WorkspaceIconName } from "../core/types.js";
import type { WorkspaceMenu } from "../core/workspace-menu.js";

export type ExplorerNodeKind = "file" | "folder";

export type ExplorerSortMode = "name-asc" | "name-desc";

/** Stable path-based tree node. Paths are vault-relative; root is `"/"`. */
export interface ExplorerNode {
  path: string;
  name: string;
  kind: ExplorerNodeKind;
  children?: ExplorerNode[];
}

export interface ExplorerIconContext {
  selectedPath: string;
  opened: boolean;
  editing: boolean;
}

export interface ExplorerRevealState {
  path: string;
  isFlashing: boolean;
}

export interface ExplorerLabels {
  files: string;
  openingVault: string;
  createFile: string;
  createFolder: string;
  sortFiles: string;
  filenameAsc: string;
  filenameDesc: string;
  autoReveal: string;
  toggleCollapse: string;
  newNote: string;
  newFolder: string;
  copyPath: string;
  fromVaultFolder: string;
  rename: string;
  refresh: string;
  delete: string;
}

export const DEFAULT_EXPLORER_LABELS: ExplorerLabels = {
  files: "Files",
  openingVault: "Opening vault",
  createFile: "Create File",
  createFolder: "Create Folder",
  sortFiles: "Sort Files",
  filenameAsc: "Filename (A to Z)",
  filenameDesc: "Filename (Z to A)",
  autoReveal: "Auto-reveal current file",
  toggleCollapse: "Toggle collapse",
  newNote: "New note",
  newFolder: "New folder",
  copyPath: "Copy Path",
  fromVaultFolder: "From vault folder",
  rename: "Rename...",
  refresh: "Refresh",
  delete: "Delete",
};

export interface ExplorerTreeAdapter {
  listEntries(): Promise<ExplorerNode[]> | ExplorerNode[];
  subscribe(onChange: () => void): () => void;
}

export type ExplorerOpenDisposition =
  | "current"
  | "reveal-or-new-tab"
  | "new-tab";

export interface ExplorerOpenFileOptions {
  disposition: ExplorerOpenDisposition;
}

export interface ExplorerActionsAdapter {
  openFile(
    path: string,
    options?: ExplorerOpenFileOptions,
  ): void | Promise<void>;
  createFile(parentPath: string): Promise<string>;
  createFolder(parentPath: string): Promise<string>;
  rename(path: string, nextBaseName: string): Promise<string>;
  move(path: string, destinationFolderPath: string): Promise<string>;
  delete(path: string): Promise<void>;
  importExternalFiles?(folderPath: string, files: File[]): Promise<void>;
  copyText?(label: string, value: string): Promise<void>;
}

export interface ExplorerSelectionAdapter {
  subscribe(onActivePath: (path: string | null) => void): () => void;
}

export interface ExplorerPreferencesAdapter {
  getAutoReveal(): boolean | Promise<boolean>;
  setAutoReveal(value: boolean): void | Promise<void>;
}

export type ExplorerGetIcon = (
  node: ExplorerNode,
  context: ExplorerIconContext,
) => WorkspaceIconName | null | undefined;

export type ExplorerBuildItemMenu = (
  menu: WorkspaceMenu,
  node: ExplorerNode,
  source: "explorer",
) => void;

export type ExplorerFileDragStart = (
  node: ExplorerNode,
  event: DragEvent,
) => void;

export interface ExplorerControllerOptions {
  tree: ExplorerTreeAdapter;
  actions: ExplorerActionsAdapter;
  selection?: ExplorerSelectionAdapter;
  preferences?: ExplorerPreferencesAdapter;
  getIcon?: ExplorerGetIcon;
  buildItemMenu?: ExplorerBuildItemMenu;
  onFileDragStart?: ExplorerFileDragStart;
  labels?: Partial<ExplorerLabels>;
  /** Initial loading gate (vault still opening). */
  loading?: boolean;
  sortMode?: ExplorerSortMode;
}
