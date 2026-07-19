export const dialogTokenNames = {
  background: "--ui-dialog-background",
  foreground: "--ui-dialog-foreground",
  borderColor: "--ui-dialog-border-color",
  radius: "--ui-dialog-radius",
  focusRingColor: "--ui-dialog-focus-ring-color",
} as const;

export type DialogToken =
  (typeof dialogTokenNames)[keyof typeof dialogTokenNames];
