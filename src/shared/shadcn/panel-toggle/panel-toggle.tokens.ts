export const panelToggleTokenNames = {
  width: "--ui-panel-toggle-width",
  height: "--ui-panel-toggle-height",
  iconWidth: "--ui-panel-toggle-icon-width",
  iconHeight: "--ui-panel-toggle-icon-height",
  expandedBar: "--ui-panel-toggle-expanded-bar",
  horizontalExpandedBar: "--ui-panel-toggle-horizontal-expanded-bar",
  collapsedBar: "--ui-panel-toggle-collapsed-bar",
  motionDuration: "--ui-panel-toggle-motion-duration",
  standardIconWidth: "--ui-panel-toggle-standard-icon-width",
  standardIconHeight: "--ui-panel-toggle-standard-icon-height",
  standardExpandedBar: "--ui-panel-toggle-standard-expanded-bar",
  standardCollapsedBar: "--ui-panel-toggle-standard-collapsed-bar",
  standardHorizontalExpandedBar:
    "--ui-panel-toggle-standard-horizontal-expanded-bar",
} as const;
export type PanelToggleToken =
  (typeof panelToggleTokenNames)[keyof typeof panelToggleTokenNames];
