export const progressTokenNames = {
  background: "--ui-progress-background",
  foreground: "--ui-progress-foreground",
  borderColor: "--ui-progress-border-color",
  radius: "--ui-progress-radius",
  focusRingColor: "--ui-progress-focus-ring-color",
} as const;

export type ProgressToken =
  (typeof progressTokenNames)[keyof typeof progressTokenNames];
