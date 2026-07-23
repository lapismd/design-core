import { describe, expect, it } from "vitest";
import {
  attachSidecars,
  countVisualStories,
  grepFromStoryIds,
  parseListReporterProgress,
  stripAnsi,
} from "storybook-addon-visual-delta/node";
import {
  addSkipVisualToStoryOpenTag,
  patchStoryOpenTagWithBaselineUrl,
  removeSkipVisualFromStoryOpenTag,
  storyOpenTagMatchesIdSlug,
} from "../visual/patch-story-visual-delta.js";
import { patchStoryOpenTagWithReviewStatus } from "../visual/patch-story-visual-review.js";

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

  it("escapes a single story id and anchors only at the end", () => {
    expect(
      grepFromStoryIds(["shadcn-disclosure-accordion--opens-a-section"]),
    ).toBe("shadcn-disclosure-accordion--opens-a-section$");
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
      "(shadcn-actions-button--default|shadcn-disclosure-accordion--default)$",
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
  const url = "/visual-baselines/shadcn/button/default-chromium-darwin.png";

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

  it("skips skip-visual stories until the tag is removed", () => {
    const tag = `<Story name="Default" tags={["skip-visual"]}>`;
    expect(patchStoryOpenTagWithBaselineUrl(tag, url)).toBe(tag);
    const optedIn = removeSkipVisualFromStoryOpenTag(tag);
    expect(optedIn).not.toContain("skip-visual");
    expect(patchStoryOpenTagWithBaselineUrl(optedIn, url)).toContain(url);
  });
});

describe("removeSkipVisualFromStoryOpenTag", () => {
  it("removes skip-visual and keeps other tags", () => {
    const next = removeSkipVisualFromStoryOpenTag(
      `<Story name="Default" tags={["skip-visual", "visual-state"]}>`,
    );
    expect(next).toContain('"visual-state"');
    expect(next).not.toContain("skip-visual");
  });

  it("drops an empty tags attribute", () => {
    const next = removeSkipVisualFromStoryOpenTag(
      `<Story name="Default" tags={["skip-visual"]}>`,
    );
    expect(next).toBe(`<Story name="Default">`);
  });
});

describe("addSkipVisualToStoryOpenTag", () => {
  it("adds skip-visual when no tags exist", () => {
    const next = addSkipVisualToStoryOpenTag(`<Story name="Default">`);
    expect(next).toContain('tags={["skip-visual"]}');
  });

  it("adds skip-visual and clears review tags", () => {
    const next = addSkipVisualToStoryOpenTag(
      `<Story name="Default" tags={["visual-approved", "visual-state"]}>`,
    );
    expect(next).toContain('"skip-visual"');
    expect(next).toContain('"visual-state"');
    expect(next).not.toContain("visual-approved");
  });

  it("is idempotent when skip-visual already present", () => {
    const tag = `<Story name="Default" tags={["skip-visual", "test"]}>`;
    expect(addSkipVisualToStoryOpenTag(tag)).toBe(tag);
  });
});

describe("baselineUrlForStoryRef (panel hydrate)", () => {
  // Keep import path mapping in sync with panel post-create hydrate.
  it("builds forms/form-field URLs and can ignore stale skip-visual", async () => {
    const { baselineUrlForStoryRef } = await import(
      "../../../packages/storybook-addon-visual-delta/src/shared/baseline-url.ts"
    );
    const story = {
      id: "ui-forms-form-field--center-aligned",
      importPath:
        "./src/shared/forms/form-field/FormField.variations.stories.svelte",
      tags: ["skip-visual"],
    };
    expect(baselineUrlForStoryRef(story)).toBeUndefined();
    expect(baselineUrlForStoryRef(story, { allowSkipVisual: true })).toBe(
      "/visual-baselines/forms/form-field/center-aligned-chromium-darwin.png",
    );
  });
});

describe("storyOpenTagMatchesIdSlug", () => {
  it("matches Default row when exportName would sanitize differently", () => {
    // Regression: preferring exportName="DefaultRow" → slug "defaultrow"
    // missed story id …--default-row, so skip-visual was never removed.
    const tag = `<Story
  name="Default row"
  exportName="DefaultRow"
  tags={["skip-visual"]}
>`;
    expect(
      storyOpenTagMatchesIdSlug(tag, "ui-forms-form-field--default-row"),
    ).toBe(true);
    expect(storyOpenTagMatchesIdSlug(tag, "default-row")).toBe(true);
    expect(storyOpenTagMatchesIdSlug(tag, "defaultrow")).toBe(true);

    const optedIn = removeSkipVisualFromStoryOpenTag(tag);
    expect(optedIn).not.toContain("skip-visual");
    const url =
      "/visual-baselines/forms/form-field/default-row-chromium-darwin.png";
    expect(patchStoryOpenTagWithBaselineUrl(optedIn, url)).toContain(url);
  });
});

describe("patchStoryOpenTagWithReviewStatus", () => {
  it("adds visual-pending when no tags exist", () => {
    const next = patchStoryOpenTagWithReviewStatus(
      `<Story name="Default">`,
      "pending",
    );
    expect(next).toContain('tags={["visual-pending"]}');
  });

  it("swaps pending for approved and keeps other tags", () => {
    const next = patchStoryOpenTagWithReviewStatus(
      `<Story name="Default" tags={["skip-test", "visual-pending"]}>`,
      "approved",
    );
    expect(next).toContain('"skip-test"');
    expect(next).toContain('"visual-approved"');
    expect(next).not.toContain("visual-pending");
  });

  it("swaps approved for failed", () => {
    const next = patchStoryOpenTagWithReviewStatus(
      `<Story name="Default" tags={["visual-approved"]}>`,
      "failed",
    );
    expect(next).toContain('"visual-failed"');
    expect(next).not.toContain("visual-approved");
  });

  it("is idempotent when the status tag is already present", () => {
    const tag = `<Story name="Default" tags={["visual-approved"]}>`;
    expect(patchStoryOpenTagWithReviewStatus(tag, "approved")).toBe(tag);
  });
});
