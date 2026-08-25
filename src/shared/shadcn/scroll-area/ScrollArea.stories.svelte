<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import * as ScrollArea from "./index.js";
  import ScrollAreaScrollableList from "./ScrollAreaScrollableList.svelte";
  import ScrollAreaBehaviorFixture from "./ScrollAreaBehaviorFixture.svelte";
  import * as exampleSources from "./ScrollArea.local-example-sources.js";

  const { Story } = defineMeta({
    title: "Shadcn/Layout/Scroll Area",
    component: ScrollArea.Root,
    parameters: {
      docs: {
        description: {
          component: "Custom scrollable region with styled scrollbars.",
        },
        source: {
          code: exampleSources.Basic,
          language: "tsx",
          type: "code",
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

<Story
  name="Visibility modes"
  play={async ({ canvas, userEvent }) => {
    const inherited = canvas.getByLabelText("Inherited vertical area");
    await expect(inherited).toHaveAttribute("data-scroll-visibility", "scroll");
    await userEvent.click(canvas.getByRole("button", { name: "hover" }));
    await expect(inherited).toHaveAttribute("data-scroll-visibility", "hover");
    await userEvent.click(canvas.getByRole("button", { name: "always" }));
    await expect(inherited).toHaveAttribute("data-scroll-visibility", "always");
    await expect(canvas.getByLabelText("No overflow area")).toBeVisible();
    await expect(canvas.getByLabelText("Horizontal area")).toBeVisible();
    await expect(canvas.getByLabelText("Dual axis area")).toBeVisible();
  }}
  tags={["visual-pending"]}
  parameters={{
    docs: {
      source: {
        code: exampleSources.VisibilityModes,
        language: "tsx",
        type: "code",
      },
    },
  }}
>
  {#snippet template()}
    <ScrollAreaBehaviorFixture />
  {/snippet}
</Story>
