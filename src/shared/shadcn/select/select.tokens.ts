export const selectTokenNames = {
  background: "--ui-select-background",
  foreground: "--ui-select-foreground",
  borderColor: "--ui-select-border-color",
  radius: "--ui-select-radius",
  focusRingColor: "--ui-select-focus-ring-color",
} as const;

export type SelectToken =
  (typeof selectTokenNames)[keyof typeof selectTokenNames];
