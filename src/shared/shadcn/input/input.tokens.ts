export const inputTokenNames = {
  background: "--ui-input-background",
  foreground: "--ui-input-foreground",
  borderColor: "--ui-input-border-color",
  radius: "--ui-input-radius",
  focusRingColor: "--ui-input-focus-ring-color",
} as const;

export type InputToken = (typeof inputTokenNames)[keyof typeof inputTokenNames];
