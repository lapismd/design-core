import { describe, expect, it } from "vitest";
import {
  calculateOverlayScrollbarMetrics,
  isScrollAreaVisibility,
  scrollOffsetForThumbDrag,
  scrollOffsetForTrackPress,
  shouldShowOverlayScrollbar,
} from "./scroll-area-model.js";

describe("ScrollArea overlay model", () => {
  it("calculates proportional, minimum, and clamped thumb geometry", () => {
    expect(
      calculateOverlayScrollbarMetrics({
        viewportSize: 100,
        contentSize: 400,
        scrollOffset: 150,
      }),
    ).toEqual({
      overflowing: true,
      maxScroll: 300,
      maxThumbTravel: 75,
      thumbOffset: 37.5,
      thumbSize: 25,
    });

    const minimum = calculateOverlayScrollbarMetrics({
      viewportSize: 100,
      contentSize: 10_000,
      scrollOffset: 99_000,
    });
    expect(minimum.thumbSize).toBe(20);
    expect(minimum.thumbOffset).toBe(80);

    expect(
      calculateOverlayScrollbarMetrics({
        viewportSize: 100,
        contentSize: 100,
        scrollOffset: 0,
      }).overflowing,
    ).toBe(false);
  });

  it("governs scroll, hover, always, auto, and no-overflow visibility", () => {
    const state = {
      overflowing: true,
      hovered: false,
      scrolling: false,
      interacting: false,
    };
    expect(shouldShowOverlayScrollbar({ ...state, type: "scroll" })).toBe(
      false,
    );
    expect(
      shouldShowOverlayScrollbar({ ...state, type: "scroll", scrolling: true }),
    ).toBe(true);
    expect(
      shouldShowOverlayScrollbar({
        ...state,
        type: "scroll",
        scrollbarHovered: true,
      }),
    ).toBe(true);
    expect(
      shouldShowOverlayScrollbar({ ...state, type: "scroll", hovered: true }),
    ).toBe(false);
    expect(
      shouldShowOverlayScrollbar({ ...state, type: "hover", hovered: true }),
    ).toBe(true);
    expect(shouldShowOverlayScrollbar({ ...state, type: "always" })).toBe(true);
    expect(shouldShowOverlayScrollbar({ ...state, type: "auto" })).toBe(true);
    expect(
      shouldShowOverlayScrollbar({
        ...state,
        type: "always",
        overflowing: false,
      }),
    ).toBe(false);
  });

  it("pages tracks and maps pointer drag travel to native scroll offsets", () => {
    const metrics = calculateOverlayScrollbarMetrics({
      viewportSize: 100,
      contentSize: 400,
      scrollOffset: 100,
    });
    expect(
      scrollOffsetForTrackPress({
        pointerOffset: 0,
        metrics,
        viewportSize: 100,
        currentScrollOffset: 100,
      }),
    ).toBe(0);
    expect(
      scrollOffsetForTrackPress({
        pointerOffset: 99,
        metrics,
        viewportSize: 100,
        currentScrollOffset: 250,
      }),
    ).toBe(300);
    expect(
      scrollOffsetForThumbDrag({
        pointerDelta: metrics.maxThumbTravel / 2,
        startScrollOffset: 0,
        metrics,
      }),
    ).toBe(150);
  });

  it("accepts only governed inherited visibility values", () => {
    expect(isScrollAreaVisibility("scroll")).toBe(true);
    expect(isScrollAreaVisibility("hover")).toBe(true);
    expect(isScrollAreaVisibility("always")).toBe(true);
    expect(isScrollAreaVisibility("auto")).toBe(false);
  });
});
