<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import * as ScrollArea from "./index.js";
  import ScrollAreaScrollableList from "./ScrollAreaScrollableList.svelte";

  const { Story } = defineMeta({
    title: "Shadcn/Layout/Scroll Area",
    component: ScrollArea.Root,
    parameters: {
      docs: {
        description: {
          component: "Custom scrollable region with styled scrollbars.",
        },
      },
    },
  });

  const items = Array.from({ length: 8 }, (_, i) => `Item ${i + 1}`);
</script>

<Story
  name="Scrollable list"
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("link", { name: "Item 1" })).toBeVisible();
    const root = canvas.getByLabelText("Catalog items");
    const primitiveViewport = root.querySelector<HTMLElement>(
      '[data-ui-part="scroll-area-viewport"]',
    );
    await expect(primitiveViewport).toBeInTheDocument();
    await expect(primitiveViewport).toHaveAttribute(
      "data-scroll-area-bound-viewport",
      "true",
    );
  }}
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/scroll-area/scrollable-list-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <ScrollAreaScrollableList {items} />
  {/snippet}
</Story>
