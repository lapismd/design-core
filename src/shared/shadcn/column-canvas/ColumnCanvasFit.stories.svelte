<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import * as ColumnCanvas from "./index.js";
  import Demo from "./column-canvas-fit-demo.svelte";
  import { FitContents } from "./ColumnCanvasFit.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Layout/Column Canvas",
    component: ColumnCanvas.Column,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: FitContents, language: "tsx", type: "code" } },
    },
  });
  async function fit(canvasElement: HTMLElement, keyboard = false) {
    const canvas = within(canvasElement);
    const handle = await canvas.findByRole("separator", {
      name: /Resize Measured/,
    });
    if (keyboard) {
      handle.focus();
      await userEvent.keyboard("{Enter}");
    } else await userEvent.dblClick(handle);
    return { canvas, handle };
  }
</script>

<Story
  name="Double click toggles content fit and default width"
  play={async ({ canvasElement }) => {
    const draft = within(canvasElement).getByRole("textbox", {
      name: "Retained draft",
    });
    await userEvent.clear(draft);
    await userEvent.type(draft, "Unsaved draft");
    const { canvas, handle } = await fit(canvasElement);
    await waitFor(() =>
      expect(
        Number(handle.getAttribute("aria-valuenow")),
      ).toBeGreaterThanOrEqual(520),
    );
    expect(Number(handle.getAttribute("aria-valuenow"))).toBeLessThanOrEqual(
      720,
    );
    expect(canvas.getByRole("textbox", { name: "Retained draft" })).toBe(draft);
    expect(draft).toHaveValue("Unsaved draft");
    await userEvent.dblClick(handle);
    await waitFor(() => expect(handle).toHaveAttribute("aria-valuenow", "320"));
    handle.focus();
    await userEvent.keyboard("{ArrowRight}{ArrowRight}");
    await waitFor(() => expect(handle).toHaveAttribute("aria-valuenow", "336"));
    await userEvent.dblClick(handle);
    await waitFor(() => expect(handle).toHaveAttribute("aria-valuenow", "320"));
  }}
>
  {#snippet template()}<Demo />{/snippet}
</Story>
<Story
  name="Fit contents caps very wide content"
  play={async ({ canvasElement }) => {
    const { handle } = await fit(canvasElement);
    await waitFor(() => expect(handle).toHaveAttribute("aria-valuenow", "720"));
  }}
>
  {#snippet template()}<Demo scenario="cap" />{/snippet}
</Story>
<Story
  name="Short content stays at default width"
  play={async ({ canvasElement }) => {
    const { handle } = await fit(canvasElement, true);
    await waitFor(() => expect(handle).toHaveAttribute("aria-valuenow", "320"));
  }}
>
  {#snippet template()}<Demo scenario="short" />{/snippet}
</Story>
<Story
  name="Keyboard toggles fit and resets manual widths"
  play={async ({ canvasElement }) => {
    const { handle } = await fit(canvasElement, true);
    await waitFor(() =>
      expect(Number(handle.getAttribute("aria-valuenow"))).toBeGreaterThan(320),
    );
    await userEvent.keyboard("{Enter}");
    await waitFor(() => expect(handle).toHaveAttribute("aria-valuenow", "320"));
    await userEvent.keyboard("{ArrowRight}{Enter}");
    await waitFor(() => expect(handle).toHaveAttribute("aria-valuenow", "320"));
  }}
>
  {#snippet template()}<Demo />{/snippet}
</Story>
<Story
  name="Fit contents respects column bounds"
  play={async ({ canvasElement }) => {
    const { handle } = await fit(canvasElement);
    await waitFor(() => expect(handle).toHaveAttribute("aria-valuenow", "480"));
  }}
>
  {#snippet template()}<Demo scenario="bounded" />{/snippet}
</Story>
<Story
  name="Fit contents supports controlled widths"
  play={async ({ canvasElement }) => {
    const { canvas, handle } = await fit(canvasElement);
    await waitFor(() =>
      expect(
        Number(handle.getAttribute("aria-valuenow")),
      ).toBeGreaterThanOrEqual(520),
    );
    expect(
      Number(canvas.getByTestId("fit-events").getAttribute("data-count")),
    ).toBeGreaterThan(0);
    await userEvent.dblClick(handle);
    await waitFor(() => expect(handle).toHaveAttribute("aria-valuenow", "320"));
  }}
>
  {#snippet template()}<Demo scenario="controlled" />{/snippet}
</Story>
<Story
  name="Fit contents retains inverse pair resizing"
  play={async ({ canvasElement }) => {
    const root = within(canvasElement).getByRole("region", {
      name: "Fit contents canvas",
    });
    const columns = () =>
      Array.from(root.querySelectorAll<HTMLElement>('[data-ui-part="column"]'));
    await waitFor(() => {
      expect(root).toHaveAttribute("data-display-mode", "wide");
      expect(columns()).toHaveLength(2);
      expect(
        columns()[0].style.getPropertyValue(
          "--ui-column-canvas-wide-stage-width",
        ),
      ).not.toBe("");
    });
    const initialWidth = columns()[0].getBoundingClientRect().width;
    const total = columns().reduce(
      (sum, node) => sum + node.getBoundingClientRect().width,
      0,
    );
    const { handle } = await fit(canvasElement);
    await waitFor(() =>
      expect(Number(handle.getAttribute("aria-valuenow"))).toBeGreaterThan(
        initialWidth,
      ),
    );
    expect(
      Math.abs(
        columns().reduce(
          (sum, node) => sum + node.getBoundingClientRect().width,
          0,
        ) - total,
      ),
    ).toBeLessThanOrEqual(1);
    await userEvent.dblClick(handle);
    await waitFor(() =>
      expect(
        Math.abs(Number(handle.getAttribute("aria-valuenow")) - initialWidth),
      ).toBeLessThanOrEqual(1),
    );
  }}
>
  {#snippet template()}<Demo scenario="pair" />{/snippet}
</Story>
<Story
  name="Fit contents includes clipped labels"
  play={async ({ canvasElement }) => {
    await fit(canvasElement);
    await waitFor(() => {
      const label = canvasElement.querySelector<HTMLElement>(".fit-label")!;
      expect(label.scrollWidth).toBeLessThanOrEqual(label.clientWidth + 1);
    });
  }}
>
  {#snippet template()}<Demo scenario="ellipsis" />{/snippet}
</Story>
