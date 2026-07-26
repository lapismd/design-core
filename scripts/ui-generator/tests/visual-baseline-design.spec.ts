import { describe, expect, it } from "vitest";
import {
  baselineUrlForStory,
  familyFromTitle,
  injectVisualBaselineVisualDeltas,
  sanitizeStoryName,
  storySlugFromId,
  visualBaselineVisualDeltaParameter,
  VISUAL_BASELINE_SUFFIX,
} from "storybook-addon-visual-delta/node";

describe("visual-baseline-design", () => {
  it("maps Shadcn title + story id to the committed baseline URL", () => {
    expect(
      baselineUrlForStory({
        title: "Shadcn/Forms/Select",
        id: "shadcn-forms-select--open-menu",
        tags: ["visual-state"],
      }),
    ).toBe(
      `/visual-baselines/shadcn/select/open-menu${VISUAL_BASELINE_SUFFIX}.png`,
    );
  });

  it("maps Workspace stories to their package-local baseline directory", () => {
    expect(
      baselineUrlForStory({
        title: "Workspace/Tabs",
        id: "workspace-tabs--default",
        importPath:
          "packages/workspace/src/lib/tabs/WorkspaceTabs.stories.svelte",
      }),
    ).toBe(
      `/visual-baselines/workspace/tabs/default${VISUAL_BASELINE_SUFFIX}.png`,
    );
  });

  it("kebab-cases multi-word family titles", () => {
    expect(familyFromTitle("Shadcn/Forms/Input Group")).toBe("input-group");
  });

  it("maps UI Forms stories via importPath", () => {
    expect(
      baselineUrlForStory({
        title: "UI Forms/Add Section Chooser",
        id: "ui-forms-add-section-chooser--chooses-a-section",
        importPath:
          "./src/shared/forms/add-section-chooser/AddSectionChooser.stories.svelte",
      }),
    ).toBe(
      `/visual-baselines/forms/add-section-chooser/chooses-a-section${VISUAL_BASELINE_SUFFIX}.png`,
    );
  });

  it("skips skip-visual stories and unknown trees without importPath", () => {
    expect(
      baselineUrlForStory({
        title: "UI Forms/Form Field",
        id: "ui-forms-form-field--text-input",
      }),
    ).toBeUndefined();
    expect(
      baselineUrlForStory({
        title: "Shadcn/Forms/Select",
        id: "shadcn-forms-select--chooses-an-option",
        tags: ["skip-visual"],
      }),
    ).toBeUndefined();
  });

  it("parses story slugs after --", () => {
    expect(storySlugFromId("shadcn-actions-button--preview")).toBe("preview");
  });

  it("sanitizes story names like Storybook ids", () => {
    expect(sanitizeStoryName("Open menu")).toBe("open-menu");
  });

  it("builds visualDelta parameters", () => {
    const url = `/visual-baselines/shadcn/select/open-menu${VISUAL_BASELINE_SUFFIX}.png`;
    expect(visualBaselineVisualDeltaParameter(url)).toEqual({
      images: [url],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
      passThresholdPercent: 0.1,
    });
  });

  it("injects visualDelta into parameters without breaking play arrows", () => {
    const source = `
<script module lang="ts">
  const { Story } = defineMeta({ title: "Shadcn/Forms/Select" });
</script>
<Story
  name="Chooses an option"
  tags={["skip-visual"]}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Status" }));
  }}
>
  {#snippet template()}ok{/snippet}
</Story>
<Story
  name="Open menu"
  tags={["visual-state"]}
  parameters={{
    a11y: {
      // don't trip on apostrophes in comments
      test: "todo",
    },
  }}
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Status" }));
  }}
>
  {#snippet template()}ok{/snippet}
</Story>
`;
    const out = injectVisualBaselineVisualDeltas(source, "shadcn/select");
    expect(out).toContain(
      `"images":["/visual-baselines/shadcn/select/open-menu${VISUAL_BASELINE_SUFFIX}.png"]`,
    );
    const choosesBlock = out.slice(
      out.indexOf('name="Chooses an option"'),
      out.indexOf('name="Open menu"'),
    );
    expect(choosesBlock).not.toContain("visualDelta:");
    expect(out).toContain("play={async ({ canvas }) => {");
  });

  it("injects workspace visual baselines when screenshots exist", () => {
    const source = `
<script module lang="ts">
  const { Story } = defineMeta({ title: "Workspace/Tabs" });
</script>
<Story name="Default">{#snippet template()}ok{/snippet}</Story>`;
    const out = injectVisualBaselineVisualDeltas(
      source,
      "workspace/tabs",
      () => true,
    );
    expect(out).toContain(
      `"images":["/visual-baselines/workspace/tabs/default${VISUAL_BASELINE_SUFFIX}.png"]`,
    );
  });

  it("does not inject package-local visual baselines for missing committed screenshots", () => {
    const source = `
<script module lang="ts">
  const { Story } = defineMeta({ title: "Workspace/Tabs" });
</script>
<Story name="Missing shot">{#snippet template()}ok{/snippet}</Story>`;
    const out = injectVisualBaselineVisualDeltas(
      source,
      "workspace/tabs",
      () => false,
    );
    expect(out).not.toContain("visualDelta:");
    expect(out).not.toContain("missing-shot");
  });
});
