export const scroll_areaTokenNames = {
  background: "--ui-scroll-area-background",
  foreground: "--ui-scroll-area-foreground",
  borderColor: "--ui-scroll-area-border-color",
  radius: "--ui-scroll-area-radius",
  focusRingColor: "--ui-scroll-area-focus-ring-color",
} as const;

export type ScrollAreaToken =
  (typeof scroll_areaTokenNames)[keyof typeof scroll_areaTokenNames];
