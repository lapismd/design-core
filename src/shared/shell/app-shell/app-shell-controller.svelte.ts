import {
  APP_SHELL_LAYOUT_VERSION,
  type AppShellLayoutChangeEvent,
  type AppShellLayoutChangeSource,
  type AppShellLayoutPersistence,
  type AppShellLayoutV1,
  type AppShellPersistenceErrorEvent,
  type AppShellSidebarLayout,
} from "./app-shell-persistence.js";

export type AppShellSide = "left" | "right";
export type AppShellSidebarState = "expanded" | "collapsed" | "closed";
export type AppShellDisplayMode = "auto" | "desktop" | "mobile";
export type AppShellResolvedDisplayMode = Exclude<AppShellDisplayMode, "auto">;
export type AppShellMobileStage = "left" | "main" | "right";
export type AppShellMobilePanelKind = "sidebar" | "body-sidebar";
export type AppShellConstrainedPresentation = "preview" | "replace-main";

export interface AppShellMobilePanelRegistration {
  /** Stable id used by mobile selectors and targeted toggle actions. */
  readonly id: string;
  /** Edge lane that owns this panel. */
  readonly side: AppShellSide;
  /** Human-readable selector and landmark label. */
  readonly label: string;
  /** Whether the panel comes from the outer shell or the document body. */
  readonly kind: AppShellMobilePanelKind;
  /** Current panel landmark, when mounted in a browser. */
  readonly element?: HTMLElement | null;
  /** Lower values leave inline desktop flow before higher values. */
  readonly constraintPriority?: number;
  /** Presentation used when protected main width displaces this panel. */
  readonly constrainedPresentation?: AppShellConstrainedPresentation;
}

export interface AppShellSurfaceLayerRegistration {
  /** Unique mounted layer owner. Only one may be active per root. */
  readonly token: symbol;
  /** Sidebar ids included in the covered, inert surface. */
  readonly coverPanelIds: readonly string[];
  /** Sidebar ids removed transiently without changing durable layout. */
  readonly suspendPanelIds: readonly string[];
}

export const APP_SHELL_DEFAULT_SIDEBAR_WIDTH = 288;
export const APP_SHELL_DEFAULT_SIDEBAR_MIN_WIDTH = 220;
export const APP_SHELL_DEFAULT_SIDEBAR_MAX_WIDTH = 520;

export interface AppShellControllerOptions {
  /** Start the left sidebar as a persistent collapsed icon rail. */
  leftCollapsed?: boolean;
  /** Start the right sidebar as a persistent collapsed icon rail. */
  rightCollapsed?: boolean;
  /** Start the left sidebar completely closed. */
  leftClosed?: boolean;
  /** Start the right sidebar completely closed. */
  rightClosed?: boolean;
  /** Initial explicit left width in CSS pixels. The width token is used when omitted. */
  leftWidth?: number;
  /** Initial explicit right width in CSS pixels. The width token is used when omitted. */
  rightWidth?: number;
  /** Minimum expanded width for both resizable sidebars. */
  sidebarMinWidth?: number;
  /** Maximum expanded width for both resizable sidebars. */
  sidebarMaxWidth?: number;
  /** Optional async adapter used to restore and save the sidebar layout. */
  persistence?: AppShellLayoutPersistence;
  /** Debounce applied to automatic layout saves. Defaults to 200ms. */
  saveDebounceMs?: number;
  /** Receives recoverable adapter load and save failures. */
  onPersistenceError?: (event: AppShellPersistenceErrorEvent) => void;
}

export interface AppShellSidebarControllerOptions {
  /** Initial explicit width in CSS pixels. */
  width?: number;
  /** Minimum expanded width in CSS pixels. */
  minWidth?: number;
  /** Maximum expanded width in CSS pixels. */
  maxWidth?: number;
}

export interface AppShellRegisteredSidebarOptions
  extends AppShellSidebarControllerOptions {
  /** Start the registered panel as a persistent collapsed icon rail. */
  collapsed?: boolean;
  /** Start the registered panel completely closed. */
  closed?: boolean;
}

