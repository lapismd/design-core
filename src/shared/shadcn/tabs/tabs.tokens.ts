export const tabsTokenNames = {
  background: "--ui-tabs-background",
  foreground: "--ui-tabs-foreground",
  borderColor: "--ui-tabs-border-color",
  radius: "--ui-tabs-radius",
  focusRingColor: "--ui-tabs-focus-ring-color",
} as const;

export type TabsToken = (typeof tabsTokenNames)[keyof typeof tabsTokenNames];
