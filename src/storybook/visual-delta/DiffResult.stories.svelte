<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import React from "react";
  import { expect, within } from "storybook/test";
  import { DiffResultFixture } from "storybook-addon-visual-delta/src/stories/DiffResultFixture";
  import ReactThemeHost from "storybook-addon-visual-delta/src/stories/ReactThemeHost.svelte";

  const { Story } = defineMeta({
    title: "Visual Delta/Diff Result",
    tags: ["test", "skip-visual", "visual-delta-self-test"],
    parameters: {
      docs: {
        description: {
          component:
            "Deterministic real DiffResult fixtures for viewport diagnostics and responsive compare zoom.",
        },
      },
    },
  });

  const play = async ({ canvasElement }: { canvasElement: HTMLElement }) => {
    const canvas = within(canvasElement);
    await expect(
      await canvas.findByLabelText(/Visual compare/),
    ).toBeInTheDocument();
    await expect(canvas.getByText("Capture diagnostics")).toBeInTheDocument();
  };
</script>

<Story name="Component clipped result" {play}>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(DiffResultFixture, {
        cssWidth: 560,
        cssHeight: 180,
        label: "Component",
      })}
    />
  {/snippet}
</Story>

<Story name="Full viewport result" {play}>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(DiffResultFixture, {
        cssWidth: 1280,
        cssHeight: 900,
        label: "Viewport",
      })}
    />
  {/snippet}
</Story>

<Story name="Wide result" {play}>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(DiffResultFixture, {
        cssWidth: 1440,
        cssHeight: 480,
        label: "Wide",
      })}
    />
  {/snippet}
</Story>

<Story name="Tall result" {play}>
  {#snippet template()}
    <ReactThemeHost
      element={React.createElement(DiffResultFixture, {
        cssWidth: 600,
        cssHeight: 1200,
        label: "Tall",
      })}
    />
  {/snippet}
</Story>
