<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ChartLegend from "./ChartLegend.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Charts/Chart Legend",
    component: ChartLegend,
    parameters: {
      docs: {
        description: {
          component:
            "An interactive series legend for charts with multiple currencies or accounts. Use multiple selection to hide individual series and single selection when the chart has one active focus; parent state owns the actual chart filtering.",
        },
      },
    },
  });

  const currencies = [
    { id: "gbp", label: "GBP", color: "#6d5bd0" },
    { id: "usd", label: "USD", color: "#008a6a" },
  ];
</script>

<script lang="ts">
  let selectedCurrencies = $state(["gbp", "usd"]);
  let activeCurrency = $state(["gbp"]);
</script>

<Story
  name="Shows and hides chart series"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Toggle USD" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("GBP");
  }}
>
  {#snippet template()}
    <div class="flex max-w-md flex-col gap-3">
      <ChartLegend
        items={currencies}
        selectedIds={selectedCurrencies}
        onSelectedIdsChange={(ids) => {
          selectedCurrencies = ids;
        }}
      />
      <output class="text-muted-foreground text-sm" aria-live="polite">
        Visible series: {selectedCurrencies
          .map((id) => currencies.find((currency) => currency.id === id)?.label)
          .filter(Boolean)
          .join(", ") || "None"}
      </output>
    </div>
  {/snippet}
</Story>

<Story
  name="Selects one active series"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("radio", { name: "Toggle USD" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("USD");
  }}
>
  {#snippet template()}
    <div class="flex max-w-md flex-col gap-3">
      <ChartLegend
        items={currencies}
        selection="single"
        selectedIds={activeCurrency}
        onSelectedIdsChange={(ids) => {
          activeCurrency = ids;
        }}
      />
      <output class="text-muted-foreground text-sm" aria-live="polite">
        Active series: {currencies.find(
          (currency) => currency.id === activeCurrency[0],
        )?.label}
      </output>
    </div>
  {/snippet}
</Story>
