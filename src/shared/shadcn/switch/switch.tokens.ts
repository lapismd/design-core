export const switchTokenNames = {
  background: "--ui-switch-background",
  foreground: "--ui-switch-foreground",
  borderColor: "--ui-switch-border-color",
  radius: "--ui-switch-radius",
  focusRingColor: "--ui-switch-focus-ring-color",
} as const;

export type SwitchToken =
  (typeof switchTokenNames)[keyof typeof switchTokenNames];
