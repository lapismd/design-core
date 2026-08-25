<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, fireEvent } from "storybook/test";
  import * as Resizable from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Layout/Resizable",
    component: Resizable.PaneGroup,
    parameters: {
      docs: {
        description: {
          component: "Resizable pane groups powered by paneforge.",
        },
      },
    },
  });
</script>

<Story
  name="Two pane split"
  play={async ({ canvas, canvasElement }) => {
    await expect(canvas.getByText("Left pane")).toBeVisible();
    await expect(canvas.getByText("Right pane")).toBeVisible();
    const handle = canvas.getByRole("separator");
    await expect(getComputedStyle(handle).cursor).toBe("col-resize");
    await fireEvent.mouseDown(handle, { clientX: 100, clientY: 20 });
    const documentRoot = canvasElement.ownerDocument.documentElement;
    await expect(documentRoot).toHaveAttribute(
      "data-ui-resize-cursor",
      "column",
    );
    await expect(getComputedStyle(canvasElement).cursor).toBe("col-resize");
    await fireEvent.mouseUp(canvasElement.ownerDocument.defaultView!);
    await expect(documentRoot).not.toHaveAttribute("data-ui-resize-cursor");
  }}
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/resizable/two-pane-split-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <Resizable.PaneGroup
      direction="horizontal"
      class="h-40 max-w-xl rounded-md border"
    >
      <Resizable.Pane defaultSize={40} class="p-3 text-sm"
        >Left pane</Resizable.Pane
      >
      <Resizable.Handle withHandle />
      <Resizable.Pane defaultSize={60} class="p-3 text-sm"
        >Right pane</Resizable.Pane
      >
    </Resizable.PaneGroup>
  {/snippet}
</Story>
