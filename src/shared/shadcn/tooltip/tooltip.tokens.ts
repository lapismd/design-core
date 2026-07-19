export const tooltipTokenNames = {
  background: "--ui-tooltip-background",
  foreground: "--ui-tooltip-foreground",
  borderColor: "--ui-tooltip-border-color",
  radius: "--ui-tooltip-radius",
  focusRingColor: "--ui-tooltip-focus-ring-color",
} as const;

export type TooltipToken =
  (typeof tooltipTokenNames)[keyof typeof tooltipTokenNames];
