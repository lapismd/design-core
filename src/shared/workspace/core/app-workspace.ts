import {
  createWorkspaceId,
  createWorkspaceTab,
  findWorkspacePane,
  findWorkspaceTab,
  walkWorkspacePanes,
} from "./layout.js";
import type {
  WorkspaceBottomPanelAlignment,
  WorkspaceDropPosition,
  WorkspaceDockPosition,
  WorkspaceEventMap,
  WorkspaceLayoutChangeEvent,
  WorkspaceSide,
  WorkspaceTab,
  WorkspaceWindow,
  WorkspaceWindowBounds,
} from "./types.js";
import type { WorkspaceEventRef } from "./event-dispatcher.js";
import type { WorkspaceShellController } from "./workspace-controller.svelte.js";
import {
  workspaceLayoutFromJson,
  workspaceLayoutToJson,
  type WorkspaceJson,
} from "./workspace-json.js";
import { WorkspaceLeaf, type WorkspaceViewManager } from "./workspace-view.js";
import type { ConfigurationSchema } from "../settings/configuration.js";
import {
  compareEditorAssociationPatternSpecificity,
  matchesEditorAssociationGlob,
  type EditorViewRegistry,
  type RegisteredEditorViewContribution,
} from "./editor-view-registry.js";
import { APP_SHELL_SETTING_IDS } from "./built-in-settings.svelte.js";

export interface OpenWorkspaceLeafOptions {
  paneId?: string;
  title?: string;
  icon?: string;
  closable?: boolean;
  active?: boolean;
}

export interface OpenWorkspaceResourceOptions extends OpenWorkspaceLeafOptions {
  viewType?: string;
  state?: Record<string, unknown>;
}

export interface EditorAssociationMatch {
  pattern: string;
  editorViewId: string;
  view?: RegisteredEditorViewContribution;
}

export interface WorkspaceResourceOpenError {
  path: string;
  reason: "empty-path" | "no-editor-view";
}

export type WorkspaceSplitDirection = "left" | "right" | "top" | "bottom";

/**
 * Public, serializable workspace façade. The package renderer continues to use
 * its compatibility controller internally while applications receive this
 * Lapis-shaped API.
 */
export class AppWorkspace {
  constructor(
    /** @internal */
    readonly renderer: WorkspaceShellController,
    readonly views?: WorkspaceViewManager,
    readonly editorViews?: EditorViewRegistry,
    readonly configuration?: ConfigurationSchema,
    readonly onResourceOpenError?: (event: WorkspaceResourceOpenError) => void,
  ) {}

  get layoutReady(): boolean {
    return this.renderer.layoutReady;
  }

  get activeLeaf(): WorkspaceLeaf | null {
    return this.renderer.activeTabId
      ? new WorkspaceLeaf(this.renderer, this.renderer.activeTabId)
      : null;
  }

  get activeWindow(): WorkspaceWindow | null {
    return this.renderer.activeWindow;
  }

  get focusMode() {
    return this.renderer.focusMode;
  }

  getLeafById(id: string): WorkspaceLeaf | null {
    return findWorkspaceTab(this.renderer.layout, id)
      ? new WorkspaceLeaf(this.renderer, id)
      : null;
  }

  getLeavesOfType(type: string): WorkspaceLeaf[] {
    const leaves: WorkspaceLeaf[] = [];
    walkWorkspacePanes(this.renderer.layout, (pane) => {
      for (const item of pane.items) {
        const tabs = item.kind === "tab" ? [item] : item.tabs;
        for (const tab of tabs) {
          if (tab.view.type === type) {
            leaves.push(new WorkspaceLeaf(this.renderer, tab.id));
          }
        }
      }
    });
    return leaves;
  }

  openLeaf(
    type: string,
    state: Record<string, unknown> = {},
    options: OpenWorkspaceLeafOptions = {},
  ): WorkspaceLeaf | null {
    const pane =
      (options.paneId
        ? findWorkspacePane(this.renderer.layout, options.paneId)
        : null) ??
      (this.renderer.activePaneId
        ? findWorkspacePane(this.renderer.layout, this.renderer.activePaneId)
        : null) ??
      this.#firstPane();
    if (!pane) return null;
    const tab = createWorkspaceTab({
      id: createWorkspaceId("leaf"),
      title: options.title ?? "New Tab",
      icon: options.icon,
      closable: options.closable,
      view: { type, state },
    });
    if (!this.renderer.addTab(pane.id, tab, options.active ?? true))
      return null;
    return new WorkspaceLeaf(this.renderer, tab.id);
  }

  openInBottomPanel(
    type: string,
    state: Record<string, unknown> = {},
    options: Omit<OpenWorkspaceLeafOptions, "paneId"> = {},
  ): WorkspaceLeaf | null {
    const leaf = this.openLeaf(type, state, {
      ...options,
      paneId: this.renderer.layout.bottom.root.id,
    });
    if (leaf) this.renderer.setDockOpen("bottom", true);
    return leaf;
  }

