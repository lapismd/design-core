<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ChartModeSwitch from "./ChartModeSwitch.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Charts/Chart Mode Switch",
    component: ChartModeSwitch,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled tab list for a chart's alternate visual representations, such as line and area. Keep the selected chart mode in the parent and render the selected visual result alongside the control.",
        },
      },
    },
  });

  const options = [
    { value: "line", label: "Line chart" },
    { value: "area", label: "Area map" },
  ];
</script>

<script lang="ts">
  let mode = $state("line");
</script>

<Story
  name="Changes the chart representation"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Area map" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Area map");
  }}
>
  {#snippet template()}
    <div class="flex max-w-md flex-col gap-3">
      <ChartModeSwitch
        value={mode}
        {options}
        onChange={(value) => {
          mode = value;
        }}
      />
      <output class="text-muted-foreground text-sm" aria-live="polite">
        Chart representation: {options.find((option) => option.value === mode)
          ?.label}
      </output>
    </div>
  {/snippet}
</Story>
