export const drawerTokenNames = {
  background: "--ui-drawer-background",
  foreground: "--ui-drawer-foreground",
  borderColor: "--ui-drawer-border-color",
  radius: "--ui-drawer-radius",
  focusRingColor: "--ui-drawer-focus-ring-color",
} as const;

export type DrawerToken =
  (typeof drawerTokenNames)[keyof typeof drawerTokenNames];
