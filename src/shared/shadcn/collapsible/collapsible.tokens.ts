export const collapsibleTokenNames = {
  background: "--ui-collapsible-background",
  foreground: "--ui-collapsible-foreground",
  borderColor: "--ui-collapsible-border-color",
  radius: "--ui-collapsible-radius",
  focusRingColor: "--ui-collapsible-focus-ring-color",
} as const;

export type CollapsibleToken =
  (typeof collapsibleTokenNames)[keyof typeof collapsibleTokenNames];
