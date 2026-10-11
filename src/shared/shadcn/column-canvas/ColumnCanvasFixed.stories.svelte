<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, waitFor, within } from "storybook/test";
  import FixedDemo from "./column-canvas-fixed-demo.svelte";
  import { FixedColumns } from "./ColumnCanvasFixed.example-sources.js";
  const { Story } = defineMeta({
    title: "Shadcn/Layout/Column Canvas",
    component: FixedDemo,
    tags: ["visual-pending"],
    parameters: {
      docs: { source: { code: FixedColumns, language: "tsx", type: "code" } },
    },
  });
  function elements(canvasElement: HTMLElement) {
    const canvas = within(canvasElement);
    const root = canvas.getByRole("region", { name: "Pinned canvas" });
    const viewport =
      root.closest<HTMLElement>('[data-ui-part="scroll-area-viewport"]') ??
      root;
    const column = () =>
      root.querySelector<HTMLElement>(
        '[data-ui-part="column"][data-column-id="primary"], [data-ui-part="collapsed-column"][data-column-id="primary"]',
      )!;
    return { canvas, root, viewport, column };
  }
  async function pinning({ canvasElement }: { canvasElement: HTMLElement }) {
    const { canvas, root, viewport, column } = elements(canvasElement);
    const input = canvas.getByRole("textbox", { name: "Retained draft" });
    await userEvent.type(input, "Keep this draft");
    await waitFor(() =>
      expect(column()).toHaveAttribute("data-fixed-active", "true"),
    );
    await waitFor(() =>
      expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth),
    );
    const width = column().getBoundingClientRect().width;
    viewport.scrollTo({ left: viewport.scrollWidth, behavior: "auto" });
    await waitFor(() =>
      expect(column()).toHaveAttribute("data-fixed-state", "stuck"),
    );
    expect(column().getBoundingClientRect().width).toBe(width);
    expect(
      Math.abs(
        column().getBoundingClientRect().left -
          viewport.getBoundingClientRect().left,
      ),
    ).toBeLessThanOrEqual(1);
    expect(canvas.getByRole("textbox", { name: "Retained draft" })).toBe(input);
    expect(input).toHaveValue("Keep this draft");
    expect(root.querySelector('[data-sticky-for="primary"]')).toBeNull();
    await userEvent.click(
      within(column()).getByRole("button", { name: "Collapse primary column" }),
    );
    await waitFor(() =>
      expect(column()).toHaveAttribute("data-ui-part", "collapsed-column"),
    );
    viewport.scrollTo({ left: viewport.scrollWidth, behavior: "auto" });
    await waitFor(() =>
      expect(column()).toHaveAttribute("data-fixed-state", "stuck"),
    );
    expect(
      Math.abs(
        column().getBoundingClientRect().left -
          viewport.getBoundingClientRect().left,
      ),
    ).toBeLessThanOrEqual(1);
    await userEvent.click(
      within(column()).getByRole("button", { name: "Expand primary column" }),
    );
    await waitFor(() =>
      expect(column().getBoundingClientRect().width).toBe(width),
    );
    expect(canvas.getByRole("textbox", { name: "Retained draft" })).toHaveValue(
      "Keep this draft",
    );
  }
</script>

<Story name="Expanded and collapsed columns remain pinned" play={pinning} />
<Story
  name="Fixed columns in a styled viewport"
  args={{ external: true }}
  play={pinning}
/>
<Story name="Fixed columns beside sticky rails" args={{ mixed: true }} />
<Story name="Fixed columns in adaptive layout" args={{ mode: "auto" }} />
