<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { Badge } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Data/Badge",
    component: Badge,
    parameters: {
      docs: {
        description: {
          component: "Compact status and category labels.",
        },
      },
    },
  });
</script>

<Story
  name="Variants"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Default")).toBeVisible();
    await expect(canvas.getByText("Secondary")).toBeVisible();
  }}
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: ["/visual-baselines/shadcn/badge/variants-chromium.png"],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div class="flex flex-wrap gap-2">
      <Badge>Default</Badge>
      <Badge variant="secondary">Secondary</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="destructive">Destructive</Badge>
    </div>
  {/snippet}
</Story>