/**
 * Owns transient mobile presentation without mutating durable desktop layout.
 *
 * Panel registration order determines the order of the mobile edge selector.
 */
export class AppShellMobileController {
  resolvedMode = $state<AppShellResolvedDisplayMode>("desktop");
  stage = $state<AppShellMobileStage>("main");
  activeLeftPanelId = $state<string | undefined>(undefined);
  activeRightPanelId = $state<string | undefined>(undefined);

  #panels = $state<AppShellMobilePanelRegistration[]>([]);
  #leftPanelHost = $state<HTMLElement | null>(null);
  #rightPanelHost = $state<HTMLElement | null>(null);
  #mainHost = $state<HTMLElement | null>(null);
  #mainElement = $state<HTMLElement | null>(null);
  #rootElement = $state<HTMLElement | null>(null);
  #returnFocus: HTMLElement | null = null;

  get panels(): readonly AppShellMobilePanelRegistration[] {
    return this.#panels;
  }

  panelsFor(side: AppShellSide): readonly AppShellMobilePanelRegistration[] {
    return this.#panels.filter((panel) => panel.side === side);
  }

  activePanelId(side: AppShellSide): string | undefined {
    return side === "left" ? this.activeLeftPanelId : this.activeRightPanelId;
  }

  activePanel(side: AppShellSide): AppShellMobilePanelRegistration | undefined {
    const activeId = this.activePanelId(side);
    return this.#panels.find(
      (panel) => panel.side === side && panel.id === activeId,
    );
  }

  setResolvedMode(mode: AppShellResolvedDisplayMode): void {
    if (this.resolvedMode === mode) return;
    this.resolvedMode = mode;
    this.showMain(false);
  }

  registerPanel(registration: AppShellMobilePanelRegistration): () => void {
    const id = registration.id.trim();
    if (!id) {
      throw new TypeError("App Shell mobile panel ids must not be empty.");
    }
    const existing = this.#panels.find((panel) => panel.id === id);
    if (existing) {
      throw new Error(`App Shell mobile panel "${id}" is already registered.`);
    }

    const panel =
      id === registration.id ? registration : { ...registration, id };
    this.#panels = [...this.#panels, panel];
    this.#ensureActivePanel(panel.side);

    return () => {
      if (!this.#panels.some((candidate) => candidate.id === id)) return;
      this.#panels = this.#panels.filter((candidate) => candidate.id !== id);
      this.#ensureActivePanel(panel.side);
      if (
        this.stage === panel.side &&
        this.panelsFor(panel.side).length === 0
      ) {
        this.showMain();
      }
    };
  }

  selectPanel(side: AppShellSide, panelId: string): void {
    const panel = this.#panels.find(
      (candidate) => candidate.side === side && candidate.id === panelId,
    );
    if (!panel) {
      throw new Error(
        `App Shell mobile ${side} panel "${panelId}" is not registered.`,
      );
    }
    if (side === "left") this.activeLeftPanelId = panel.id;
    else this.activeRightPanelId = panel.id;
  }

  show(
    side: AppShellSide,
    panelId?: string,
    returnFocus?: HTMLElement | null,
  ): void {
    const panels = this.panelsFor(side);
    if (panels.length === 0) return;
    if (panelId) this.selectPanel(side, panelId);
    else this.#ensureActivePanel(side);
    if (returnFocus) this.#returnFocus = returnFocus;
    this.#rootElement?.focus({ preventScroll: true });
    this.stage = side;
    queueMicrotask(() => this.activePanel(side)?.element?.focus());
  }

  showMain(restoreFocus = true): void {
    const focusTarget = this.#returnFocus ?? this.#mainElement;
    this.#rootElement?.focus({ preventScroll: true });
    this.stage = "main";
    if (restoreFocus) queueMicrotask(() => focusTarget?.focus());
    this.#returnFocus = null;
  }

  /** @internal Install the current root's mobile panel lane host. */
  setPanelHost(side: AppShellSide, element: HTMLElement | null): void {
    if (side === "left") this.#leftPanelHost = element;
    else this.#rightPanelHost = element;
  }

  /** @internal Return the mounted lane host for a compound panel. */
  getPanelHost(side: AppShellSide): HTMLElement | null {
    return side === "left" ? this.#leftPanelHost : this.#rightPanelHost;
  }

  /** @internal Install the current root's mobile main lane host. */
  setMainHost(element: HTMLElement | null): void {
    this.#mainHost = element;
  }

  /** @internal Return the mounted main lane host. */
  getMainHost(): HTMLElement | null {
    return this.#mainHost;
  }

  /** @internal Register the main landmark as the mobile focus fallback. */
  setMainElement(element: HTMLElement | null): void {
    this.#mainElement = element;
  }

  /** @internal Return the mounted main landmark. */
  getMainElement(): HTMLElement | null {
    return this.#mainElement;
  }

  /** @internal Register the root as a safe focus waypoint between lanes. */
  setRootElement(element: HTMLElement | null): void {
    this.#rootElement = element;
  }

  /** @internal Return the mounted shell root. */
  getRootElement(): HTMLElement | null {
    return this.#rootElement;
  }

  #ensureActivePanel(side: AppShellSide): void {
    const panels = this.panelsFor(side);
    const current = this.activePanelId(side);
    const next = panels.some((panel) => panel.id === current)
      ? current
      : panels[0]?.id;
    if (side === "left") this.activeLeftPanelId = next;
    else this.activeRightPanelId = next;
  }
}

