import type { Component } from "svelte";

/** Axis used by a workspace split. Horizontal is left-to-right. */
export type WorkspaceDirection = "horizontal" | "vertical";

/** A resizable left or right shell region. `size` is measured in CSS pixels. */
export interface WorkspaceSidebarState {
  open: boolean;
  size: number;
  /** Selected icon-tab ID, when the sidebar renders a tab strip. */
  activeTabId: string | null;
  /** Group IDs persisted as collapsed for this sidebar. */
  collapsedGroups: Record<string, boolean>;
}

/** An icon action displayed in the workspace's left-hand action ribbon. */
export interface WorkspaceAction {
  id: string;
  /** Accessible name for the icon-only button. */
  label: string;
  icon: Component;
  onSelect(): void;
  disabled?: boolean;
  pressed?: boolean;
}

/** A consumer-defined, persistently collapsible sidebar section. */
export interface WorkspaceSidebarGroup {
  id: string;
  title: string;
  icon?: Component;
  /** Optional controls rendered at the trailing edge of the group header. */
  actions?: readonly WorkspaceAction[];
}

/** A consumer-defined icon-only tab in a left or right sidebar. */
export interface WorkspaceSidebarTab {
  id: string;
  /** Accessible label and tooltip for the icon-only trigger. */
  label: string;
  icon: Component;
  disabled?: boolean;
}

/** Visual treatment used by a main workspace tab group. */
export type WorkspaceTabsPresentation = "top" | "stacked";

/** Serialized state supplied to a renderer registered for `type`. */
export interface WorkspaceViewState<State = Record<string, unknown>> {
  type: string;
  state: State;
}

/** A single closable view in a tab group. */
export interface WorkspaceTab<State = Record<string, unknown>> {
  id: string;
  title: string;
  closable?: boolean;
  view: WorkspaceViewState<State>;
}

/** A tab group inside the recursive workspace tree. */
export interface WorkspaceTabsNode {
  kind: "tabs";
  id: string;
  activeTabId: string | null;
  presentation: WorkspaceTabsPresentation;
  tabs: WorkspaceTab[];
}

/** Navigation control rendered in a shared workspace view header. */
export interface WorkspaceViewNavigationAction {
  label: string;
  onSelect(): void;
  disabled?: boolean;
}

/** An optional parent location rendered before a workspace view title. */
export interface WorkspaceViewBreadcrumb {
  /** Stable key for rendering repeated labels. Defaults to `label`. */
  id?: string;
  label: string;
  onSelect?: () => void;
  disabled?: boolean;
}

/** A split whose sizes are percentages aligned with its children. */
export interface WorkspaceSplitNode {
  kind: "split";
  id: string;
  direction: WorkspaceDirection;
  sizes: number[];
  children: WorkspaceNode[];
}

export type WorkspaceNode = WorkspaceSplitNode | WorkspaceTabsNode;

/** Drop target selected while dragging a workspace tab over a pane body. */
export type WorkspaceDropPosition =
  | "left"
  | "right"
  | "top"
  | "bottom"
  | "center";

export type WorkspaceDropZone = Exclude<WorkspaceDropPosition, "center">;

/** Versioned JSON-safe workspace layout. */
export interface WorkspaceLayoutV1 {
  version: 1;
  left: WorkspaceSidebarState;
  main: WorkspaceNode;
  right: WorkspaceSidebarState;
}

export type WorkspaceChangeSource =
  | "layout-replace"
  | "tab-select"
  | "tab-add"
  | "tab-close"
  | "tab-move"
  | "tab-presentation"
  | "split"
  | "resize"
  | "sidebar"
  | "sidebar-group"
  | "sidebar-tab"
  | "view-state";

export interface WorkspaceChangeEvent {
  source: WorkspaceChangeSource;
  id?: string;
}

export interface WorkspaceViewContext {
  tab: WorkspaceTab;
  active: boolean;
  setState(state: Record<string, unknown>): void;
  close(): void;
}

export type WorkspaceSvelteView = Component<WorkspaceViewContext>;

export interface WorkspaceSvelteViewDefinition {
  kind: "svelte";
  type: string;
  component: WorkspaceSvelteView;
  /** Optional non-serializable icon rendered by tab chrome for this view type. */
  icon?: Component;
}

export interface WorkspaceImperativeViewDefinition {
  kind: "imperative";
  type: string;
  /** Optional non-serializable icon rendered by tab chrome for this view type. */
  icon?: Component;
  mount(
    target: HTMLElement,
    context: WorkspaceViewContext,
  ): void | (() => void);
}

export type WorkspaceViewDefinition =
  | WorkspaceSvelteViewDefinition
  | WorkspaceImperativeViewDefinition;

export interface WorkspaceControllerOptions {
  layout?: unknown;
  registry?: WorkspaceViewRegistry;
  onChange?: (layout: WorkspaceLayoutV1, event: WorkspaceChangeEvent) => void;
}

/** Public registry interface; implemented in `view-registry.ts`. */
export interface WorkspaceViewRegistry {
  register(definition: WorkspaceViewDefinition): () => void;
  resolve(type: string): WorkspaceViewDefinition | undefined;
}
