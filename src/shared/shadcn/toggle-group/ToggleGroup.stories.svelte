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
  tags={["visual-pending"]}
  parameters={{
    visualDelta: {
      images: [
        "/visual-baselines/shadcn/toggle-group/selects-an-alignment-chromium.png",
      ],
      opacity: 0.5,
      colorInversion: false,
      align: "canvas",
      placement: "right",
    },
  }}
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

<Story
  name="Vertical joined outline"
  tags={["visual-pending"]}
  play={async ({ canvas }) => {
    const first = canvas.getByRole("radio", { name: "First" });
    const middle = canvas.getByRole("radio", { name: "Middle" });
    const last = canvas.getByRole("radio", { name: "Last" });
    await expect(getComputedStyle(first).borderTopWidth).toBe("1px");
    await expect(
      parseFloat(getComputedStyle(first).borderTopLeftRadius),
    ).toBeGreaterThan(0);
    await expect(getComputedStyle(middle).borderTopWidth).toBe("0px");
    await expect(getComputedStyle(middle).borderRadius).toBe("0px");
    await expect(
      parseFloat(getComputedStyle(last).borderBottomLeftRadius),
    ).toBeGreaterThan(0);
    await userEvent.click(middle);
    await expect(middle).toHaveAttribute("aria-checked", "true");
  }}
>
  {#snippet template()}
    <ToggleGroup.Root
      type="single"
      orientation="vertical"
      variant="outline"
      spacing={0}
      aria-label="Joined options"
    >
      <ToggleGroup.Item value="first">First</ToggleGroup.Item><ToggleGroup.Item
        value="middle">Middle</ToggleGroup.Item
      ><ToggleGroup.Item value="last">Last</ToggleGroup.Item>
    </ToggleGroup.Root>
  {/snippet}
</Story>
