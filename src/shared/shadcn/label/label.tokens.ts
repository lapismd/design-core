export const labelTokenNames = {
  background: "--ui-label-background",
  foreground: "--ui-label-foreground",
  borderColor: "--ui-label-border-color",
  radius: "--ui-label-radius",
  focusRingColor: "--ui-label-focus-ring-color",
} as const;

export type LabelToken = (typeof labelTokenNames)[keyof typeof labelTokenNames];
