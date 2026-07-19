export const skeletonTokenNames = {
  background: "--ui-skeleton-background",
  foreground: "--ui-skeleton-foreground",
  borderColor: "--ui-skeleton-border-color",
  radius: "--ui-skeleton-radius",
  focusRingColor: "--ui-skeleton-focus-ring-color",
} as const;

export type SkeletonToken =
  (typeof skeletonTokenNames)[keyof typeof skeletonTokenNames];
