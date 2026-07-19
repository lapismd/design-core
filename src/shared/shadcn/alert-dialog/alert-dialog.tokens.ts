export const alert_dialogTokenNames = {
  background: "--ui-alert-dialog-background",
  foreground: "--ui-alert-dialog-foreground",
  borderColor: "--ui-alert-dialog-border-color",
  radius: "--ui-alert-dialog-radius",
  focusRingColor: "--ui-alert-dialog-focus-ring-color",
} as const;

export type AlertDialogToken =
  (typeof alert_dialogTokenNames)[keyof typeof alert_dialogTokenNames];
