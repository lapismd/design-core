export type AppShellSide = "left" | "right";
export type AppShellSidebarState = "expanded" | "collapsed";

export interface AppShellControllerOptions {
  /** Start the left sidebar as a persistent collapsed icon rail. */
  leftCollapsed?: boolean;
  /** Start the right sidebar as a persistent collapsed icon rail. */
  rightCollapsed?: boolean;
}

/** Reactive state for one side of an App Shell. */
export class AppShellSidebarController {
  readonly side: AppShellSide;
  collapsed = $state(false);

  constructor(side: AppShellSide, collapsed = false) {
    this.side = side;
    this.collapsed = collapsed;
  }

  get state(): AppShellSidebarState {
    return this.collapsed ? "collapsed" : "expanded";
  }

  setCollapsed(collapsed: boolean): void {
    this.collapsed = collapsed;
  }

  expand(): void {
    this.setCollapsed(false);
  }

  collapse(): void {
    this.setCollapsed(true);
  }

  toggle(): void {
    this.setCollapsed(!this.collapsed);
  }
}

/** Owns the independent left and right sidebar state for an App Shell. */
export class AppShellController {
  readonly left: AppShellSidebarController;
  readonly right: AppShellSidebarController;

  constructor(options: AppShellControllerOptions = {}) {
    this.left = new AppShellSidebarController(
      "left",
      options.leftCollapsed ?? false,
    );
    this.right = new AppShellSidebarController(
      "right",
      options.rightCollapsed ?? false,
    );
  }

  getSidebar(side: AppShellSide): AppShellSidebarController {
    return side === "left" ? this.left : this.right;
  }
}
