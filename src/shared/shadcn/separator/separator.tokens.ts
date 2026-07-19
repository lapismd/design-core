export const separatorTokenNames = {
  background: "--ui-separator-background",
  foreground: "--ui-separator-foreground",
  borderColor: "--ui-separator-border-color",
  radius: "--ui-separator-radius",
  focusRingColor: "--ui-separator-focus-ring-color",
} as const;

export type SeparatorToken =
  (typeof separatorTokenNames)[keyof typeof separatorTokenNames];
