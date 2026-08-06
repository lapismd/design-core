<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import { Separator } from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Layout/Separator",
    component: Separator,
    parameters: {
      docs: {
        description: {
          component: "Visual divider for grouping content."}}}});
</script>

<Story
  name="Horizontal divider"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Above")).toBeVisible();
    await expect(canvas.getByText("Below")).toBeVisible();
  }}
  tags={["visual-approved"]}

  parameters={{
    visualDelta: {"images":["/visual-baselines/shadcn/separator/horizontal-divider-chromium.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right"},
  }}
>
  {#snippet template()}
    <div class="max-w-sm">
      <p>Above</p>
      <Separator class="my-3" />
      <p>Below</p>
    </div>
  {/snippet}
</Story>
