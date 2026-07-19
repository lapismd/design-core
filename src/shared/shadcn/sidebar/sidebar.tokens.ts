export const sidebarTokenNames = {
  background: "--ui-sidebar-background",
  foreground: "--ui-sidebar-foreground",
  borderColor: "--ui-sidebar-border-color",
  radius: "--ui-sidebar-radius",
  focusRingColor: "--ui-sidebar-focus-ring-color",
} as const;

export type SidebarToken =
  (typeof sidebarTokenNames)[keyof typeof sidebarTokenNames];
