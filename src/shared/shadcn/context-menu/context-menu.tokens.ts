export const context_menuTokenNames = {
  background: "--ui-context-menu-background",
  foreground: "--ui-context-menu-foreground",
  borderColor: "--ui-context-menu-border-color",
  radius: "--ui-context-menu-radius",
  focusRingColor: "--ui-context-menu-focus-ring-color",
} as const;

export type ContextMenuToken =
  (typeof context_menuTokenNames)[keyof typeof context_menuTokenNames];
