import { describe, expect, it } from "vitest";
import { mkdtempSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
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
import {
  markCreatedStoriesPending,
  patchStoryOpenTagWithReviewStatus,
  patchStoryVisualReviewStatus,
} from "../visual/patch-story-visual-review.js";
import { exactStoryIdGrep } from "../pipeline/visual-update.js";

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

  it("parses suite titles with multiple › separators", () => {
    const chunk =
      "  ✘    3 [chromium] › tests/visual/storybook.spec.ts:573:5 › Storybook visual baselines › shadcn-actions-button--default (1.7s)";
    expect(parseListReporterProgress(chunk)).toEqual([
      {
        index: 3,
        storyId: "shadcn-actions-button--default",
        status: "failed",
      },
    ]);
  });
});

describe("grepFromStoryIds", () => {
  it("returns undefined for an empty selection", () => {
    expect(grepFromStoryIds()).toBeUndefined();
    expect(grepFromStoryIds([])).toBeUndefined();
  });

  it("escapes a single story id and anchors its unique title suffix", () => {
    expect(
      grepFromStoryIds(["shadcn-disclosure-accordion--opens-a-section"]),
    ).toBe("(?:^|\\s)shadcn-disclosure-accordion--opens-a-section$");
  });

  it("ORs exact ids even when they share a component", () => {
    const grep = grepFromStoryIds([
      "shadcn-disclosure-accordion--opens-a-section",
      "shadcn-disclosure-accordion--default",
    ]);
    expect(grep).toBe(
      "(?:^|\\s)(?:shadcn-disclosure-accordion--opens-a-section|shadcn-disclosure-accordion--default)$",
    );
    const playwrightTitle =
      "Storybook visual baselines shadcn-disclosure-accordion--opens-a-section";
    expect(new RegExp(grep!).test(playwrightTitle)).toBe(true);
    expect(new RegExp(grep!).test(`${playwrightTitle}-with-extra-suffix`)).toBe(
      false,
    );
  });

  it("ORs distinct story ids across components", () => {
    expect(
      grepFromStoryIds([
        "shadcn-actions-button--default",
        "shadcn-disclosure-accordion--default",
      ]),
    ).toBe(
      "(?:^|\\s)(?:shadcn-actions-button--default|shadcn-disclosure-accordion--default)$",
    );
  });

  it("does not select a different story whose id merely shares the suffix", () => {
    const grep = grepFromStoryIds(["shadcn-actions-button--default"]);
    expect(
      new RegExp(grep!).test(
        "Storybook visual baselines other-shadcn-actions-button--default",
      ),
    ).toBe(false);
  });
});

describe("exactStoryIdGrep", () => {
  it("keeps repeated host CLI story ids exact", () => {
    expect(
      exactStoryIdGrep([
        "shadcn-overlays-dropdown-menu--chooses-a-menu-item",
        "shadcn-overlays-dropdown-menu--checkboxes",
      ]),
    ).toBe(
      "(?:^|\\s)(?:shadcn-overlays-dropdown-menu--chooses-a-menu-item|shadcn-overlays-dropdown-menu--checkboxes)$",
    );
  });
});

describe("exact baseline review resets", () => {
  it("does not reset an accepted sibling when a later story is updated", () => {
    const root = mkdtempSync(path.join(tmpdir(), "visual-delta-scope-"));
    const storiesPath = path.join(root, "src/Menu.stories.svelte");
    mkdirSync(path.dirname(storiesPath), { recursive: true });
    mkdirSync(path.join(root, "storybook-static"), { recursive: true });
    writeFileSync(
      storiesPath,
      [
        '<Story name="Chooses an item" tags={["visual-approved"]}>',
        '<Story name="Checkboxes" tags={["visual-approved"]}>',
      ].join("\n"),
    );
    writeFileSync(
      path.join(root, "storybook-static/index.json"),
      JSON.stringify({
        entries: {
          "menu--chooses-an-item": {
            id: "menu--chooses-an-item",
            type: "story",
            name: "Chooses an item",
            importPath: "./src/Menu.stories.svelte",
            tags: ["visual-approved"],
          },
          "menu--checkboxes": {
            id: "menu--checkboxes",
            type: "story",
            name: "Checkboxes",
            importPath: "./src/Menu.stories.svelte",
            tags: ["visual-approved"],
          },
        },
      }),
    );

    expect(
      markCreatedStoriesPending({
        packageRoot: root,
        storyIds: ["menu--chooses-an-item"],
        resetApproved: true,
      }).marked,
    ).toEqual(["menu--chooses-an-item"]);
    expect(
      patchStoryVisualReviewStatus({
        packageRoot: root,
        storyId: "menu--chooses-an-item",
        status: "approved",
      }).ok,
    ).toBe(true);
    expect(
      markCreatedStoriesPending({
        packageRoot: root,
        storyIds: ["menu--checkboxes"],
        resetApproved: true,
      }).marked,
    ).toEqual(["menu--checkboxes"]);

    const source = readFileSync(storiesPath, "utf8");
    expect(source).toContain(
      '<Story name="Chooses an item" tags={["visual-approved"]}>',
    );
    expect(source).toContain(
      '<Story name="Checkboxes" tags={["visual-pending"]}>',
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

  it("swaps pending for ready", () => {
    const next = patchStoryOpenTagWithReviewStatus(
      `<Story name="Default" tags={["visual-pending"]}>`,
      "ready",
    );
    expect(next).toContain('"visual-ready"');
    expect(next).not.toContain("visual-pending");
  });

  it("swaps visual-failed for visual-ready (and the reverse)", () => {
    const ready = patchStoryOpenTagWithReviewStatus(
      `<Story name="Default" tags={["visual-failed", "upstream-example"]}>`,
      "ready",
    );
    expect(ready).toContain('"visual-ready"');
    expect(ready).toContain('"upstream-example"');
    expect(ready).not.toContain("visual-failed");

    const failed = patchStoryOpenTagWithReviewStatus(ready, "failed");
    expect(failed).toContain('"visual-failed"');
    expect(failed).toContain('"upstream-example"');
    expect(failed).not.toContain("visual-ready");
  });

  it("collapses leaked dual review tags down to one", () => {
    const next = patchStoryOpenTagWithReviewStatus(
      `<Story name="Default" tags={["visual-ready", "visual-failed"]}>`,
      "ready",
    );
    expect(next).toBe(`<Story name="Default" tags={["visual-ready"]}>`);
  });

  it("is idempotent when the status tag is already present", () => {
    const tag = `<Story name="Default" tags={["visual-approved"]}>`;
    expect(patchStoryOpenTagWithReviewStatus(tag, "approved")).toBe(tag);
  });
});