type AppShellSidebarLayoutChangeSource = Exclude<
  AppShellLayoutChangeSource,
  "register" | "unregister"
>;
type AppShellSidebarLayoutChangeListener = (
  source: AppShellSidebarLayoutChangeSource,
) => void;
type AppShellProjectionChangeListener = () => void;

/** Reactive state for one side of an App Shell. */
export class AppShellSidebarController {
  readonly side: AppShellSide;
  readonly minWidth: number;
  readonly maxWidth: number;
  collapsed = $state(false);
  closed = $state(false);
  previewed = $state(false);
  width = $state<number | undefined>(undefined);
  private previewTimer: ReturnType<typeof setTimeout> | undefined;
  private previewDismissTimer: ReturnType<typeof setTimeout> | undefined;
  readonly #layoutChangeListeners =
    new Set<AppShellSidebarLayoutChangeListener>();

  constructor(
    side: AppShellSide,
    collapsed = false,
    options: AppShellSidebarControllerOptions & { closed?: boolean } = {},
  ) {
    this.side = side;
    this.collapsed = collapsed;
    this.closed = options.closed ?? false;
    this.minWidth = Math.round(
      options.minWidth ?? APP_SHELL_DEFAULT_SIDEBAR_MIN_WIDTH,
    );
    this.maxWidth = Math.round(
      options.maxWidth ?? APP_SHELL_DEFAULT_SIDEBAR_MAX_WIDTH,
    );
    if (this.minWidth > this.maxWidth) {
      throw new RangeError(
        "App Shell sidebar minWidth must be less than or equal to maxWidth.",
      );
    }
    this.width =
      options.width === undefined ? undefined : this.clampWidth(options.width);
  }

  get state(): AppShellSidebarState {
    if (this.closed) return "closed";
    return this.collapsed ? "collapsed" : "expanded";
  }

  setCollapsed(collapsed: boolean): void {
    this.dismissPreview();
    const changed = this.closed || this.collapsed !== collapsed;
    this.closed = false;
    this.collapsed = collapsed;
    if (changed) this.#layoutChanged("collapse");
  }

  expand(): void {
    this.setCollapsed(false);
  }

  collapse(): void {
    this.setCollapsed(true);
  }

  toggle(): void {
    if (this.closed) {
      this.dismissPreview();
      this.closed = false;
      this.collapsed = false;
      this.#layoutChanged("collapse");
      return;
    }
    this.setCollapsed(!this.collapsed);
  }

  setClosed(closed: boolean): void {
    this.dismissPreview();
    if (this.closed === closed) return;
    this.closed = closed;
    this.#layoutChanged("close");
  }

