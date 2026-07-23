<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ChartModeSwitch from "./ChartModeSwitch.svelte";
  import HierarchyChart from "./HierarchyChart.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Charts/Hierarchy Chart",
    component: HierarchyChart,
    parameters: {
      docs: {
        description: {
          component:
            "A model-driven allocation chart supporting proportional treemap and sunburst views. The application supplies the selected currency, hierarchy, display-ready values, colours, and account navigation; this component owns the partition visual, accessible node focus, and empty state.",
        },
      },
    },
  });

  const root = {
    id: "assets",
    label: "Assets",
    valueLabel: "£1,510",
    color: "var(--primary)",
    children: [
      {
        id: "cash",
        label: "Assets:Cash",
        value: 510,
        valueLabel: "£510",
        color: "var(--chart-2)",
      },
      {
        id: "bank",
        label: "Assets:Bank",
        value: 1000,
        valueLabel: "£1,000",
        color: "var(--primary)",
      },
    ],
  };
</script>

<script lang="ts">
  let mode = $state<"treemap" | "sunburst">("treemap");
</script>

<Story
  name="Changes allocation representation and focuses accounts"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("tab", { name: "Sunburst" }));
    await expect(
      canvas.getByRole("button", { name: "Assets:Bank: £1,000" }),
    ).toBeVisible();

    await userEvent.click(
      canvas.getByRole("button", { name: "Assets:Bank: £1,000" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Assets:Bank");
  }}
>
  {#snippet template()}
    <div class="bc-hierarchy-chart-story">
      <div class="bc-hierarchy-chart-story__controls">
        <ChartModeSwitch
          value={mode}
          options={[
            { value: "treemap", label: "Treemap" },
            { value: "sunburst", label: "Sunburst" },
          ]}
          ariaLabel="Hierarchy representation"
          onChange={(value) => {
            mode = value as "treemap" | "sunburst";
          }}
        />
      </div>
      <HierarchyChart {root} {mode} />
    </div>
  {/snippet}
</Story>

<Story
  name="Explains absent allocation data"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("No balances match these filters."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-hierarchy-chart-story">
      <HierarchyChart
        root={{ id: "assets", label: "Assets", color: "var(--primary)" }}
        emptyLabel="No balances match these filters."
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-hierarchy-chart-story {
    max-width: 64rem;
    padding: var(--ui-beancount-space-5);
  }

  .bc-hierarchy-chart-story__controls {
    display: flex;
    justify-content: flex-end;
    margin-block-end: var(--ui-beancount-space-3);
  }
</style>
