import { describe, expect, it } from "vitest";
import {
  constrainSwipeItemOffset,
  resolveSwipeItemSettle,
  swipeItemPhysicalSign,
  swipeItemSideForOffset,
  swipeItemStableOffset,
} from "./swipe-item-gesture.js";

const widths = { start: 96, end: 144 };
const fullSwipe = { start: true, end: true };

describe("SwipeItem gesture math", () => {
  it("maps logical sides through LTR and RTL", () => {
    expect(swipeItemPhysicalSign("start", "ltr")).toBe(1);
    expect(swipeItemPhysicalSign("end", "ltr")).toBe(-1);
    expect(swipeItemPhysicalSign("start", "rtl")).toBe(-1);
    expect(swipeItemPhysicalSign("end", "rtl")).toBe(1);
    expect(swipeItemSideForOffset(20, "ltr")).toBe("start");
    expect(swipeItemSideForOffset(-20, "ltr")).toBe("end");
    expect(swipeItemSideForOffset(20, "rtl")).toBe("end");
    expect(swipeItemSideForOffset(-20, "rtl")).toBe("start");
  });

  it("preserves a logical open state when direction or pane width changes", () => {
    expect(swipeItemStableOffset("start", "ltr", widths)).toBe(96);
    expect(swipeItemStableOffset("start", "rtl", widths)).toBe(-96);
    expect(swipeItemStableOffset("end", "ltr", { ...widths, end: 180 })).toBe(
      -180,
    );
    expect(swipeItemStableOffset(null, "ltr", widths)).toBe(0);
  });

  it("clamps ordinary reveals and resists eligible full swipes", () => {
    expect(
      constrainSwipeItemOffset({
        rawOffset: -240,
        direction: "ltr",
        widths,
        fullSwipe: { start: false, end: false },
        itemWidth: 400,
      }),
    ).toBe(-144);
    expect(
      constrainSwipeItemOffset({
        rawOffset: -400,
        direction: "ltr",
        widths,
        fullSwipe,
        itemWidth: 400,
      }),
    ).toBeCloseTo(-310.4);
    expect(
      constrainSwipeItemOffset({
        rawOffset: 200,
        direction: "ltr",
        widths: { start: 0, end: 144 },
        fullSwipe,
        itemWidth: 400,
      }),
    ).toBe(0);
  });

  it("uses exact reveal and full-swipe threshold boundaries", () => {
    const base = {
      startOffset: 0,
      velocityX: 0,
      direction: "ltr" as const,
      widths,
      fullSwipe,
      itemWidth: 400,
      revealThreshold: 0.5,
      fullSwipeThreshold: 0.75,
      velocityThreshold: 0.45,
    };

    expect(resolveSwipeItemSettle({ ...base, offset: -71 })).toEqual({
      kind: "close",
    });
    expect(resolveSwipeItemSettle({ ...base, offset: -72 })).toEqual({
      kind: "open",
      side: "end",
    });
    expect(resolveSwipeItemSettle({ ...base, offset: -299 })).toEqual({
      kind: "open",
      side: "end",
    });
    expect(resolveSwipeItemSettle({ ...base, offset: -300 })).toEqual({
      kind: "commit",
      side: "end",
    });
  });

  it("uses velocity for reveal and close but never for a short commit", () => {
    const base = {
      direction: "ltr" as const,
      widths,
      fullSwipe,
      itemWidth: 400,
      revealThreshold: 0.5,
      fullSwipeThreshold: 0.75,
      velocityThreshold: 0.45,
    };

    expect(
      resolveSwipeItemSettle({
        ...base,
        offset: -20,
        startOffset: 0,
        velocityX: -0.7,
      }),
    ).toEqual({ kind: "open", side: "end" });
    expect(
      resolveSwipeItemSettle({
        ...base,
        offset: 60,
        startOffset: 96,
        velocityX: -0.7,
      }),
    ).toEqual({ kind: "close" });
    expect(
      resolveSwipeItemSettle({
        ...base,
        offset: -20,
        startOffset: 96,
        velocityX: -0.7,
      }),
    ).toEqual({ kind: "open", side: "end" });
  });

  it("does not reveal or commit an unavailable side", () => {
    expect(
      resolveSwipeItemSettle({
        offset: 320,
        startOffset: 0,
        velocityX: 0.8,
        direction: "ltr",
        widths: { start: 0, end: 144 },
        fullSwipe,
        itemWidth: 400,
        revealThreshold: 0.5,
        fullSwipeThreshold: 0.75,
        velocityThreshold: 0.45,
      }),
    ).toEqual({ kind: "close" });
  });
});
