export const checkboxTokenNames = {
  background: "--ui-checkbox-background",
  foreground: "--ui-checkbox-foreground",
  borderColor: "--ui-checkbox-border-color",
  radius: "--ui-checkbox-radius",
  focusRingColor: "--ui-checkbox-focus-ring-color",
} as const;

export type CheckboxToken =
  (typeof checkboxTokenNames)[keyof typeof checkboxTokenNames];