  /** Preview a collapsed or closed sidebar after a consumer-owned hover delay. */
  schedulePreview(delay = 600): void {
    this.clearPreviewTimer();
    this.clearPreviewDismissTimer();
    if (!this.collapsed && !this.closed) return;
    this.previewTimer = setTimeout(
      () => {
        this.previewTimer = undefined;
        if (this.collapsed || this.closed) this.previewed = true;
      },
      Math.max(0, delay),
    );
  }

  /** Immediately preview a collapsed or closed sidebar. */
  preview(): void {
    this.clearPreviewTimer();
    this.clearPreviewDismissTimer();
    if (this.collapsed || this.closed) this.previewed = true;
  }

  /** Cancel a pending preview or dismiss an open preview after a grace period. */
  schedulePreviewDismiss(delay = 120): void {
    this.clearPreviewTimer();
    this.clearPreviewDismissTimer();
    if (!this.previewed) return;
    this.previewDismissTimer = setTimeout(
      () => {
        this.previewDismissTimer = undefined;
        this.previewed = false;
      },
      Math.max(0, delay),
    );
  }

  /** Keep an open preview mounted while the pointer or focus moves into it. */
  keepPreview(): void {
    this.clearPreviewDismissTimer();
  }

  /** Immediately clear pending and open transient previews. */
  dismissPreview(): void {
    this.clearPreviewTimer();
    this.clearPreviewDismissTimer();
    this.previewed = false;
  }

  /** Restore the sidebar without changing its previous collapse state. */
  open(): void {
    this.setClosed(false);
  }

  /** Remove the sidebar surface from layout while retaining its prior state. */
  close(): void {
    this.setClosed(true);
  }

  /** Set and clamp an explicit expanded width in CSS pixels. */
  setWidth(width: number): void {
    const nextWidth = this.clampWidth(width);
    if (this.width === nextWidth) return;
    this.width = nextWidth;
    this.#layoutChanged("resize");
  }

  /** Resize from an explicit base, or the package's default width. */
  resizeBy(
    delta: number,
    fromWidth = this.width ?? APP_SHELL_DEFAULT_SIDEBAR_WIDTH,
  ): void {
    this.setWidth(fromWidth + delta);
  }

  /** Return width ownership to the public left/right CSS width token. */
  resetWidth(): void {
    if (this.width === undefined) return;
    this.width = undefined;
    this.#layoutChanged("reset-width");
  }

  /** Return a JSON-safe snapshot of this sidebar's durable layout state. */
  getLayout(): AppShellSidebarLayout {
    return {
      side: this.side,
      collapsed: this.collapsed,
      closed: this.closed,
      ...(this.width === undefined ? {} : { width: this.width }),
    };
  }

  /** @internal Apply normalized durable state without scheduling a save. */
  replaceLayout(layout: AppShellSidebarLayout): void {
    if (layout.side !== this.side) return;
    this.dismissPreview();
    this.collapsed = layout.collapsed;
    this.closed = layout.closed;
    this.width =
      layout.width === undefined ? undefined : this.clampWidth(layout.width);
  }

  /** @internal Subscribe a shell controller to durable layout mutations. */
  onLayoutChange(listener: AppShellSidebarLayoutChangeListener): () => void {
    this.#layoutChangeListeners.add(listener);
    return () => this.#layoutChangeListeners.delete(listener);
  }

  private clampWidth(width: number): number {
    const finiteWidth = Number.isFinite(width)
      ? width
      : APP_SHELL_DEFAULT_SIDEBAR_WIDTH;
    return Math.min(
      this.maxWidth,
      Math.max(this.minWidth, Math.round(finiteWidth)),
    );
  }

  private clearPreviewTimer(): void {
    if (this.previewTimer !== undefined) {
      clearTimeout(this.previewTimer);
      this.previewTimer = undefined;
    }
  }

  private clearPreviewDismissTimer(): void {
    if (this.previewDismissTimer !== undefined) {
      clearTimeout(this.previewDismissTimer);
      this.previewDismissTimer = undefined;
    }
  }

