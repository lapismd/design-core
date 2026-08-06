<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { Skeleton } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Feedback/Skeleton",
    component: Skeleton,
    parameters: {
      docs: {
        description: {
          component:
            "Loading placeholder for content that has not arrived yet.",
        },
      },
    },
  });
</script>

<Story
  name="Content placeholders"
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("status")).toBeVisible();
  }}
  tags={["visual-approved"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/skeleton/content-placeholders-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
>
  {#snippet template()}
    <div
      class="flex items-center gap-3"
      role="status"
      aria-label="Loading profile"
    >
      <Skeleton class="size-10 rounded-full" />
      <div class="flex flex-col gap-2">
        <Skeleton class="h-4 w-40" />
        <Skeleton class="h-4 w-28" />
      </div>
    </div>
  {/snippet}
</Story>
