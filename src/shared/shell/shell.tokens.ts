/** Public CSS custom properties for `@stevejuma/ui/shell`. */
export const shellTokenNames = {
  leftSidebarWidth: "--ui-shell-left-sidebar-width",
  rightSidebarWidth: "--ui-shell-right-sidebar-width",
  collapsedSidebarWidth: "--ui-shell-collapsed-sidebar-width",
  toolbarHeight: "--ui-shell-toolbar-height",
} as const;

export type ShellTokenKey = keyof typeof shellTokenNames;
export type ShellToken = (typeof shellTokenNames)[ShellTokenKey];

/** Default bindings from `shell.tokens.css`. */
export const shellTokenDefaults: Record<ShellTokenKey, string> = {
  leftSidebarWidth: "18rem",
  rightSidebarWidth: "18rem",
  collapsedSidebarWidth: "3rem",
  toolbarHeight: "3rem",
};