  #layoutChanged(source: AppShellSidebarLayoutChangeSource): void {
    for (const listener of this.#layoutChangeListeners) listener(source);
  }
}

/** Owns the independent left and right sidebar state for an App Shell. */
export class AppShellController {
  readonly left: AppShellSidebarController;
  readonly right: AppShellSidebarController;
  readonly mobile = new AppShellMobileController();
  layoutReady = $state(false);
  constrainedPanelIds = $state<string[]>([]);
  desktopPreviewPanelIds = $state<string[]>([]);
  activeSurfaceLayer = $state<AppShellSurfaceLayerRegistration | null>(null);
  projectionVersion = $state(0);
  panelElementsVersion = $state(0);

  readonly #persistence: AppShellLayoutPersistence | undefined;
  readonly #saveDebounceMs: number;
  readonly #onPersistenceError:
    | ((event: AppShellPersistenceErrorEvent) => void)
    | undefined;
  readonly #panels = new Map<string, AppShellSidebarController>();
  readonly #panelIds = new Map<AppShellSidebarController, string>();
  readonly #panelDisposers = new Map<string, () => void>();
  readonly #panelElements = new Map<string, HTMLElement>();
  readonly #projectionChangeListeners =
    new Set<AppShellProjectionChangeListener>();
  #restoredPanels = new Map<string, AppShellSidebarLayout>();
  #hydrating = false;
  #restorePromise: Promise<void> | null = null;
  #saveTimer: ReturnType<typeof setTimeout> | null = null;
  #projectionFrame: number | null = null;
  #pendingSaveEvent: AppShellLayoutChangeEvent | null = null;
  #saveChain: Promise<void> = Promise.resolve();

  constructor(options: AppShellControllerOptions = {}) {
    this.#persistence = options.persistence;
    this.#saveDebounceMs = Math.max(0, options.saveDebounceMs ?? 200);
    this.#onPersistenceError = options.onPersistenceError;
    const sidebarOptions: AppShellSidebarControllerOptions = {
      ...(options.sidebarMinWidth === undefined
        ? {}
        : { minWidth: options.sidebarMinWidth }),
      ...(options.sidebarMaxWidth === undefined
        ? {}
        : { maxWidth: options.sidebarMaxWidth }),
    };
    this.left = new AppShellSidebarController(
      "left",
      options.leftCollapsed ?? false,
      {
        ...sidebarOptions,
        ...(options.leftWidth === undefined
          ? {}
          : { width: options.leftWidth }),
        ...(options.leftClosed === undefined
          ? {}
          : { closed: options.leftClosed }),
      },
    );
    this.right = new AppShellSidebarController(
      "right",
      options.rightCollapsed ?? false,
      {
        ...sidebarOptions,
        ...(options.rightWidth === undefined
          ? {}
          : { width: options.rightWidth }),
        ...(options.rightClosed === undefined
          ? {}
          : { closed: options.rightClosed }),
      },
    );
    this.#attachPanel("left", this.left);
    this.#attachPanel("right", this.right);
    this.layoutReady = !this.#persistence;
  }

  getSidebar(side: AppShellSide): AppShellSidebarController {
    return side === "left" ? this.left : this.right;
  }

  /** Return any built-in or named panel registered with this controller. */
  getPanel(id: string): AppShellSidebarController | undefined {
    return this.#panels.get(id);
  }

  /** Return the stable registered id for a built-in or named sidebar. */
  getPanelId(sidebar: AppShellSidebarController): string | undefined {
    return this.#panelIds.get(sidebar);
  }

  /** Whether protected desktop width has displaced this panel from inline flow. */
  isPanelConstrained(id: string | undefined): boolean {
    return id !== undefined && this.constrainedPanelIds.includes(id);
  }

  /** Return the mounted panel's configured constrained presentation. */
  getConstrainedPresentation(
    id: string | undefined,
  ): AppShellConstrainedPresentation {
    if (!id) return "preview";
    return (
      this.mobile.panels.find((panel) => panel.id === id)
        ?.constrainedPresentation ?? "preview"
    );
  }

