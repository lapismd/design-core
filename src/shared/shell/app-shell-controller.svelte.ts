export type AppShellSide = "left" | "right";
export type AppShellSidebarState = "expanded" | "collapsed" | "closed";

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
}

export interface AppShellSidebarControllerOptions {
  /** Initial explicit width in CSS pixels. */
  width?: number;
  /** Minimum expanded width in CSS pixels. */
  minWidth?: number;
  /** Maximum expanded width in CSS pixels. */
  maxWidth?: number;
}

/** Reactive state for one side of an App Shell. */
export class AppShellSidebarController {
  readonly side: AppShellSide;
  readonly minWidth: number;
  readonly maxWidth: number;
  collapsed = $state(false);
  closed = $state(false);
  width = $state<number | undefined>(undefined);

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
    this.closed = false;
    this.collapsed = collapsed;
  }

  expand(): void {
    this.setCollapsed(false);
  }

  collapse(): void {
    this.setCollapsed(true);
  }

  toggle(): void {
    if (this.closed) {
      this.closed = false;
      this.collapsed = false;
      return;
    }
    this.setCollapsed(!this.collapsed);
  }

  setClosed(closed: boolean): void {
    this.closed = closed;
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
    this.width = this.clampWidth(width);
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
    this.width = undefined;
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
}

/** Owns the independent left and right sidebar state for an App Shell. */
export class AppShellController {
  readonly left: AppShellSidebarController;
  readonly right: AppShellSidebarController;

  constructor(options: AppShellControllerOptions = {}) {
    const sidebarOptions = {
      minWidth: options.sidebarMinWidth,
      maxWidth: options.sidebarMaxWidth,
    };
    this.left = new AppShellSidebarController(
      "left",
      options.leftCollapsed ?? false,
      {
        ...sidebarOptions,
        width: options.leftWidth,
        closed: options.leftClosed,
      },
    );
    this.right = new AppShellSidebarController(
      "right",
      options.rightCollapsed ?? false,
      {
        ...sidebarOptions,
        width: options.rightWidth,
        closed: options.rightClosed,
      },
    );
  }

  getSidebar(side: AppShellSide): AppShellSidebarController {
    return side === "left" ? this.left : this.right;
  }
}
