export type ScrollAreaVisibility = "scroll" | "hover" | "always";

export type ScrollAreaType = ScrollAreaVisibility | "auto";

export const SCROLL_AREA_VISIBILITY_ATTRIBUTE =
  "data-ui-scrollbar-visibility" as const;

export interface OverlayScrollbarMetrics {
  overflowing: boolean;
  maxScroll: number;
  maxThumbTravel: number;
  thumbOffset: number;
  thumbSize: number;
}

export function isScrollAreaVisibility(
  value: unknown,
): value is ScrollAreaVisibility {
  return value === "scroll" || value === "hover" || value === "always";
}

export function calculateOverlayScrollbarMetrics({
  viewportSize,
  contentSize,
  scrollOffset,
  trackSize = viewportSize,
  minimumThumbSize = 20,
}: {
  viewportSize: number;
  contentSize: number;
  scrollOffset: number;
  trackSize?: number;
  minimumThumbSize?: number;
}): OverlayScrollbarMetrics {
  const safeViewportSize = Math.max(0, viewportSize);
  const safeContentSize = Math.max(0, contentSize);
  const safeTrackSize = Math.max(0, trackSize);
  const maxScroll = Math.max(0, safeContentSize - safeViewportSize);
  const overflowing = maxScroll > 1 && safeTrackSize > 0;
  if (!overflowing) {
    return {
      overflowing: false,
      maxScroll,
      maxThumbTravel: 0,
      thumbOffset: 0,
      thumbSize: safeTrackSize,
    };
  }

  const proportionalSize = safeTrackSize * (safeViewportSize / safeContentSize);
  const thumbSize = Math.min(
    safeTrackSize,
    Math.max(Math.min(minimumThumbSize, safeTrackSize), proportionalSize),
  );
  const maxThumbTravel = Math.max(0, safeTrackSize - thumbSize);
  const clampedScrollOffset = Math.min(maxScroll, Math.max(0, scrollOffset));
  const thumbOffset =
    maxScroll === 0 ? 0 : (clampedScrollOffset / maxScroll) * maxThumbTravel;

  return {
    overflowing: true,
    maxScroll,
    maxThumbTravel,
    thumbOffset,
    thumbSize,
  };
}

export function shouldShowOverlayScrollbar({
  overflowing,
  type,
  hovered,
  scrollbarHovered = false,
  scrolling,
  interacting,
}: {
  overflowing: boolean;
  type: ScrollAreaType;
  hovered: boolean;
  scrollbarHovered?: boolean;
  scrolling: boolean;
  interacting: boolean;
}): boolean {
  if (!overflowing) return false;
  if (type === "always" || type === "auto") return true;
  if (type === "hover") return hovered || interacting;
  return scrolling || scrollbarHovered || interacting;
}

export function scrollOffsetForTrackPress({
  pointerOffset,
  metrics,
  viewportSize,
  currentScrollOffset,
}: {
  pointerOffset: number;
  metrics: OverlayScrollbarMetrics;
  viewportSize: number;
  currentScrollOffset: number;
}): number {
  if (!metrics.overflowing) return 0;
  const beforeThumb = pointerOffset < metrics.thumbOffset;
  const afterThumb = pointerOffset > metrics.thumbOffset + metrics.thumbSize;
  const delta = beforeThumb ? -viewportSize : afterThumb ? viewportSize : 0;
  return Math.min(metrics.maxScroll, Math.max(0, currentScrollOffset + delta));
}

export function scrollOffsetForThumbDrag({
  pointerDelta,
  startScrollOffset,
  metrics,
}: {
  pointerDelta: number;
  startScrollOffset: number;
  metrics: OverlayScrollbarMetrics;
}): number {
  if (!metrics.overflowing || metrics.maxThumbTravel === 0) return 0;
  const next =
    startScrollOffset +
    (pointerDelta / metrics.maxThumbTravel) * metrics.maxScroll;
  return Math.min(metrics.maxScroll, Math.max(0, next));
}
