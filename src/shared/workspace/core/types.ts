import type { Component } from "svelte";
import type { WorkspaceMenu } from "./workspace-menu.js";

export type WorkspaceTheme = "inherit" | "light" | "dark";
export type WorkspaceDirection = "horizontal" | "vertical";
export type WorkspaceTabsPresentation = "top" | "stacked";
export type WorkspaceDropPosition =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "center";
export type WorkspaceWindowMode = "floating" | "popout";
export type WorkspaceWindowState =
  | "normal"
  | "collapsed"
  | "minimized"
  | "maximized";
export type WorkspaceDisplayMode = "desktop" | "mobile";
export type WorkspaceRequestedDisplayMode = "auto" | WorkspaceDisplayMode;
export type WorkspaceSide = "left" | "right";
/** Horizontal span used by the desktop bottom panel. */
export type WorkspaceBottomPanelAlignment =
  | "left"
  | "right"
  | "center"
  | "justify";
/** A persistent edge surface owned by the workspace layout. */
export type WorkspaceDockPosition = WorkspaceSide | "bottom";
export type WorkspaceIconName = string;

export interface WorkspaceViewState {
  type: string;
  state?: Record<string, unknown>;
}

export interface WorkspaceTab {
  kind: "tab";
  id: string;
  title: string;
  icon?: WorkspaceIconName;
  closable?: boolean;
  view: WorkspaceViewState;
}

export interface WorkspaceSidebarGroup {
  kind: "sidebar-group";
  id: string;
  title: string;
  icon?: WorkspaceIconName;
  tabs: WorkspaceTab[];
  hiddenTabIds: string[];
  collapsedByTabId: Record<string, boolean>;
  panelSizesByTabId: Record<string, number>;
}

/** Position-neutral name for the grouped-panel model used by all docks. */
export type WorkspacePanelGroup = WorkspaceSidebarGroup;

export type WorkspaceTabItem = WorkspaceTab | WorkspaceSidebarGroup;

export interface WorkspaceTabsNode {
  kind: "tabs";
  id: string;
  activeItemId: string | null;
  presentation: WorkspaceTabsPresentation;
  items: WorkspaceTabItem[];
}

export interface WorkspaceSplitNode {
  kind: "split";
  id: string;
  direction: WorkspaceDirection;
  sizes: number[];
  children: WorkspaceNode[];
}

export type WorkspaceNode = WorkspaceTabsNode | WorkspaceSplitNode;

export interface WorkspaceSidebarState {
  open: boolean;
  size: number;
  root: WorkspaceNode;
}

export interface WorkspaceBottomPanelState {
  open: boolean;
  size: number;
  root: WorkspaceTabsNode;
}

export interface WorkspaceWindowBounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface WorkspaceWindow {
  id: string;
  mode: WorkspaceWindowMode;
  state: WorkspaceWindowState;
  bounds: WorkspaceWindowBounds;
  root: WorkspaceNode;
}

export interface WorkspaceActiveState {
  hostId: "root" | string;
  paneId: string | null;
  tabId: string | null;
}

/** Transient main-workspace pane focus state. This is never serialized. */
export interface WorkspaceFocusModeState {
  tabId: string;
  paneId: string;
}

export interface WorkspaceLayoutV2 {
  version: 2;
  main: WorkspaceNode;
  left: WorkspaceSidebarState;
  right: WorkspaceSidebarState;
  windows: WorkspaceWindow[];
  active: WorkspaceActiveState;
}

export interface WorkspaceLayoutV3 {
  version: 3;
  main: WorkspaceNode;
  left: WorkspaceSidebarState;
  right: WorkspaceSidebarState;
  bottom: WorkspaceBottomPanelState;
  windows: WorkspaceWindow[];
  active: WorkspaceActiveState;
}

/** The current normalized workspace layout. */
export type WorkspaceLayout = WorkspaceLayoutV3;

export interface WorkspaceBreadcrumb {
  id: string;
  label: string;
  onSelect?: () => void;
}

export interface WorkspaceAction {
  id: string;
  label: string;
  icon?: WorkspaceIconName;
  disabled?: boolean;
  onSelect: (event?: MouseEvent | KeyboardEvent) => void | Promise<void>;
}

export interface WorkspaceViewChrome {
  /** Display title for the tab title bar; may be editable when `titleEditable`. */
  title?: string;
  /** When true, the header title is click-to-edit in place. */
  titleEditable?: boolean;
  /** Called when an editable title commits (Enter or blur). */
  onTitleCommit?: (nextTitle: string) => void | Promise<void>;
  /**
   * Parent-path segments for the open resource. Prefer omitting the leaf
   * filename here; keep that in `title` / view content.
   */
  breadcrumbs?: WorkspaceBreadcrumb[];
  canGoBack?: boolean;
  canGoForward?: boolean;
  onGoBack?: () => void | Promise<void>;
  onGoForward?: () => void | Promise<void>;
  actions?: WorkspaceAction[];
  buildPaneMenu?: (menu: WorkspaceMenu, context: WorkspaceViewContext) => void;
}

