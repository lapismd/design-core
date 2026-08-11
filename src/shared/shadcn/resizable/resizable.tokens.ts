export const resizableTokenNames = {
  background: "--ui-resizable-background",
  foreground: "--ui-resizable-foreground",
  borderColor: "--ui-resizable-border-color",
  radius: "--ui-resizable-radius",
  focusRingColor: "--ui-resizable-focus-ring-color",
  prominentSeparatorSize: "--ui-resizable-prominent-separator-size",
  prominentThumbWidth: "--ui-resizable-prominent-thumb-width",
  prominentThumbHeight: "--ui-resizable-prominent-thumb-height",
  prominentHitArea: "--ui-resizable-prominent-hit-area",
} as const;

export type ResizableToken =
  (typeof resizableTokenNames)[keyof typeof resizableTokenNames];
