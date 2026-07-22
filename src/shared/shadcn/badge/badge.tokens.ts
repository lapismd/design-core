export const badgeTokenNames = {
  background: "--ui-badge-background",
  foreground: "--ui-badge-foreground",
  borderColor: "--ui-badge-border-color",
  radius: "--ui-badge-radius",
  focusRingColor: "--ui-badge-focus-ring-color",
} as const;

export type BadgeToken = (typeof badgeTokenNames)[keyof typeof badgeTokenNames];