export interface WorkspaceViewContext {
  tab: WorkspaceTab;
  hostId: string;
  paneId: string;
  active: boolean;
  showInlineTitle: boolean;
  activate(): boolean;
  close(): boolean;
  setState(state: Record<string, unknown>): boolean;
}

export interface WorkspaceSvelteViewDefinition {
  kind: "svelte";
  type: string;
  component: Component<WorkspaceViewContext>;
  icon?: WorkspaceIconName;
  showHeader?: boolean;
  getChrome?: (context: WorkspaceViewContext) => WorkspaceViewChrome;
}

export interface WorkspaceImperativeViewDefinition {
  kind: "imperative";
  type: string;
  icon?: WorkspaceIconName;
  showHeader?: boolean;
  getChrome?: (context: WorkspaceViewContext) => WorkspaceViewChrome;
  mount(
    target: HTMLElement,
    context: WorkspaceViewContext,
  ): void | (() => void);
}

export type WorkspaceViewDefinition =
  | WorkspaceSvelteViewDefinition
  | WorkspaceImperativeViewDefinition;

export interface WorkspaceViewRegistry {
  register(definition: WorkspaceViewDefinition): () => void;
  resolve(type: string): WorkspaceViewDefinition | undefined;
}

export interface WorkspaceRibbonItem {
  id: string;
  side?: WorkspaceSide;
  section?: "top" | "bottom";
  priority?: number;
  label: string;
  icon: WorkspaceIconName;
  active?: boolean;
  disabled?: boolean;
  onSelect: (event?: MouseEvent | KeyboardEvent) => void | Promise<void>;
}

export interface WorkspaceStatusItem {
  id: string;
  align?: "left" | "right";
  priority?: number;
  label?: string;
  segments?: string[];
  tooltip?: string;
  icon?: WorkspaceIconName;
  busy?: boolean;
  disabled?: boolean;
  onSelect?: (event?: MouseEvent | KeyboardEvent) => void | Promise<void>;
  buildMenu?: (menu: WorkspaceMenu) => void;
}

export interface AppShellApplicationInfo {
  name: string;
  version: string;
  icon?: WorkspaceIconName;
  logoUrl?: string;
  buildTime?: string | null;
  commitHash?: string;
  copyright?: string;
}

export interface WorkspacePopoutHandle {
  readonly window: Window;
  readonly document: Document;
  focus(): void;
  close(): void;
  onClose(listener: () => void): () => void;
}

export interface WorkspacePopoutHost {
  open(input: {
    id: string;
    title: string;
    bounds: WorkspaceWindowBounds;
  }): WorkspacePopoutHandle | null;
}

export type WorkspaceChangeSource =
  | "layout-replace"
  | "layout-restore"
  | "tab-select"
  | "tab-add"
  | "tab-close"
  | "tab-move"
  | "drag-drop"
  | "split"
  | "resize"
  | "sidebar"
  | "bottom-panel"
  | "sidebar-group"
  | "view-state"
  | "window-open"
  | "window-focus"
  | "window-bounds"
  | "window-state"
  | "window-close"
  | "display-mode";

export interface WorkspaceLayoutChangeEvent {
  source: WorkspaceChangeSource;
  id?: string;
  operation?: string;
}

export interface WorkspaceCancelableEvent {
  readonly defaultPrevented: boolean;
  preventDefault(): void;
}

export interface WorkspaceLayoutDropEvent extends WorkspaceCancelableEvent {
  tabId: string;
  targetPaneId: string;
  position: WorkspaceDropPosition;
  source: "html5" | "pointer" | "api";
  operation: "tab-drop" | "split-drop";
}

export interface WorkspaceDragEvent {
  tabId: string;
  source: "html5" | "pointer";
}

export interface WorkspacePersistenceErrorEvent {
  operation: "load" | "save";
  error: unknown;
}

export interface WorkspaceEventMap {
  "active-tab-change": [tab: WorkspaceTab | null];
  "display-mode-change": [mode: WorkspaceDisplayMode];
  "focus-mode-change": [state: WorkspaceFocusModeState | null];
  resize: [id?: string];
  "layout-ready": [];
  "layout-change": [event: WorkspaceLayoutChangeEvent];
  "layout-drag-start": [event: WorkspaceDragEvent];
  "layout-drag-end": [event: WorkspaceDragEvent];
  "layout-will-show-overlay": [event: WorkspaceLayoutDropEvent];
  "layout-will-drop": [event: WorkspaceLayoutDropEvent];
  "layout-did-drop": [event: WorkspaceLayoutDropEvent];
  "persistence-error": [event: WorkspacePersistenceErrorEvent];
}

export interface WorkspaceLayoutPersistence {
  load(): Promise<unknown | null>;
  save(
    layout: WorkspaceLayout,
    event: WorkspaceLayoutChangeEvent,
  ): Promise<void>;
}

export interface WorkspaceControllerOptions {
  layout?: unknown;
  registry?: WorkspaceViewRegistry;
  persistence?: WorkspaceLayoutPersistence;
  saveDebounceMs?: number;
}
