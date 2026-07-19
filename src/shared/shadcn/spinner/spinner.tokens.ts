export const spinnerTokenNames = {
  background: "--ui-spinner-background",
  foreground: "--ui-spinner-foreground",
  borderColor: "--ui-spinner-border-color",
  radius: "--ui-spinner-radius",
  focusRingColor: "--ui-spinner-focus-ring-color",
} as const;

export type SpinnerToken =
  (typeof spinnerTokenNames)[keyof typeof spinnerTokenNames];
