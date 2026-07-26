<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import OverlayChipDemo from "storybook-addon-visual-delta/src/stories/OverlayChipDemo.svelte";
  import OverlaySessionDemo from "storybook-addon-visual-delta/src/stories/OverlaySessionDemo.svelte";
  import SplitInsetDemo from "storybook-addon-visual-delta/src/stories/SplitInsetDemo.svelte";
  import { isPreviewChipVisible } from "storybook-addon-visual-delta/src/shared/preview-chip.js";

  const { Story } = defineMeta({
    title: "Visual Delta/Compare Alignment",
    tags: ["skip-visual"],
    parameters: {
      docs: {
        description: {
          component:
            "Regression fixtures for Visual Delta split inset sync and overlay session behaviour. Tagged skip-visual (meta tooling, not product UI).",
        },
      },
    },
  });
</script>

<!--
  Mirrors Add Section Chooser: storybook-root padding 24 + subject my-2 (8).
  Baseline pane padding must be 32 so tops align.
-->
<Story
  name="Subject with vertical margin"
  play={async ({ canvas }) => {
    const demo = await waitFor(() => canvas.getByTestId("split-inset-demo"));
    await waitFor(() => {
      expect(demo.getAttribute("data-pane-padding-top")).toBe("32px");
    });
    await waitFor(() => {
      const delta = Number(demo.getAttribute("data-delta-top"));
      expect(Math.abs(delta)).toBeLessThan(0.75);
    });
    await expect(canvas.getByTestId("pane-padding-top")).toHaveTextContent(
      "32px",
    );
  }}
>
  {#snippet template()}
    <SplitInsetDemo subjectMarginYPx={8} canvasPaddingPx={24} />
  {/snippet}
</Story>

<Story
  name="Subject without margin"
  play={async ({ canvas }) => {
    const demo = await waitFor(() => canvas.getByTestId("split-inset-demo"));
    await waitFor(() => {
      expect(demo.getAttribute("data-pane-padding-top")).toBe("24px");
    });
    await waitFor(() => {
      const delta = Number(demo.getAttribute("data-delta-top"));
      expect(Math.abs(delta)).toBeLessThan(0.75);
    });
  }}
>
  {#snippet template()}
    <SplitInsetDemo subjectMarginYPx={0} canvasPaddingPx={24} />
  {/snippet}
</Story>

<Story
  name="Soft hide keeps selection"
  play={async ({ canvas }) => {
    await expect(canvas.getByTestId("overlay-on")).toHaveTextContent("true");
    await expect(canvas.getByTestId("placement")).toHaveTextContent("left");
    await expect(canvas.getByTestId("index")).toHaveTextContent("0");

    await userEvent.click(canvas.getByTestId("place-left"));
    await expect(canvas.getByTestId("overlay-on")).toHaveTextContent("false");
    // Soft-hide must keep index (hard clear → layout jump).
    await expect(canvas.getByTestId("index")).toHaveTextContent("0");
    await expect(canvas.getByTestId("last-action")).toHaveTextContent(
      "soft-hide",
    );

    await userEvent.click(canvas.getByTestId("place-left"));
    await expect(canvas.getByTestId("overlay-on")).toHaveTextContent("true");
    await expect(canvas.getByTestId("placement")).toHaveTextContent("left");

    await userEvent.click(canvas.getByTestId("reveal-center"));
    await expect(canvas.getByTestId("overlay-on")).toHaveTextContent("true");
    await expect(canvas.getByTestId("placement")).toHaveTextContent("center");
    await expect(canvas.getByTestId("index")).toHaveTextContent("0");
  }}
>
  {#snippet template()}
    <OverlaySessionDemo />
  {/snippet}
</Story>

<!--
  Baseline chip must sit on the overlay image for left/right/above/below
  (split) and center — same helper the preview overlay uses.
-->
<Story
  name="Baseline chip on overlay placements"
  play={async ({ canvas }) => {
    const demo = await waitFor(() => canvas.getByTestId("overlay-chip-demo"));
    const scope = within(demo);

    await waitFor(() => {
      expect(demo.getAttribute("data-visible-chips")).toBe("5");
    });
    await expect(scope.getByTestId("visible-chip-count")).toHaveTextContent(
      "5",
    );

    for (const placement of ["above", "left", "center", "right", "below"]) {
      const cell = scope.getByTestId(`chip-placement-${placement}`);
      const overlay = within(cell).getByTestId(`demo-overlay-${placement}`);
      const chip = within(overlay).getByTestId("baseline-overlay-chip");
      await expect(chip).toHaveTextContent("Baseline");
      expect(chip.parentElement).toBe(overlay);
      expect(isPreviewChipVisible(chip)).toBe(true);
      const chipRect = chip.getBoundingClientRect();
      const imageRect = within(overlay)
        .getByText("Baseline PNG")
        .getBoundingClientRect();
      expect(chipRect.bottom).toBeLessThanOrEqual(imageRect.top);
      if (placement !== "center") {
        const pane = within(cell).getByTestId(
          `demo-baseline-pane-${placement}`,
        );
        expect(pane.contains(overlay)).toBe(true);
      }
    }
  }}
>
  {#snippet template()}
    <OverlayChipDemo />
  {/snippet}
</Story>

<Story
  name="Baseline chip project offsets"
  play={async ({ canvas }) => {
    const demo = await waitFor(() => canvas.getByTestId("overlay-chip-demo"));
    const overlay = within(demo).getByTestId("demo-overlay-right");
    const chip = within(overlay).getByTestId("baseline-overlay-chip");
    const image = within(overlay).getByText("Baseline PNG");
    await waitFor(() => {
      expect(chip.getBoundingClientRect().bottom).toBeLessThanOrEqual(
        image.getBoundingClientRect().top,
      );
    });
    await expect(chip).toHaveStyle({ left: "12px" });
  }}
>
  {#snippet template()}
    <OverlayChipDemo
      placements={["right"]}
      baselineLabelOffset={{ x: 12, y: -4 }}
    />
  {/snippet}
</Story>
