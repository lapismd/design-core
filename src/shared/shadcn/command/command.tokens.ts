export const commandTokenNames = {
  background: "--ui-command-background",
  foreground: "--ui-command-foreground",
  borderColor: "--ui-command-border-color",
  radius: "--ui-command-radius",
  focusRingColor: "--ui-command-focus-ring-color",
} as const;

export type CommandToken =
  (typeof commandTokenNames)[keyof typeof commandTokenNames];
