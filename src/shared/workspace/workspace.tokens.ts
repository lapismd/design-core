/**
 * Public CSS custom properties for `@stevejuma/ui/workspace`.
 *
 * Defaults live in `workspace.tokens.css`. Consumers override these values on
 * `:root` or a Workspace ancestor.
 */
export const workspaceTokenNames = {
  background: "--ui-workspace-background",
  foreground: "--ui-workspace-foreground",
  panel: "--ui-workspace-panel",
  panelForeground: "--ui-workspace-panel-foreground",
  muted: "--ui-workspace-muted",
  mutedForeground: "--ui-workspace-muted-foreground",
  popover: "--ui-workspace-popover",
  popoverForeground: "--ui-workspace-popover-foreground",
  border: "--ui-workspace-border",
  borderStrong: "--ui-workspace-border-strong",
  accent: "--ui-workspace-accent",
  accentForeground: "--ui-workspace-accent-foreground",
  selection: "--ui-workspace-selection",
  destructive: "--ui-workspace-destructive",
  focusRing: "--ui-workspace-focus-ring",
  radiusSmall: "--ui-workspace-radius-small",
  radiusMedium: "--ui-workspace-radius-medium",
  radiusLarge: "--ui-workspace-radius-large",
  shadow: "--ui-workspace-shadow",
  tabHeight: "--ui-workspace-tab-height",
  tabWidth: "--ui-workspace-tab-width",
  tabMaxWidth: "--ui-workspace-tab-max-width",
  tabCurve: "--ui-workspace-tab-curve",
  tabActiveBackground: "--ui-workspace-tab-active-background",
  tabContainerBackground: "--ui-workspace-tab-container-background",
  tabDivider: "--ui-workspace-tab-divider",
  sidebarHeaderHeight: "--ui-workspace-sidebar-header-height",
  ribbonWidth: "--ui-workspace-ribbon-width",
  statusHeight: "--ui-workspace-status-height",
  overlayZIndex: "--ui-workspace-overlay-z-index",
} as const;

export type WorkspaceTokenKey = keyof typeof workspaceTokenNames;
export type WorkspaceToken = (typeof workspaceTokenNames)[WorkspaceTokenKey];

/** Default bindings from `workspace.tokens.css`. */
export const workspaceTokenDefaults: Record<WorkspaceTokenKey, string> = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  panel: "var(--sidebar, var(--background))",
  panelForeground: "var(--sidebar-foreground, var(--foreground))",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  popover: "var(--popover)",
  popoverForeground: "var(--popover-foreground)",
  border: "var(--border)",
  borderStrong: "color-mix(in srgb, var(--foreground) 18%, var(--border))",
  accent: "var(--primary)",
  accentForeground: "var(--primary-foreground)",
  selection: "color-mix(in srgb, var(--primary) 14%, transparent)",
  destructive: "var(--destructive)",
  focusRing: "var(--ring)",
  radiusSmall: "calc(var(--radius, 0.625rem) * 0.6)",
  radiusMedium: "calc(var(--radius, 0.625rem) * 0.8)",
  radiusLarge: "var(--radius, 0.625rem)",
  shadow: "0 12px 32px rgb(15 23 42 / 24%)",
  tabHeight: "2.5rem",
  tabWidth: "12.5rem",
  tabMaxWidth: "20rem",
  tabCurve: "0.375rem",
  tabActiveBackground: "var(--background)",
  tabContainerBackground: "var(--sidebar, var(--ui-workspace-muted))",
  tabDivider: "var(--border)",
  sidebarHeaderHeight: "2rem",
  ribbonWidth: "3rem",
  statusHeight: "1.5rem",
  overlayZIndex: "50",
};
