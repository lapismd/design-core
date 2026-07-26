import { describe, expect, it } from "vitest";
import {
  advanceFModeQuery,
  createHintLabels,
  normalizeFModeAlphabet,
} from "./hint-labels.js";

describe("F-Mode hint labels", () => {
  it("normalizes the alphabet and generates prefix-free labels", () => {
    expect(normalizeFModeAlphabet("A A S!!1")).toEqual(["a", "s", "1"]);
    const labels = createHintLabels(8, "asd");
    for (const label of labels) {
      expect(
        labels.some(
          (candidate) => candidate !== label && candidate.startsWith(label),
        ),
      ).toBe(false);
    }
  });

  it("advances only while the query matches a target", () => {
    const entries = [
      { target: { id: "one" }, hint: "a", index: 0 },
      { target: { id: "two" }, hint: "s", index: 1 },
    ];
    expect(advanceFModeQuery(entries, "", "a")).toMatchObject({
      accepted: true,
      state: { query: "a", exactMatch: entries[0] },
    });
    expect(advanceFModeQuery(entries, "", "z")).toMatchObject({
      accepted: false,
      state: { query: "" },
    });
  });
});
