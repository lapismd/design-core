export const hover_cardTokenNames = {
  background: "--ui-hover-card-background",
  foreground: "--ui-hover-card-foreground",
  borderColor: "--ui-hover-card-border-color",
  radius: "--ui-hover-card-radius",
  focusRingColor: "--ui-hover-card-focus-ring-color",
  zIndex: "--ui-hover-card-z-index",
} as const;

export type HoverCardToken =
  (typeof hover_cardTokenNames)[keyof typeof hover_cardTokenNames];
