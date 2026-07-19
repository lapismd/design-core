export const buttonTokenNames = {
  background: "--ui-button-background",
  foreground: "--ui-button-foreground",
  borderColor: "--ui-button-border-color",
  radius: "--ui-button-radius",
  focusRingColor: "--ui-button-focus-ring-color",
  height: "--ui-button-height",
  paddingInline: "--ui-button-padding-inline",
  gap: "--ui-button-gap",
  iconSize: "--ui-button-icon-size",
} as const;

export type ButtonToken =
  (typeof buttonTokenNames)[keyof typeof buttonTokenNames];
