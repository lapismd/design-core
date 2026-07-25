export const popoverTokenNames = {
  background: "--ui-popover-background",
  foreground: "--ui-popover-foreground",
  borderColor: "--ui-popover-border-color",
  radius: "--ui-popover-radius",
  focusRingColor: "--ui-popover-focus-ring-color",
  gap: "--ui-popover-gap",
  padding: "--ui-popover-padding",
} as const;

export type PopoverToken =
  (typeof popoverTokenNames)[keyof typeof popoverTokenNames];
