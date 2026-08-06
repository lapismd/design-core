import { describe, expect, it } from "vitest";
import { VISUAL_COMPARE_PANE_PAD_PX } from "@lapismd/storybook-addon-visual-delta/src/constants.js";
import {
  baselineCompareSizesFromNatural,
  sharedScrollExtentSize,
} from "@lapismd/storybook-addon-visual-delta/src/shared/compare-viewport.js";

describe("baselineCompareSizesFromNatural", () => {
  it("converts device-scale natural size to CSS content + padded viewport", () => {
    // 300×150 CSS at DSF 3 → 900×450 natural (host catalog DSF; package default is 1)
    const sizes = baselineCompareSizesFromNatural(
      900,
      450,
      VISUAL_COMPARE_PANE_PAD_PX,
      3,
    );
    expect(sizes).toEqual({
      content: { width: 300, height: 150 },
      viewport: {
        width: 300 + VISUAL_COMPARE_PANE_PAD_PX * 2,
        height: 150 + VISUAL_COMPARE_PANE_PAD_PX * 2,
      },
    });
  });

  it("returns null for invalid natural size", () => {
    expect(baselineCompareSizesFromNatural(0, 100, 0, 3)).toBeNull();
    expect(baselineCompareSizesFromNatural(100, 0, 0, 3)).toBeNull();
  });
});

describe("sharedScrollExtentSize", () => {
  it("takes the max of either side and an optional minimum", () => {
    expect(
      sharedScrollExtentSize(
        { width: 120, height: 40 },
        { width: 80, height: 200 },
        { width: 100, height: 100 },
      ),
    ).toEqual({ width: 120, height: 200 });
  });
});
