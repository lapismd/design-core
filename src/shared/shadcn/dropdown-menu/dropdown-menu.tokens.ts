export const dropdown_menuTokenNames = {
  background: "--ui-dropdown-menu-background",
  foreground: "--ui-dropdown-menu-foreground",
  borderColor: "--ui-dropdown-menu-border-color",
  radius: "--ui-dropdown-menu-radius",
  focusRingColor: "--ui-dropdown-menu-focus-ring-color",
} as const;

export type DropdownMenuToken =
  (typeof dropdown_menuTokenNames)[keyof typeof dropdown_menuTokenNames];
