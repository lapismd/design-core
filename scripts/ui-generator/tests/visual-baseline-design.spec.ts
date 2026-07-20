import { describe, expect, it } from "vitest";
import {
  baselineUrlForStory,
  familyFromTitle,
  storySlugFromId,
  visualBaselineVisualDeltaParameter,
  VISUAL_BASELINE_SUFFIX,
} from "../../../.storybook/visual-baseline-design.js";
import {
  injectVisualBaselineVisualDeltas,
  sanitizeStoryName,
} from "../../../.storybook/visual-baseline-vite-plugin.js";

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

  it("maps workspace stories to their package-local baseline directory", () => {
    expect(
      baselineUrlForStory({
        title: "Workspace/Workspace Shell",
        id: "workspace-workspace-shell--three-regions",
        importPath:
          "packages/workspace/src/lib/components/WorkspaceShell.stories.svelte",
      }),
    ).toBe(
      `/visual-baselines/workspace/components/three-regions${VISUAL_BASELINE_SUFFIX}.png`,
    );
  });

  it("kebab-cases multi-word family titles", () => {
    expect(familyFromTitle("Shadcn/Forms/Input Group")).toBe("input-group");
  });

  it("skips non-Shadcn titles and skip-visual stories", () => {
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
      align: "viewport",
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
    const out = injectVisualBaselineVisualDeltas(source, "select");
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

  it("injects package-local workspace visual baselines", () => {
    const source = `
<script module lang="ts">
  const { Story } = defineMeta({ title: "Workspace/Workspace Shell" });
</script>
<Story name="Three regions">{#snippet template()}ok{/snippet}</Story>`;
    const out = injectVisualBaselineVisualDeltas(
      source,
      "workspace/components",
    );
    expect(out).toContain(
      `"images":["/visual-baselines/workspace/components/three-regions${VISUAL_BASELINE_SUFFIX}.png"]`,
    );
  });
});
