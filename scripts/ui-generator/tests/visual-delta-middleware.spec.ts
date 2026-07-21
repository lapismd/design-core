import { describe, expect, it } from "vitest";
import {
  attachSidecars,
  countVisualStories,
  grepFromStoryIds,
  parseListReporterProgress,
  stripAnsi,
} from "../../../.storybook/visual-delta-middleware.js";
import { patchStoryOpenTagWithBaselineUrl } from "../visual/patch-story-visual-delta.js";

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

  it("anchors and escapes a single story id", () => {
    expect(grepFromStoryIds(["shadcn-disclosure-accordion--opens-a-section"])).toBe(
      "^shadcn-disclosure-accordion--opens-a-section$",
    );
  });

  it("uses an anchored shared title prefix for one component", () => {
    expect(
      grepFromStoryIds([
        "shadcn-disclosure-accordion--opens-a-section",
        "shadcn-disclosure-accordion--default",
      ]),
    ).toBe("^shadcn-disclosure-accordion--");
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

describe("countVisualStories", () => {
  it("falls back to storyIds length when index is missing", () => {
    expect(
      countVisualStories("/nonexistent-root-for-visual-delta-count", [
        "a--one",
        "a--two",
      ]),
    ).toBe(2);
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

describe("patchStoryOpenTagWithBaselineUrl", () => {
  const url =
    "/visual-baselines/shadcn/button/default-chromium-darwin.png";

  it("inserts visualDelta when parameters are missing", () => {
    const tag = `<Story name="Default">`;
    const next = patchStoryOpenTagWithBaselineUrl(tag, url);
    expect(next).toContain("visualDelta:");
    expect(next).toContain(url);
    expect(next).toContain('name="Default"');
  });

  it("is a no-op when the URL is already present", () => {
    const tag = `<Story name="Default" parameters={{
    visualDelta: { images: [${JSON.stringify(url)}] },
  }}>`;
    expect(patchStoryOpenTagWithBaselineUrl(tag, url)).toBe(tag);
  });

  it("appends to an existing images array", () => {
    const tag = `<Story name="Default" parameters={{
    visualDelta: { images: ["/visual-baselines/other.png"] },
  }}>`;
    const next = patchStoryOpenTagWithBaselineUrl(tag, url);
    expect(next).toContain("/visual-baselines/other.png");
    expect(next).toContain(url);
  });

  it("skips skip-visual stories", () => {
    const tag = `<Story name="Default" tags={["skip-visual"]}>`;
    expect(patchStoryOpenTagWithBaselineUrl(tag, url)).toBe(tag);
  });
});
