import { describe, expect, it } from "vitest";
import {
  dominantAxis,
  motionDurationMs,
  pointerDelta,
  shouldAcceptReorderDrag,
  shouldCancelSwipeForScroll,
  shouldPagerBack,
  shouldRevealRowSwipe,
} from "./motion.js";

describe("Tasks motion helpers", () => {
  it("classifies horizontal swipe vs vertical scroll intent", () => {
    const swipe = pointerDelta({ x: 100, y: 40 }, { x: 50, y: 42 });
    expect(dominantAxis(swipe)).toBe("horizontal");
    expect(shouldRevealRowSwipe(swipe)).toBe(true);
    expect(shouldCancelSwipeForScroll(swipe)).toBe(false);

    const scroll = pointerDelta({ x: 100, y: 40 }, { x: 98, y: 80 });
    expect(dominantAxis(scroll)).toBe("vertical");
    expect(shouldCancelSwipeForScroll(scroll)).toBe(true);
    expect(shouldRevealRowSwipe(scroll)).toBe(false);
  });

  it("accepts reorder and pager-back thresholds", () => {
    expect(
      shouldAcceptReorderDrag(pointerDelta({ x: 0, y: 0 }, { x: 2, y: 20 })),
    ).toBe(true);
    expect(shouldPagerBack(pointerDelta({ x: 0, y: 0 }, { x: 40, y: 2 }))).toBe(
      true,
    );
  });

  it("zeros duration under reduced motion", () => {
    expect(motionDurationMs(true, 240, "instant")).toBe(0);
    expect(motionDurationMs(false, 240, "instant")).toBe(240);
  });
});
