<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as ToggleGroup from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Actions/Toggle Group",
    component: ToggleGroup.Root,
    parameters: {
      docs: {
        description: {
          component: "Exclusive or multi-select group of toggle options.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("left");
</script>

<Story
  name="Selects an alignment"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Center" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("center");
  }}
  tags={["visual-ready"]}
>
  {#snippet template()}
    <div class="flex flex-col gap-2">
      <ToggleGroup.Root type="single" bind:value>
        <ToggleGroup.Item value="left" aria-label="Left">Left</ToggleGroup.Item>
        <ToggleGroup.Item value="center" aria-label="Center"
          >Center</ToggleGroup.Item
        >
        <ToggleGroup.Item value="right" aria-label="Right"
          >Right</ToggleGroup.Item
        >
      </ToggleGroup.Root>
      <output class="text-muted-foreground text-sm">{value}</output>
    </div>
  {/snippet}
</Story>
