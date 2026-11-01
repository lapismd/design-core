import { describe, expect, it } from "vitest";
import { resolveWindowControlsOverlap } from "./window-controls-overlap.js";

describe("native window-controls exclusion", () => {
  const window = {
    left: 0,
    right: 1200,
    top: 0,
    height: 38,
    start: 80,
    end: 138,
    scale: 1,
  };
  it("only reserves the portion of controls intersecting a top header", () => {
    expect(
      resolveWindowControlsOverlap(
        { left: 48, right: 320, top: 0, bottom: 32 },
        window,
      ),
    ).toEqual({ start: 32, end: 0, height: 38 });
    expect(
      resolveWindowControlsOverlap(
        { left: 320, right: 1200, top: 0, bottom: 32 },
        window,
      ),
    ).toEqual({ start: 0, end: 138, height: 38 });
  });
  it("does not indent lower split groups or a collapsed title bar", () => {
    expect(
      resolveWindowControlsOverlap(
        { left: 0, right: 1200, top: 200, bottom: 232 },
        window,
      ),
    ).toBeNull();
    expect(
      resolveWindowControlsOverlap(
        { left: 0, right: 1200, top: 0, bottom: 32 },
        { ...window, height: 0 },
      ),
    ).toBeNull();
  });
  it("converts viewport measurements to zoomed layout units", () => {
    expect(
      resolveWindowControlsOverlap(
        { left: 0, right: 1200, top: 0, bottom: 40 },
        { ...window, scale: 1.25 },
      ),
    ).toEqual({ start: 64, end: 110.4, height: 30.4 });
  });
});