  /** Whether a constrained preview panel is currently presented. */
  isPanelDesktopPreviewed(id: string | undefined): boolean {
    return id !== undefined && this.desktopPreviewPanelIds.includes(id);
  }

  /** Present or dismiss one constrained desktop preview without durable changes. */
  setPanelDesktopPreviewed(id: string, previewed: boolean): void {
    if (!this.isPanelConstrained(id)) previewed = false;
    const current = this.desktopPreviewPanelIds.includes(id);
    if (current === previewed) return;
    this.desktopPreviewPanelIds = previewed
      ? [...this.desktopPreviewPanelIds, id]
      : this.desktopPreviewPanelIds.filter((candidate) => candidate !== id);
    this.#projectionChanged();
  }

  /** @internal Install the current constrained projection from AppShell.Root. */
  setConstrainedPanelIds(ids: readonly string[]): void {
    const next = [...new Set(ids)];
    if (
      next.length === this.constrainedPanelIds.length &&
      next.every((id, index) => this.constrainedPanelIds[index] === id)
    ) {
      return;
    }
    this.constrainedPanelIds = next;
    this.desktopPreviewPanelIds = this.desktopPreviewPanelIds.filter((id) =>
      next.includes(id),
    );
    this.#projectionChanged();
  }

  /** @internal Subscribe mounted shell parts to transient projection changes. */
  onProjectionChange(listener: AppShellProjectionChangeListener): () => void {
    this.#projectionChangeListeners.add(listener);
    return () => this.#projectionChangeListeners.delete(listener);
  }

