export const tableTokenNames = {
  background: "--ui-table-background",
  foreground: "--ui-table-foreground",
  borderColor: "--ui-table-border-color",
  radius: "--ui-table-radius",
  focusRingColor: "--ui-table-focus-ring-color",
} as const;

export type TableToken =
  (typeof tableTokenNames)[keyof typeof tableTokenNames];
