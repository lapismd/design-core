import { describe, expect, it } from "vitest";
import { formatDiffDelta } from "./format-diff-delta.js";

describe("formatDiffDelta", () => {
  it("prefixes positive counts and clamps non-positive values to zero", () => {
    expect(formatDiffDelta(3, "+")).toBe("+3");
    expect(formatDiffDelta(0, "-")).toBe("-0");
    expect(formatDiffDelta(-2, "+")).toBe("+0");
  });
});
