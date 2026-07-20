import { describe, expect, it } from "vitest";
import {
  attachSidecars,
  grepFromStoryIds,
  parseListReporterProgress,
  stripAnsi,
} from "../../../.storybook/visual-delta-middleware.js";

describe("parseListReporterProgress", () => {
  it("parses passed and failed list-reporter lines", () => {
    const chunk = [
      "  ✓   1 [chromium] › tests/visual/storybook.spec.ts:42:3 › shadcn-button--default (823ms)",
      "  ✘   2 [chromium] › tests/visual/storybook.spec.ts:42:3 › shadcn-button--disabled (1.2s)",
    ].join("\n");
    expect(parseListReporterProgress(chunk)).toEqual([
      {
        index: 1,
        storyId: "shadcn-button--default",
        status: "passed",
      },
      {
        index: 2,
        storyId: "shadcn-button--disabled",
        status: "failed",
      },
    ]);
  });

  it("strips ANSI color codes before parsing", () => {
    const colored =
      "  \u001B[32m✓\u001B[39m   3 [chromium] › storybook.spec.ts › forms-form-field--default (45ms)";
    expect(stripAnsi(colored)).toContain("✓");
    expect(parseListReporterProgress(colored)).toEqual([
      {
        index: 3,
        storyId: "forms-form-field--default",
        status: "passed",
      },
    ]);
  });
});

describe("grepFromStoryIds", () => {
  it("returns undefined for an empty selection", () => {
    expect(grepFromStoryIds()).toBeUndefined();
    expect(grepFromStoryIds([])).toBeUndefined();
  });

  it("uses the full story id for a single selection", () => {
    expect(grepFromStoryIds(["shadcn-disclosure-accordion--opens-a-section"])).toBe(
      "shadcn-disclosure-accordion--opens-a-section",
    );
  });

  it("uses a shared title prefix for one component", () => {
    expect(
      grepFromStoryIds([
        "shadcn-disclosure-accordion--opens-a-section",
        "shadcn-disclosure-accordion--default",
      ]),
    ).toBe("shadcn-disclosure-accordion--");
  });

  it("ORs distinct story ids across components", () => {
    expect(
      grepFromStoryIds([
        "shadcn-actions-button--default",
        "shadcn-disclosure-accordion--default",
      ]),
    ).toBe(
      "^(shadcn-actions-button--default|shadcn-disclosure-accordion--default)$",
    );
  });
});

describe("attachSidecars", () => {
  it("leaves results unchanged when no sidecar exists", () => {
    const results = [
      {
        storyId: "missing-story--default",
        status: "passed" as const,
        title: "missing-story--default",
      },
    ];
    expect(attachSidecars(results, process.cwd())).toEqual(results);
  });
});
