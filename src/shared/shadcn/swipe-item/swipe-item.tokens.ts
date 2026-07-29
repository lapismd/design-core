export const swipeItemTokenNames = {
  background: "--ui-swipe-item-background",
  contentBackground: "--ui-swipe-item-content-background",
  actionBackground: "--ui-swipe-item-action-background",
  borderColor: "--ui-swipe-item-border-color",
  radius: "--ui-swipe-item-radius",
  actionMinWidth: "--ui-swipe-item-action-min-width",
  focusRingColor: "--ui-swipe-item-focus-ring-color",
  armedRingColor: "--ui-swipe-item-armed-ring-color",
  settleDuration: "--ui-swipe-item-settle-duration",
} as const;

export type SwipeItemToken =
  (typeof swipeItemTokenNames)[keyof typeof swipeItemTokenNames];
