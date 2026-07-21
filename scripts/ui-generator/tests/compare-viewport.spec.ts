import { describe, expect, it } from "vitest";
import { VISUAL_COMPARE_PANE_PAD_PX } from "../../../packages/storybook-addon-visual-delta/src/constants.js";
import { baselineCompareSizesFromNatural } from "../../../packages/storybook-addon-visual-delta/src/shared/compare-viewport.js";

describe("baselineCompareSizesFromNatural", () => {
  it("converts device-scale natural size to CSS content + padded viewport", () => {
    // 300×150 CSS at DSF 3 → 900×450 natural
    const sizes = baselineCompareSizesFromNatural(900, 450);
    expect(sizes).toEqual({
      content: { width: 300, height: 150 },
      viewport: {
        width: 300 + VISUAL_COMPARE_PANE_PAD_PX * 2,
        height: 150 + VISUAL_COMPARE_PANE_PAD_PX * 2,
      },
    });
  });

  it("returns null for invalid natural size", () => {
    expect(baselineCompareSizesFromNatural(0, 100)).toBeNull();
    expect(baselineCompareSizesFromNatural(100, 0)).toBeNull();
  });
});
