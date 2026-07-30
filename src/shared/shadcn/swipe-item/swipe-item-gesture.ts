import type { SwipeItemOpen, SwipeItemSide } from "./types.js";

export type SwipeItemDirection = "ltr" | "rtl";

/** Idle gap after the last wheel event before settling a trackpad swipe. */
export const SWIPE_ITEM_WHEEL_IDLE_MS = 100;

export interface SwipeItemWidths {
  start: number;
  end: number;
}

/**
 * Map wheel `deltaX` into the same physical offset space as pointer drag.
 * Positive wheel deltaX scrolls right (content moves left) → negative offset.
 */
export function swipeItemOffsetDeltaFromWheel(deltaX: number): number {
  return -deltaX;
}

export type SwipeItemSettleResult =
  | { kind: "close" }
  | { kind: "open"; side: SwipeItemSide }
  | { kind: "commit"; side: SwipeItemSide };

function clampRatio(value: number): number {
  return Math.max(0, Math.min(1, value));
}

export function swipeItemPhysicalSign(
  side: SwipeItemSide,
  direction: SwipeItemDirection,
): -1 | 1 {
  if (direction === "ltr") return side === "start" ? 1 : -1;
  return side === "start" ? -1 : 1;
}

export function swipeItemSideForOffset(
  offset: number,
  direction: SwipeItemDirection,
): SwipeItemSide | null {
  if (offset === 0) return null;
  const positiveSide = direction === "ltr" ? "start" : "end";
  return offset > 0 ? positiveSide : positiveSide === "start" ? "end" : "start";
}

export function swipeItemStableOffset(
  open: SwipeItemOpen,
  direction: SwipeItemDirection,
  widths: SwipeItemWidths,
): number {
  if (!open) return 0;
  return swipeItemPhysicalSign(open, direction) * Math.max(0, widths[open]);
}

export function constrainSwipeItemOffset(options: {
  rawOffset: number;
  direction: SwipeItemDirection;
  widths: SwipeItemWidths;
  fullSwipe: Record<SwipeItemSide, boolean>;
  itemWidth: number;
  resistance?: number;
}): number {
  const side = swipeItemSideForOffset(options.rawOffset, options.direction);
  if (!side) return 0;

  const paneWidth = Math.max(0, options.widths[side]);
  if (paneWidth === 0) return 0;

  const sign = swipeItemPhysicalSign(side, options.direction);
  const distance = Math.abs(options.rawOffset);
  if (distance <= paneWidth) return sign * distance;
  if (!options.fullSwipe[side]) return sign * paneWidth;

  const resistance = clampRatio(options.resistance ?? 0.65);
  const resisted = paneWidth + (distance - paneWidth) * resistance;
  return sign * Math.min(Math.max(paneWidth, options.itemWidth), resisted);
}

export function resolveSwipeItemSettle(options: {
  offset: number;
  startOffset: number;
  velocityX: number;
  direction: SwipeItemDirection;
  widths: SwipeItemWidths;
  fullSwipe: Record<SwipeItemSide, boolean>;
  itemWidth: number;
  revealThreshold: number;
  fullSwipeThreshold: number;
  velocityThreshold: number;
}): SwipeItemSettleResult {
  const side = swipeItemSideForOffset(options.offset, options.direction);
  const distance = Math.abs(options.offset);

  if (
    side &&
    options.widths[side] > 0 &&
    options.fullSwipe[side] &&
    distance >=
      Math.max(0, options.itemWidth) * clampRatio(options.fullSwipeThreshold)
  ) {
    return { kind: "commit", side };
  }

  if (Math.abs(options.velocityX) >= Math.max(0, options.velocityThreshold)) {
    const startSign = Math.sign(options.startOffset);
    const currentSign = Math.sign(options.offset);
    const velocitySign = Math.sign(options.velocityX);

    if (
      startSign !== 0 &&
      velocitySign === -startSign &&
      currentSign === startSign
    ) {
      return { kind: "close" };
    }

    const velocitySide = swipeItemSideForOffset(
      options.velocityX,
      options.direction,
    );
    if (velocitySide && options.widths[velocitySide] > 0) {
      return { kind: "open", side: velocitySide };
    }
    return { kind: "close" };
  }

  if (
    side &&
    options.widths[side] > 0 &&
    distance >= options.widths[side] * clampRatio(options.revealThreshold)
  ) {
    return { kind: "open", side };
  }

  return { kind: "close" };
}
