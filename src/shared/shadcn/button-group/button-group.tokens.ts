export const button_groupTokenNames = {
  background: "--ui-button-group-background",
  foreground: "--ui-button-group-foreground",
  borderColor: "--ui-button-group-border-color",
  radius: "--ui-button-group-radius",
  focusRingColor: "--ui-button-group-focus-ring-color",
} as const;

export type ButtonGroupToken =
  (typeof button_groupTokenNames)[keyof typeof button_groupTokenNames];
