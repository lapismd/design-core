export const emptyTokenNames = {
  background: "--ui-empty-background",
  foreground: "--ui-empty-foreground",
  borderColor: "--ui-empty-border-color",
  radius: "--ui-empty-radius",
  focusRingColor: "--ui-empty-focus-ring-color",
} as const;

export type EmptyToken = (typeof emptyTokenNames)[keyof typeof emptyTokenNames];
