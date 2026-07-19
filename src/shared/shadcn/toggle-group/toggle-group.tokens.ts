export const toggle_groupTokenNames = {
  background: "--ui-toggle-group-background",
  foreground: "--ui-toggle-group-foreground",
  borderColor: "--ui-toggle-group-border-color",
  radius: "--ui-toggle-group-radius",
  focusRingColor: "--ui-toggle-group-focus-ring-color",
} as const;

export type ToggleGroupToken =
  (typeof toggle_groupTokenNames)[keyof typeof toggle_groupTokenNames];
