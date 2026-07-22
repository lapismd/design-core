<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import * as ScrollArea from "./index.js";

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
  }}
  tags={["visual-approved"]}
>
  {#snippet template()}
    <ScrollArea.Root
      class="h-40 w-56 rounded-md border"
      aria-label="Catalog items"
    >
      <ul class="flex flex-col gap-2 p-3 text-sm">
        {#each items as item (item)}
          <li>
            <a href={`#${item}`}>{item}</a>
          </li>
        {/each}
      </ul>
    </ScrollArea.Root>
  {/snippet}
</Story>
