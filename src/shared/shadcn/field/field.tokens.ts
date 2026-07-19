export const fieldTokenNames = {
  background: "--ui-field-background",
  foreground: "--ui-field-foreground",
  borderColor: "--ui-field-border-color",
  radius: "--ui-field-radius",
  focusRingColor: "--ui-field-focus-ring-color",
} as const;

export type FieldToken =
  (typeof fieldTokenNames)[keyof typeof fieldTokenNames];
