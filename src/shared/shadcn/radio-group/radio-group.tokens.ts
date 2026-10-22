export const radio_groupTokenNames = {
  background: "--ui-radio-group-background",
  foreground: "--ui-radio-group-foreground",
  borderColor: "--ui-radio-group-border-color",
  radius: "--ui-radio-group-radius",
  focusRingColor: "--ui-radio-group-focus-ring-color",
} as const;

export type RadioGroupToken =
  (typeof radio_groupTokenNames)[keyof typeof radio_groupTokenNames];
