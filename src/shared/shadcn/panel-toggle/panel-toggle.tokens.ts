export const panelToggleTokenNames = {
  width: "--ui-panel-toggle-width",
  height: "--ui-panel-toggle-height",
  iconWidth: "--ui-panel-toggle-icon-width",
  iconHeight: "--ui-panel-toggle-icon-height",
  expandedBar: "--ui-panel-toggle-expanded-bar",
  collapsedBar: "--ui-panel-toggle-collapsed-bar",
  motionDuration: "--ui-panel-toggle-motion-duration",
} as const;
export type PanelToggleToken =
  (typeof panelToggleTokenNames)[keyof typeof panelToggleTokenNames];
