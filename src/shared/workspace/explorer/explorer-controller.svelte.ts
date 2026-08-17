import { SvelteSet } from "svelte/reactivity";
import { WorkspaceMenu } from "../core/workspace-menu.js";
import type { WorkspaceIconName } from "../core/types.js";
import {
  ancestorExplorerPaths,
  dirnameExplorerPath,
  joinExplorerPath,
} from "./path.js";
import {
  buildExplorerTree,
  collectFolderPaths,
  findExplorerNode,
} from "./tree.js";
import {
  DEFAULT_EXPLORER_LABELS,
  type ExplorerBuildItemMenu,
  type ExplorerControllerOptions,
  type ExplorerFileDragStart,
  type ExplorerGetIcon,
  type ExplorerLabels,
  type ExplorerNode,
  type ExplorerOpenFileOptions,
  type ExplorerRevealState,
  type ExplorerSortMode,
} from "./types.js";

export class ExplorerController {
  root = $state<ExplorerNode>({
    path: "/",
    name: "/",
    kind: "folder",
    children: [],
  });
  loading = $state(false);
  selectedPath = $state("");
  expandedPaths = new SvelteSet<string>();
  editingPath = $state<string | null>(null);
  sortMode = $state<ExplorerSortMode>("name-asc");
  dropTargetPath = $state<string | null>(null);
  /** Path currently being dragged within the explorer (HTML5 session). */
  draggingPath = $state<string | null>(null);
  revealState = $state<ExplorerRevealState>({ path: "", isFlashing: false });
  autoReveal = $state(false);
  labels: ExplorerLabels;

  readonly #tree;
  readonly #actions;
  readonly #selection;
  readonly #preferences;
  readonly #getIcon?: ExplorerGetIcon;
  readonly #buildItemMenu?: ExplorerBuildItemMenu;
  readonly #onFileDragStart?: ExplorerFileDragStart;
  #unsubscribers: Array<() => void> = [];
  #menuCache = new Map<string, WorkspaceMenu>();
  #started = false;

  constructor(options: ExplorerControllerOptions) {
    this.#tree = options.tree;
    this.#actions = options.actions;
    this.#selection = options.selection;
    this.#preferences = options.preferences;
    this.#getIcon = options.getIcon;
    this.#buildItemMenu = options.buildItemMenu;
    this.#onFileDragStart = options.onFileDragStart;
    this.labels = { ...DEFAULT_EXPLORER_LABELS, ...options.labels };
    this.loading = options.loading ?? false;
    this.sortMode = options.sortMode ?? "name-asc";
    if (!this.loading) {
      const entries = this.#tree.listEntries();
      if (!isThenable(entries)) {
        this.root = buildExplorerTree(entries, this.sortMode);
      }
    }
  }

  get actions() {
    return this.#actions;
  }

  get onFileDragStart() {
    return this.#onFileDragStart;
  }

