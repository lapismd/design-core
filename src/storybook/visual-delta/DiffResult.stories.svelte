<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import React from "react";
  import { expect, userEvent, waitFor, within } from "storybook/test";
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

  const play =
    (expectsOverflow: boolean) =>
    async ({ canvasElement }: { canvasElement: HTMLElement }) => {
      const canvas = within(canvasElement);
      await expect(
        await canvas.findByLabelText(/Visual compare/),
      ).toBeInTheDocument();
      await expect(canvas.getByText("Capture diagnostics")).toBeInTheDocument();
      const compare = canvas.getByLabelText(/Visual compare/);
      await expect(compare).toHaveAttribute("data-zoom-mode", "fit");
      await userEvent.click(
        canvas.getByRole("switch", {
          name: "Show compare view at 100%",
        }),
      );
      await expect(compare).toHaveAttribute("data-zoom-mode", "custom");
      await expect(compare).toHaveAttribute("data-zoom-scale", "1.0000");
      if (expectsOverflow) {
        const viewport = canvas.getByTestId("compare-scroll-viewport");
        await waitFor(() => {
          expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
        });
      }
      await userEvent.click(
        canvas.getByRole("switch", { name: "Zoom in compare view" }),
      );
      await expect(compare).toHaveAttribute("data-zoom-scale", "1.1000");
      for (const tab of ["Swipe", "Diff", "Focus", "Blink", "2-up"]) {
        await userEvent.click(canvas.getByRole("tab", { name: tab }));
        await expect(compare).toHaveAttribute("data-zoom-scale", "1.1000");
      }
      await userEvent.click(
        canvas.getByRole("switch", {
          name: /Fit compare view/,
        }),
      );
      await expect(compare).toHaveAttribute("data-zoom-mode", "fit");

      await userEvent.click(canvas.getByRole("tab", { name: "Blink" }));
      const blinkLabel = canvas.getByTestId("blink-label-row");
      await expect(blinkLabel.nextElementSibling).toHaveAttribute(
        "aria-label",
        expect.stringMatching(/blink image full size/),
      );

      await userEvent.click(canvas.getByRole("tab", { name: "Diff" }));
      await userEvent.click(
        canvas.getByRole("button", { name: "Open Diff full image" }),
      );
      const documentScope = within(canvasElement.ownerDocument.body);
      await expect(
        await documentScope.findByRole("dialog", { name: "Diff full image" }),
      ).toBeVisible();
      const imageZoom = documentScope.getByLabelText("Image zoom percentage");
      await userEvent.clear(imageZoom);
      await userEvent.type(imageZoom, "137{Enter}");
      await expect(documentScope.getByTestId("image-lightbox")).toHaveAttribute(
        "data-zoom-scale",
        "1.3700",
      );
      await userEvent.click(
        documentScope.getByRole("button", { name: "Close modal" }),
      );
    };
</script>

<Story name="Component clipped result" play={play(false)}>
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

<Story name="Full viewport result" play={play(true)}>
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

<Story name="Wide result" play={play(true)}>
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

<Story name="Tall result" play={play(true)}>
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