  setBottomPanelOpen(open: boolean): void {
    this.renderer.setDockOpen("bottom", open);
  }

  setBottomPanelSize(size: number): void {
    this.renderer.setDockSize("bottom", size);
  }

  toggleBottomPanel(): void {
    this.setBottomPanelOpen(!this.renderer.layout.bottom.open);
  }

  /** The configured horizontal span for the desktop bottom panel. */
  get bottomPanelAlignment(): WorkspaceBottomPanelAlignment {
    const value = this.configuration?.get<WorkspaceBottomPanelAlignment>(
      APP_SHELL_SETTING_IDS.bottomPanelAlignment,
    );
    return value === "left" ||
      value === "right" ||
      value === "justify" ||
      value === "center"
      ? value
      : "center";
  }

  /** Update the persisted desktop bottom-panel alignment setting. */
  setBottomPanelAlignment(alignment: WorkspaceBottomPanelAlignment): boolean {
    return (
      this.configuration?.set(
        APP_SHELL_SETTING_IDS.bottomPanelAlignment,
        alignment,
      ) ?? false
    );
  }

  getEditorAssociationForPath(path: string): EditorAssociationMatch | null {
    const associations =
      this.configuration?.get<Record<string, string>>(
        APP_SHELL_SETTING_IDS.editorAssociations,
      ) ?? {};
    return (
      Object.entries(associations)
        .map(([pattern, editorViewId], index) => ({
          pattern,
          editorViewId,
          index,
        }))
        .filter(
          ({ pattern, editorViewId }) =>
            typeof editorViewId === "string" &&
            editorViewId.trim().length > 0 &&
            matchesEditorAssociationGlob(pattern, path),
        )
        .sort((left, right) => {
          const specificity = compareEditorAssociationPatternSpecificity(
            right.pattern,
            left.pattern,
          );
          return specificity || right.index - left.index;
        })
        .map(({ pattern, editorViewId }) => ({
          pattern,
          editorViewId,
          view: this.editorViews?.get(editorViewId),
        }))[0] ?? null
    );
  }

  determineViewTypeForPath(path: string): string | null {
    const normalizedPath = path.trim();
    if (!normalizedPath) return null;
    const association = this.getEditorAssociationForPath(normalizedPath);
    if (association?.view && this.views?.resolve(association.view.viewType)) {
      return association.view.viewType;
    }
    const priority = { option: 0, default: 1, exclusive: 2 };
    return (
      this.editorViews
        ?.getAll()
        .flatMap((view, viewIndex) =>
          view.filenamePatterns
            .filter((pattern) =>
              matchesEditorAssociationGlob(pattern, normalizedPath),
            )
            .map((pattern) => ({ view, viewIndex, pattern })),
        )
        .filter(({ view }) => Boolean(this.views?.resolve(view.viewType)))
        .sort((left, right) => {
          const priorityDelta =
            priority[right.view.priority] - priority[left.view.priority];
          if (priorityDelta !== 0) return priorityDelta;
          const specificity = compareEditorAssociationPatternSpecificity(
            right.pattern,
            left.pattern,
          );
          return specificity || left.viewIndex - right.viewIndex;
        })[0]?.view.viewType ?? null
    );
  }

  openResource(
    path: string,
    options: OpenWorkspaceResourceOptions = {},
  ): WorkspaceLeaf | null {
    const normalizedPath = path.trim().replace(/\\+/gu, "/");
    if (!normalizedPath) {
      this.onResourceOpenError?.({ path, reason: "empty-path" });
      return null;
    }
    const viewType =
      options.viewType ?? this.determineViewTypeForPath(normalizedPath);
    if (!viewType || !this.views?.resolve(viewType)) {
      this.onResourceOpenError?.({
        path: normalizedPath,
        reason: "no-editor-view",
      });
      return null;
    }
    const title =
      options.title ??
      normalizedPath.split("/").filter(Boolean).at(-1) ??
      normalizedPath;
    return this.openLeaf(
      viewType,
      { ...options.state, resourcePath: normalizedPath },
      { ...options, title },
    );
  }

  createLeafBySplit(
    reference: WorkspaceLeaf | string,
    direction: WorkspaceSplitDirection = "right",
    type = "empty",
    state: Record<string, unknown> = {},
  ): WorkspaceLeaf | null {
    const id = typeof reference === "string" ? reference : reference.id;
    const location = findWorkspaceTab(this.renderer.layout, id);
    if (!location) return null;
    const tab = createWorkspaceTab({
      title: "New Tab",
      view: { type, state },
    });
    return this.renderer.splitPane(location.pane.id, direction, tab)
      ? new WorkspaceLeaf(this.renderer, tab.id)
      : null;
  }

