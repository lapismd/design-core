export const input_groupTokenNames = {
  background: "--ui-input-group-background",
  foreground: "--ui-input-group-foreground",
  borderColor: "--ui-input-group-border-color",
  radius: "--ui-input-group-radius",
  focusRingColor: "--ui-input-group-focus-ring-color",
} as const;

export type InputGroupToken =
  (typeof input_groupTokenNames)[keyof typeof input_groupTokenNames];
