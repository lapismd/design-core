<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { Slider } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Forms/Slider",
    component: Slider,
    parameters: {
      docs: {
        description: {
          component: "UI-owned range slider for numeric settings.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state(40);
</script>

<Story
  name="Default"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    await expect(canvas.getByRole("slider")).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="w-64 p-4">
      <Slider type="single" bind:value max={100} step={1} />
    </div>
  {/snippet}
</Story>