  /** @internal Register a mounted sidebar landmark for shell geometry. */
  setPanelElement(id: string | undefined, element: HTMLElement | null): void {
    if (!id) return;
    if (element) {
      if (this.#panelElements.get(id) === element) return;
      this.#panelElements.set(id, element);
      this.#syncPanelProjection(id);
    } else {
      if (!this.#panelElements.delete(id)) return;
    }
    this.panelElementsVersion += 1;
  }

  /** @internal Return a mounted sidebar landmark. */
  getPanelElement(id: string): HTMLElement | null {
    void this.panelElementsVersion;
    return this.#panelElements.get(id) ?? null;
  }

  /** @internal Reconcile every mounted panel with durable and transient state. */
  syncPanelProjections(): void {
    for (const id of this.#panelElements.keys()) {
      this.#syncPanelProjection(id);
    }
  }

  /** Whether the active structural layer temporarily removes this panel. */
  isPanelSuspended(id: string | undefined): boolean {
    return (
      id !== undefined &&
      (this.activeSurfaceLayer?.suspendPanelIds.includes(id) ?? false)
    );
  }

  /** Whether the active structural layer covers this mounted panel. */
  isPanelCovered(id: string | undefined): boolean {
    return (
      id !== undefined &&
      (this.activeSurfaceLayer?.coverPanelIds.includes(id) ?? false)
    );
  }

  /** Whether a structural layer or replacement panel currently covers main. */
  get mainOccluded(): boolean {
    if (this.activeSurfaceLayer) return true;
    return this.constrainedPanelIds.some((id) => {
      const panel = this.getPanel(id);
      return (
        panel !== undefined &&
        !panel.closed &&
        !this.isPanelSuspended(id) &&
        this.getConstrainedPresentation(id) === "replace-main"
      );
    });
  }

  /** @internal Activate the root's single structural surface layer. */
  activateSurfaceLayer(registration: AppShellSurfaceLayerRegistration): void {
    const current = this.activeSurfaceLayer;
    if (current && current.token !== registration.token) {
      throw new Error("AppShell.Root supports one active SurfaceLayer.");
    }
    this.activeSurfaceLayer = registration;
    this.#projectionChanged();
  }

  /** @internal Remove a mounted structural surface layer. */
  deactivateSurfaceLayer(token: symbol): void {
    if (this.activeSurfaceLayer?.token !== token) return;
    this.activeSurfaceLayer = null;
    this.#projectionChanged();
  }

  /** Create and register an independently persisted same-side panel. */
  createSidebar(
    id: string,
    side: AppShellSide,
    options: AppShellRegisteredSidebarOptions = {},
  ): AppShellSidebarController {
    const sidebar = new AppShellSidebarController(
      side,
      options.collapsed ?? false,
      options,
    );
    this.registerSidebar(id, sidebar);
    return sidebar;
  }

  /**
   * Register a standalone sidebar under a stable persistence id.
   * Returns a disposer that removes it from future snapshots.
   */
  registerSidebar(id: string, sidebar: AppShellSidebarController): () => void {
    const panelId = id.trim();
    if (!panelId) {
      throw new TypeError("App Shell persisted panel ids must not be empty.");
    }
    const current = this.#panels.get(panelId);
    if (current) {
      if (current === sidebar) return () => undefined;
      throw new Error(`App Shell panel "${panelId}" is already registered.`);
    }

    this.#attachPanel(panelId, sidebar);
    const restored = this.#restoredPanels.get(panelId);
    if (restored?.side === sidebar.side) sidebar.replaceLayout(restored);
    this.#requestSave({ source: "register", panelId });

    return () => {
      if (this.#panels.get(panelId) !== sidebar) return;
      this.#panelDisposers.get(panelId)?.();
      this.#panelDisposers.delete(panelId);
      this.#panels.delete(panelId);
      this.#panelIds.delete(sidebar);
      this.#panelElements.delete(panelId);
      this.constrainedPanelIds = this.constrainedPanelIds.filter(
        (id) => id !== panelId,
      );
      this.desktopPreviewPanelIds = this.desktopPreviewPanelIds.filter(
        (id) => id !== panelId,
      );
      this.panelElementsVersion += 1;
      this.#projectionChanged();
      this.#requestSave({ source: "unregister", panelId });
    };
  }

  /** Return a detached, versioned snapshot for all registered panels. */
  getLayout(): AppShellLayoutV1 {
    const panels: Record<string, AppShellSidebarLayout> = {};
    for (const [id, sidebar] of this.#panels) {
      panels[id] = sidebar.getLayout();
    }
    return {
      version: APP_SHELL_LAYOUT_VERSION,
      panels,
    };
  }

  /** Restore the configured persistence adapter once. */
  async restoreLayout(): Promise<void> {
    if (this.layoutReady) return;
    if (this.#restorePromise) return this.#restorePromise;
    this.#restorePromise = this.#restoreLayout();
    try {
      await this.#restorePromise;
    } finally {
      this.#restorePromise = null;
    }
  }

  /** Immediately write the latest pending layout snapshot. */
  async flushSave(): Promise<void> {
    if (this.#saveTimer) {
      clearTimeout(this.#saveTimer);
      this.#saveTimer = null;
    }
    const event = this.#pendingSaveEvent;
    this.#pendingSaveEvent = null;
    if (!event || !this.#persistence) return this.#saveChain;

    const snapshot = this.getLayout();
    this.#saveChain = this.#saveChain.then(async () => {
      try {
        await this.#persistence?.save(snapshot, event);
      } catch (error) {
        this.#onPersistenceError?.({ operation: "save", error });
      }
    });
    return this.#saveChain;
  }

  /** Flush pending persistence and release registered panel subscriptions. */
  async dispose(): Promise<void> {
    await this.flushSave();
    for (const dispose of this.#panelDisposers.values()) dispose();
    this.#panelDisposers.clear();
    this.#panels.clear();
    this.#panelIds.clear();
    this.#panelElements.clear();
    this.constrainedPanelIds = [];
    this.desktopPreviewPanelIds = [];
    this.activeSurfaceLayer = null;
    this.#projectionChangeListeners.clear();
    if (
      this.#projectionFrame !== null &&
      typeof cancelAnimationFrame !== "undefined"
    ) {
      cancelAnimationFrame(this.#projectionFrame);
      this.#projectionFrame = null;
    }
  }

  #attachPanel(id: string, sidebar: AppShellSidebarController): void {
    this.#panels.set(id, sidebar);
    this.#panelIds.set(sidebar, id);
    this.#panelDisposers.set(
      id,
      sidebar.onLayoutChange((source) => {
        this.#projectionChanged();
        this.#requestSave({ source, panelId: id });
      }),
    );
  }

  async #restoreLayout(): Promise<void> {
    this.#hydrating = true;
    try {
      this.#restoredPanels = normalizeAppShellLayout(
        await this.#persistence?.load(),
      );
      for (const [id, sidebar] of this.#panels) {
        const restored = this.#restoredPanels.get(id);
        if (restored?.side === sidebar.side) sidebar.replaceLayout(restored);
      }
    } catch (error) {
      this.#onPersistenceError?.({ operation: "load", error });
    } finally {
      this.#hydrating = false;
      this.layoutReady = true;
    }
  }

  #requestSave(event: AppShellLayoutChangeEvent): void {
    if (!this.#persistence || this.#hydrating || !this.layoutReady) return;
    this.#pendingSaveEvent = event;
    if (this.#saveTimer) clearTimeout(this.#saveTimer);
    this.#saveTimer = setTimeout(() => {
      this.#saveTimer = null;
      void this.flushSave();
    }, this.#saveDebounceMs);
  }

  #projectionChanged(): void {
    this.projectionVersion += 1;
    for (const listener of this.#projectionChangeListeners) listener();
    const sync = () => {
      this.#projectionFrame = null;
      this.syncPanelProjections();
    };
    if (typeof requestAnimationFrame === "undefined") {
      queueMicrotask(sync);
      return;
    }
    if (this.#projectionFrame !== null)
      cancelAnimationFrame(this.#projectionFrame);
    this.#projectionFrame = requestAnimationFrame(sync);
  }

  #syncPanelProjection(id: string): void {
    const element = this.#panelElements.get(id);
    const sidebar = this.#panels.get(id);
    if (!element || !sidebar) return;
    const suspended = this.isPanelSuspended(id);
    const covered = suspended || this.isPanelCovered(id);
    const constrained = this.isPanelConstrained(id);
    const mobile = this.mobile.resolvedMode === "mobile";
    const presentation = this.getConstrainedPresentation(id);
    const previewed = this.isPanelDesktopPreviewed(id) || sidebar.previewed;
    const consumerAriaHidden = element.getAttribute(
      "data-consumer-aria-hidden",
    );

    element.toggleAttribute("data-suspended", suspended);
    element.toggleAttribute("data-desktop-constrained", constrained);
    element.dataset.state = sidebar.state;
    element.dataset.presentation = mobile
      ? "mobile"
      : constrained
        ? previewed
          ? "overlay"
          : presentation === "replace-main"
            ? "replace-main"
            : "inline"
        : "inline";
    element.hidden =
      element.hasAttribute("data-consumer-hidden") ||
      suspended ||
      (!mobile &&
        (sidebar.closed ||
          (constrained && presentation === "preview" && !previewed)));
    element.inert = element.hasAttribute("data-consumer-inert") || covered;
    if (covered || consumerAriaHidden === "true") {
      element.setAttribute("aria-hidden", "true");
    } else if (consumerAriaHidden === null) {
      element.removeAttribute("aria-hidden");
    } else {
      element.setAttribute("aria-hidden", consumerAriaHidden);
    }
  }
}

function normalizeAppShellLayout(
  value: unknown,
): Map<string, AppShellSidebarLayout> {
  const panels = new Map<string, AppShellSidebarLayout>();
  if (!isRecord(value) || value.version !== APP_SHELL_LAYOUT_VERSION) {
    return panels;
  }
  if (!isRecord(value.panels)) return panels;

  for (const [id, panel] of Object.entries(value.panels)) {
    if (
      !id ||
      !isRecord(panel) ||
      (panel.side !== "left" && panel.side !== "right") ||
      typeof panel.collapsed !== "boolean" ||
      typeof panel.closed !== "boolean"
    ) {
      continue;
    }
    panels.set(id, {
      side: panel.side,
      collapsed: panel.collapsed,
      closed: panel.closed,
      ...(typeof panel.width === "number" && Number.isFinite(panel.width)
        ? { width: panel.width }
        : {}),
    });
  }
  return panels;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
