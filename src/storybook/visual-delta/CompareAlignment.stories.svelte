<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor } from "storybook/test";
  import OverlaySessionDemo from "storybook-addon-visual-delta/src/stories/OverlaySessionDemo.svelte";
  import SplitInsetDemo from "storybook-addon-visual-delta/src/stories/SplitInsetDemo.svelte";

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
