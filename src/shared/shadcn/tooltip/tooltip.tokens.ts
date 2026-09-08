export const tooltipTokenNames = {
  background: "--ui-tooltip-background",
  foreground: "--ui-tooltip-foreground",
  borderColor: "--ui-tooltip-border-color",
  radius: "--ui-tooltip-radius",
  focusRingColor: "--ui-tooltip-focus-ring-color",
  fontSize: "--ui-tooltip-font-size",
  lineHeight: "--ui-tooltip-line-height",
  paddingInline: "--ui-tooltip-padding-inline",
  paddingBlock: "--ui-tooltip-padding-block",
} as const;

export type TooltipToken =
  (typeof tooltipTokenNames)[keyof typeof tooltipTokenNames];