  /** Wire subscriptions and load the initial tree. Call from component mount. */
  start(): () => void {
    if (this.#started) return () => this.stop();
    this.#started = true;

    this.#unsubscribers.push(
      this.#tree.subscribe(() => {
        void this.refresh();
      }),
    );

    if (this.#selection) {
      this.#unsubscribers.push(
        this.#selection.subscribe((path) => {
          const alreadySelected = Boolean(path) && this.selectedPath === path;
          this.selectedPath = path ?? "";
          if (this.autoReveal && path) {
            this.revealPath(path, { flash: !alreadySelected });
          }
        }),
      );
    }

    void this.#hydratePreferences().then(() => {
      if (!this.loading) {
        void this.refresh();
      }
    });

    return () => this.stop();
  }

  stop(): void {
    for (const unsubscribe of this.#unsubscribers) unsubscribe();
    this.#unsubscribers = [];
    this.#started = false;
  }

  setLoading(loading: boolean): void {
    this.loading = loading;
    if (!loading) void this.refresh();
  }

  async refresh(): Promise<void> {
    const entries = await this.#tree.listEntries();
    this.root = buildExplorerTree(entries, this.sortMode);
    this.#menuCache.clear();
  }

  setSortMode(mode: ExplorerSortMode): void {
    this.sortMode = mode;
    void this.refresh();
  }

  setSelectedPath(path: string): void {
    this.selectedPath = path;
  }

  /** Clear item selection so creates/drops target the vault root. */
  selectRoot(): void {
    this.selectedPath = "";
  }

  setExpanded(path: string, open: boolean): void {
    if (open) this.expandedPaths.add(path);
    else this.expandedPaths.delete(path);
  }

  isExpanded(path: string): boolean {
    return this.expandedPaths.has(path);
  }

  toggleCollapseAll(): void {
    if (this.expandedPaths.size > 0) {
      this.expandedPaths.clear();
      return;
    }
    for (const path of collectFolderPaths(this.root)) {
      this.expandedPaths.add(path);
    }
  }

  beginRename(path: string): void {
    if (path === "/" || path === "") return;
    this.editingPath = path;
  }

  cancelRename(): void {
    this.editingPath = null;
  }

  revealPath(path: string, options?: { flash?: boolean }): void {
    if (!path || path === "/") {
      this.revealState = { path: "", isFlashing: false };
      return;
    }
    const segments = path.split("/").filter(Boolean);
    for (let i = 1; i < segments.length; i++) {
      this.expandedPaths.add(segments.slice(0, i).join("/"));
    }
    const node = findExplorerNode(this.root, path);
    if (node?.kind === "folder") {
      this.expandedPaths.add(path);
    }
    for (const ancestor of ancestorExplorerPaths(path)) {
      const ancestorNode = findExplorerNode(this.root, ancestor);
      if (ancestorNode?.kind === "folder") this.expandedPaths.add(ancestor);
    }
    this.selectedPath = path;
    this.revealState = { path, isFlashing: options?.flash !== false };
  }

  clearRevealFlash(): void {
    this.revealState = { ...this.revealState, isFlashing: false };
  }

  async toggleAutoReveal(): Promise<void> {
    const next = !this.autoReveal;
    this.autoReveal = next;
    await this.#preferences?.setAutoReveal(next);
    if (next && this.selectedPath) {
      this.revealPath(this.selectedPath);
    }
  }

  parentPathForCreate(): string {
    const selected = this.selectedPath || "/";
    if (!selected || selected === "/") return "";
    const node = findExplorerNode(this.root, selected);
    if (node?.kind === "folder") return selected;
    return dirnameExplorerPath(selected);
  }

  async createFile(parentPath?: string): Promise<string> {
    const parent = parentPath ?? this.parentPathForCreate();
    const path = await this.#actions.createFile(parent);
    this.expandedPaths.add(dirnameExplorerPath(path) || parent);
    this.selectedPath = path;
    await this.refresh();
    return path;
  }

  async createFolder(parentPath?: string): Promise<string> {
    const parent = parentPath ?? this.parentPathForCreate();
    const path = await this.#actions.createFolder(parent);
    if (parent) this.expandedPaths.add(parent);
    this.selectedPath = path;
    await this.refresh();
    this.beginRename(path);
    return path;
  }

  async openFile(
    path: string,
    options: ExplorerOpenFileOptions = { disposition: "current" },
  ): Promise<void> {
    this.selectedPath = path;
    await this.#actions.openFile(path, options);
  }

  async commitRename(path: string, nextBaseName: string): Promise<void> {
    if (this.editingPath !== path) return;
    this.editingPath = null;
    const node = findExplorerNode(this.root, path);
    if (!node || !nextBaseName || nextBaseName === node.name) return;
    const nextPath = await this.#actions.rename(path, nextBaseName);
    this.selectedPath = nextPath;
    await this.refresh();
  }

  async deleteNode(path: string): Promise<void> {
    const node = findExplorerNode(this.root, path);
    if (!node) return;
    if (node.kind === "folder" && (node.children?.length ?? 0) > 0) return;
    await this.#actions.delete(path);
    if (this.selectedPath === path) this.selectedPath = "";
    await this.refresh();
  }

  async moveNode(path: string, destinationFolderPath: string): Promise<void> {
    await this.#actions.move(path, destinationFolderPath);
    if (destinationFolderPath) {
      this.expandedPaths.add(destinationFolderPath);
    }
    await this.refresh();
  }

  async importExternalFiles(folderPath: string, files: File[]): Promise<void> {
    if (!this.#actions.importExternalFiles || files.length === 0) return;
    await this.#actions.importExternalFiles(folderPath, files);
    this.expandedPaths.add(folderPath);
    await this.refresh();
  }

  async copyVaultPath(path: string): Promise<void> {
    const label = this.labels.fromVaultFolder;
    if (this.#actions.copyText) {
      await this.#actions.copyText(label, path);
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(path);
    }
  }

  iconFor(node: ExplorerNode, editing: boolean): WorkspaceIconName {
    const resolved = this.#getIcon?.(node, {
      selectedPath: this.selectedPath,
      opened: node.kind === "folder" && this.expandedPaths.has(node.path),
      editing,
    });
    if (resolved) return resolved;
    return node.kind === "folder" ? "folder" : "file";
  }

  createSortMenu(): WorkspaceMenu {
    const menu = new WorkspaceMenu().setOnHide(() => {
      menu.open = false;
    });
    for (const option of [
      { value: "name-asc" as const, label: this.labels.filenameAsc },
      { value: "name-desc" as const, label: this.labels.filenameDesc },
    ]) {
      menu.addItem((item) =>
        item
          .setTitle(option.label)
          .setChecked(this.sortMode === option.value)
          .onClick(() => {
            this.setSortMode(option.value);
          }),
      );
    }
    return menu;
  }

  createItemMenu(node: ExplorerNode): WorkspaceMenu {
    const cached = this.#menuCache.get(node.path);
    if (cached) return cached;

    const menu = new WorkspaceMenu();
    const parentForCreate =
      node.kind === "folder" ? node.path : dirnameExplorerPath(node.path);

    menu
      .addItem((item) =>
        item.setTitle(this.labels.newNote).onClick(() => {
          void this.createFile(parentForCreate);
        }),
      )
      .addItem((item) =>
        item.setTitle(this.labels.newFolder).onClick(() => {
          void this.createFolder(parentForCreate);
        }),
      )
      .addMenu(this.labels.copyPath, (submenu) => {
        submenu.addItem((item) =>
          item.setTitle(this.labels.fromVaultFolder).onClick(() => {
            void this.copyVaultPath(node.path === "/" ? "/" : node.path);
          }),
        );
      });

    if (node.path !== "/" && node.path !== "") {
      menu.addSeparator().addItem((item) =>
        item.setTitle(this.labels.rename).onClick(() => {
          this.beginRename(node.path);
        }),
      );
    }

    menu.addSeparator().addItem((item) =>
      item.setTitle(this.labels.refresh).onClick(() => {
        void this.refresh();
      }),
    );

    const canDelete =
      node.path !== "/" &&
      node.path !== "" &&
      (node.kind === "file" ||
        (node.kind === "folder" && (node.children?.length ?? 0) === 0));
    if (canDelete) {
      menu.addItem((item) =>
        item.setTitle(this.labels.delete).onClick(() => {
          void this.deleteNode(node.path);
        }),
      );
    }

    this.#buildItemMenu?.(menu, node, "explorer");
    this.#menuCache.set(node.path, menu);
    return menu;
  }

  invalidateMenus(): void {
    this.#menuCache.clear();
  }

  /** Join helper exposed for hosts / stories. */
  joinPath(...parts: string[]): string {
    return joinExplorerPath(...parts);
  }

  async #hydratePreferences(): Promise<void> {
    if (!this.#preferences) return;
    this.autoReveal = await this.#preferences.getAutoReveal();
  }
}

function isThenable<T>(value: T | Promise<T>): value is Promise<T> {
  return (
    typeof value === "object" &&
    value !== null &&
    "then" in value &&
    typeof (value as Promise<T>).then === "function"
  );
}
