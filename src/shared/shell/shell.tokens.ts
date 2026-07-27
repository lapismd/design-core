/** Public CSS custom properties for `@stevejuma/ui/shell`. */
export const shellTokenNames = {
  height: "--ui-shell-height",
  leftSidebarWidth: "--ui-shell-left-sidebar-width",
  rightSidebarWidth: "--ui-shell-right-sidebar-width",
  rightSidebarGap: "--ui-shell-right-sidebar-gap",
  collapsedSidebarWidth: "--ui-shell-collapsed-sidebar-width",
  bodySidebarWidth: "--ui-shell-body-sidebar-width",
  sidebarToggleIndicatorWidth: "--ui-shell-sidebar-toggle-indicator-width",
  toolbarHeight: "--ui-shell-toolbar-height",
  mainBlockInset: "--ui-shell-main-block-inset",
  mainRadius: "--ui-shell-main-radius",
  mainShadow: "--ui-shell-main-shadow",
} as const;

export type ShellTokenKey = keyof typeof shellTokenNames;
export type ShellToken = (typeof shellTokenNames)[ShellTokenKey];

/** Default bindings from `shell.tokens.css`. */
export const shellTokenDefaults: Record<ShellTokenKey, string> = {
  height: "100vh",
  leftSidebarWidth: "18rem",
  rightSidebarWidth: "18rem",
  rightSidebarGap: "0.5rem",
  collapsedSidebarWidth: "3rem",
  bodySidebarWidth: "14rem",
  sidebarToggleIndicatorWidth: "24%",
  toolbarHeight: "3rem",
  mainBlockInset: "0.5rem",
  mainRadius: "0.875rem",
  mainShadow:
    "0 1px 3px color-mix(in srgb, var(--foreground) 10%, transparent), 0 1px 2px -1px color-mix(in srgb, var(--foreground) 10%, transparent)",
};
