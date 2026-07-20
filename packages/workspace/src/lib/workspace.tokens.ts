/** CSS custom properties exposed by `@stevejuma/workspace`. */
export const workspaceTokenNames = {
  tabHeight: "--ui-workspace-tab-height",
  tabWidth: "--ui-workspace-tab-width",
  tabMinWidth: "--ui-workspace-tab-min-width",
  tabMaxWidth: "--ui-workspace-tab-max-width",
  tabContainerBackground: "--ui-workspace-tab-container-background",
  tabDivider: "--ui-workspace-tab-divider",
  tabRadius: "--ui-workspace-tab-radius",
  tabCurve: "--ui-workspace-tab-curve",
  tabHover: "--ui-workspace-tab-hover",
  tabActiveBackground: "--ui-workspace-tab-active-background",
  divider: "--ui-workspace-divider",
  activeTab: "--ui-workspace-active-tab",
  sidebarBackground: "--ui-workspace-sidebar-background",
  sidebarMinSize: "--ui-workspace-sidebar-min-size",
  sidebarMaxSize: "--ui-workspace-sidebar-max-size",
  ribbonWidth: "--ui-workspace-ribbon-width",
  ribbonBackground: "--ui-workspace-ribbon-background",
  actionHover: "--ui-workspace-action-hover",
  actionActive: "--ui-workspace-action-active",
  groupHeaderHeight: "--ui-workspace-group-header-height",
  groupHover: "--ui-workspace-group-hover",
  groupBody: "--ui-workspace-group-body",
  stackedTabWidth: "--ui-workspace-stacked-tab-width",
  stackedMinPaneWidth: "--ui-workspace-stacked-min-pane-width",
  viewHeaderHeight: "--ui-workspace-view-header-height",
  viewHeaderBackground: "--ui-workspace-view-header-background",
  viewHeaderDivider: "--ui-workspace-view-header-divider",
} as const;

export type WorkspaceToken =
  (typeof workspaceTokenNames)[keyof typeof workspaceTokenNames];
