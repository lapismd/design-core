export const resizableTokenNames = {
  background: "--ui-resizable-background",
  foreground: "--ui-resizable-foreground",
  borderColor: "--ui-resizable-border-color",
  radius: "--ui-resizable-radius",
  focusRingColor: "--ui-resizable-focus-ring-color",
} as const;

export type ResizableToken =
  (typeof resizableTokenNames)[keyof typeof resizableTokenNames];
