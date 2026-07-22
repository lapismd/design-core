export const sheetTokenNames = {
  background: "--ui-sheet-background",
  foreground: "--ui-sheet-foreground",
  borderColor: "--ui-sheet-border-color",
  radius: "--ui-sheet-radius",
  focusRingColor: "--ui-sheet-focus-ring-color",
} as const;

export type SheetToken =
  (typeof sheetTokenNames)[keyof typeof sheetTokenNames];
