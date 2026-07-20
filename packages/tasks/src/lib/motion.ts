/**
 * Gesture math for Tasks row swipe, reorder, and pager back.
 * Thresholds align with motionContracts in reference.ts.
 */

export const SWIPE_REVEAL_PX = 32;
export const SCROLL_INTENT_RATIO = 1.25;
export const REORDER_DRAG_PX = 16;
export const PAGER_BACK_PX = 32;

export type GestureAxis = "horizontal" | "vertical" | "none";

export type PointerDelta = {
  dx: number;
  dy: number;
};

export function pointerDelta(
  start: { x: number; y: number },
  end: { x: number; y: number },
): PointerDelta {
  return { dx: end.x - start.x, dy: end.y - start.y };
}

/** Prefer vertical scroll when |dy| dominates |dx| past the intent ratio. */
export function dominantAxis(delta: PointerDelta): GestureAxis {
  const absX = Math.abs(delta.dx);
  const absY = Math.abs(delta.dy);
  if (absX < 4 && absY < 4) return "none";
  if (absY > absX * SCROLL_INTENT_RATIO) return "vertical";
  if (absX > absY * SCROLL_INTENT_RATIO) return "horizontal";
  return absX >= absY ? "horizontal" : "vertical";
}

export function shouldRevealRowSwipe(delta: PointerDelta): boolean {
  return dominantAxis(delta) === "horizontal" && delta.dx <= -SWIPE_REVEAL_PX;
}

export function shouldCancelSwipeForScroll(delta: PointerDelta): boolean {
  return dominantAxis(delta) === "vertical";
}

export function shouldAcceptReorderDrag(delta: PointerDelta): boolean {
  return (
    dominantAxis(delta) === "vertical" && Math.abs(delta.dy) >= REORDER_DRAG_PX
  );
}

export function shouldPagerBack(delta: PointerDelta): boolean {
  return dominantAxis(delta) === "horizontal" && delta.dx >= PAGER_BACK_PX;
}

export type ReducedMotionMode = "instant" | "short-fade";

export function motionDurationMs(
  prefersReducedMotion: boolean,
  standardMs: number,
  reduced: ReducedMotionMode = "instant",
): number {
  if (!prefersReducedMotion) return standardMs;
  return reduced === "instant" ? 0 : Math.min(120, standardMs);
}
