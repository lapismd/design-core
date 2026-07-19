export const toggleTokenNames = {
  background: "--ui-toggle-background",
  foreground: "--ui-toggle-foreground",
  borderColor: "--ui-toggle-border-color",
  radius: "--ui-toggle-radius",
  focusRingColor: "--ui-toggle-focus-ring-color",
} as const;

export type ToggleToken =
  (typeof toggleTokenNames)[keyof typeof toggleTokenNames];
