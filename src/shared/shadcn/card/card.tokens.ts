export const cardTokenNames = {
  background: "--ui-card-background",
  foreground: "--ui-card-foreground",
  borderColor: "--ui-card-border-color",
  radius: "--ui-card-radius",
  focusRingColor: "--ui-card-focus-ring-color",
} as const;

export type CardToken = (typeof cardTokenNames)[keyof typeof cardTokenNames];