  splitActiveLeaf(
    direction: WorkspaceSplitDirection = "right",
    type = "empty",
    state: Record<string, unknown> = {},
  ): WorkspaceLeaf | null {
    return this.renderer.activeTabId
      ? this.createLeafBySplit(
          this.renderer.activeTabId,
          direction,
          type,
          state,
        )
      : null;
  }

  revealLeaf(leafOrId: WorkspaceLeaf | string): boolean {
    const id = typeof leafOrId === "string" ? leafOrId : leafOrId.id;
    return this.renderer.selectTab(id);
  }

  setActiveLeaf(leafOrId: WorkspaceLeaf | string): boolean {
    return this.revealLeaf(leafOrId);
  }

  enterFocusMode(leaf: WorkspaceLeaf | null = this.activeLeaf): boolean {
    return this.renderer.enterFocusMode(leaf?.id ?? null);
  }

  exitFocusMode(): boolean {
    return this.renderer.exitFocusMode();
  }

  clearFocusModeForLeaf(leaf: WorkspaceLeaf): boolean {
    return this.renderer.clearFocusModeForTab(leaf.id);
  }

  closeLeaf(leafOrId: WorkspaceLeaf | string): boolean {
    const id = typeof leafOrId === "string" ? leafOrId : leafOrId.id;
    return this.renderer.closeTab(id);
  }

  moveLeaf(
    leafOrId: WorkspaceLeaf | string,
    targetPaneId: string,
    position: WorkspaceDropPosition = "center",
    targetIndex?: number,
  ): boolean {
    const id = typeof leafOrId === "string" ? leafOrId : leafOrId.id;
    return this.renderer.dropTab(
      id,
      targetPaneId,
      position,
      "api",
      targetIndex,
    );
  }

  groupSidebarTabs(
    side: WorkspaceSide,
    leafIds: string[],
    options?: { id?: string; title?: string; icon?: string },
  ) {
    return this.renderer.groupSidebarTabs(side, leafIds, options);
  }

  groupDockTabs(
    position: WorkspaceDockPosition,
    leafIds: string[],
    options?: { id?: string; title?: string; icon?: string },
  ) {
    return this.renderer.groupDockTabs(position, leafIds, options);
  }

  ungroupSidebarGroup(groupId: string): WorkspaceLeaf[] {
    return this.renderer
      .ungroupSidebarGroup(groupId)
      .map((tab) => new WorkspaceLeaf(this.renderer, tab.id));
  }

  floatLeaf(
    leafOrId: WorkspaceLeaf | string,
    bounds?: Partial<WorkspaceWindowBounds>,
  ): WorkspaceWindow | null {
    const id = typeof leafOrId === "string" ? leafOrId : leafOrId.id;
    return this.renderer.floatTab(id, bounds);
  }

  popoutLeaf(leafOrId: WorkspaceLeaf | string): WorkspaceWindow | null {
    const id = typeof leafOrId === "string" ? leafOrId : leafOrId.id;
    return this.renderer.popoutTab(id);
  }

  redockWindow(windowId: string, targetPaneId: string): boolean {
    return this.renderer.dockWindow(windowId, targetPaneId);
  }

  getLayout(): WorkspaceJson {
    return workspaceLayoutToJson(this.renderer.getLayout());
  }

  toJSON(): WorkspaceJson {
    return this.getLayout();
  }

  changeLayout(
    value: unknown,
    event: WorkspaceLayoutChangeEvent = { source: "layout-replace" },
  ): void {
    this.renderer.changeLayout(
      workspaceLayoutFromJson(value, this.renderer.layout),
      event,
    );
  }

  restoreLayout(): Promise<void> {
    return this.renderer.restoreLayout();
  }

  requestSaveLayout(event: WorkspaceLayoutChangeEvent): void {
    this.renderer.requestSaveLayout(event);
  }

  flushSave(): Promise<void> {
    return this.renderer.flushSave();
  }

  on<Name extends keyof WorkspaceEventMap>(
    name: Name,
    listener: (...args: WorkspaceEventMap[Name]) => void,
  ): WorkspaceEventRef<WorkspaceEventMap, Name> {
    return this.renderer.on(name, listener);
  }

  once<Name extends keyof WorkspaceEventMap>(
    name: Name,
    listener: (...args: WorkspaceEventMap[Name]) => void,
  ): WorkspaceEventRef<WorkspaceEventMap, Name> {
    return this.renderer.once(name, listener);
  }

  off<Name extends keyof WorkspaceEventMap>(
    name: Name,
    listener: (...args: WorkspaceEventMap[Name]) => void,
  ): void {
    this.renderer.off(name, listener);
  }

  #firstPane() {
    let first: ReturnType<typeof findWorkspacePane> = null;
    walkWorkspacePanes(this.renderer.layout, (pane) => {
      first ??= pane;
    });
    return first;
  }
}
