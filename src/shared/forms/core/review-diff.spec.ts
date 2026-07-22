import { describe, expect, it } from "vitest";

import { unifiedDiff } from "./review-diff";

describe("unifiedDiff", () => {
  it("preserves unchanged words while marking a replacement on its removed and added lines", () => {
    const diff = unifiedDiff(
      "Senior Java Software Engineer focused on payment schemes",
      "Senior Java Software Engineer focused on banking schemes",
    );
    const changed = diff.find((part) => part.type === "changed");

    expect(changed?.lines).toEqual([
      {
        type: "removed",
        text: "Senior Java Software Engineer focused on payment schemes",
        segments: [
          { type: "equal", text: "Senior Java Software Engineer focused on " },
          { type: "removed", text: "payment" },
          { type: "equal", text: " schemes" },
        ],
      },
      {
        type: "added",
        text: "Senior Java Software Engineer focused on banking schemes",
        segments: [
          { type: "equal", text: "Senior Java Software Engineer focused on " },
          { type: "added", text: "banking" },
          { type: "equal", text: " schemes" },
        ],
      },
    ]);
  });

  it("falls back to whole-line additions and removals for large values", () => {
    const before = Array.from({ length: 501 }, (_, index) => `before ${index}`);
    const after = Array.from({ length: 501 }, (_, index) => `after ${index}`);
    const changed = unifiedDiff(before, after).find(
      (part) => part.type === "changed",
    );

    expect(changed?.lines).toHaveLength(1002);
    expect(changed?.lines[0]).toMatchObject({
      type: "removed",
      text: "before 0",
    });
    expect(changed?.lines.at(-1)).toMatchObject({
      type: "added",
      text: "after 500",
    });
  });
});
