export const alertTokenNames = {
  background: "--ui-alert-background",
  foreground: "--ui-alert-foreground",
  borderColor: "--ui-alert-border-color",
  radius: "--ui-alert-radius",
  focusRingColor: "--ui-alert-focus-ring-color",
} as const;

export type AlertToken = (typeof alertTokenNames)[keyof typeof alertTokenNames];
