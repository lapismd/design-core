import { describe, expect, it } from "vitest";
import { fitTags } from "./tag-list-fit.js";

describe("TagList measured fitting", () => {
  it("handles empty, exact fits and single long tags", () => {
    expect(fitTags([], 0, 4, [], 20)).toEqual({ visibleCount: 0 });
    expect(fitTags([40, 50], 94, 4, [0, 25, 25], 20)).toEqual({
      visibleCount: 2,
    });
    expect(fitTags([200], 70, 4, [0, 25], 20)).toEqual({
      visibleCount: 1,
      firstWidth: 70,
    });
    expect(fitTags([200], 10, 4, [0, 25], 20)).toEqual({ visibleCount: 0 });
  });
  it("reserves the actual count button and gap at the fitting boundary", () => {
    expect(fitTags([40, 50, 60], 123, 4, [0, 25, 25, 25], 20)).toEqual({
      visibleCount: 2,
    });
    expect(fitTags([40, 50, 60], 122.9, 4, [0, 25, 25, 25], 20)).toEqual({
      visibleCount: 1,
    });
  });
  it("preserves priority rather than skipping a wide leading tag", () => {
    expect(fitTags([200, 20, 20], 100, 4, [0, 25, 25, 25], 30)).toEqual({
      visibleCount: 1,
      firstWidth: 71,
    });
    expect(fitTags([200, 20, 20], 58, 4, [0, 25, 25, 25], 30)).toEqual({
      visibleCount: 0,
    });
  });
  it("accounts for the indicator changing between one and two digits", () => {
    const widths = Array.from({ length: 12 }, () => 20);
    const indicators = Array.from({ length: 13 }, (_, count) =>
      count >= 10 ? 35 : 25,
    );
    expect(fitTags(widths, 83, 4, indicators, 15)).toEqual({ visibleCount: 2 });
    expect(fitTags(widths, 97, 4, indicators, 15)).toEqual({ visibleCount: 3 });
  });
  it("fits fractional measurements without a fixed visible count", () => {
    expect(
      fitTags([31.5, 44.25, 18.75], 99.5, 2.5, [0, 19.5, 19.5, 19.5], 15),
    ).toEqual({ visibleCount: 3 });
    expect(
      fitTags([31.5, 44.25, 18.75], 98, 2.5, [0, 19.5, 19.5, 19.5], 15),
    ).toEqual({ visibleCount: 1 });
  });
});
