export const commandViewTokenNames = {
  background: "--ui-command-view-background",
  foreground: "--ui-command-view-foreground",
  mutedForeground: "--ui-command-view-muted-foreground",
  borderColor: "--ui-command-view-border-color",
  radius: "--ui-command-view-radius",
  itemRadius: "--ui-command-view-item-radius",
  itemSelectedBackground: "--ui-command-view-item-selected-background",
  itemSelectedForeground: "--ui-command-view-item-selected-foreground",
  listMaxHeight: "--ui-command-view-list-max-height",
  listPadding: "--ui-command-view-list-padding",
  gap: "--ui-command-view-gap",
  iconSize: "--ui-command-view-icon-size",
  shortcutBackground: "--ui-command-view-shortcut-background",
  shortcutBorder: "--ui-command-view-shortcut-border",
  focusRingColor: "--ui-command-view-focus-ring-color",
} as const;

export type CommandViewToken =
  (typeof commandViewTokenNames)[keyof typeof commandViewTokenNames];
