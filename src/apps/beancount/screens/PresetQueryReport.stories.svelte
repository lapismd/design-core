<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import PresetQueryReport from "./PresetQueryReport.svelte";

  const { Story } = defineMeta({
    tags: ["skip-visual"],
    title: "Apps/Beancount/Screens/Preset Query Report",
    component: PresetQueryReport,
    parameters: {
      docs: {
        description: {
          component:
            "A controlled, display-only counterpart to Fava's PresetQueryView. The host owns query definitions, execution, routing, and all selected state.",
        },
      },
    },
  });

  const perspectives = [
    { value: "holdings", label: "Holdings" },
    { value: "by-account", label: "Holdings by Account" },
  ];
  const columns = [
    { id: "account", label: "account" },
    { id: "units", label: "units", align: "right" as const },
  ];
  const rows = [
    {
      id: "cash",
      account: "Assets:Cash",
      values: { units: { label: "70.00", sortValue: 70 } },
    },
    {
      id: "monzo",
      account: "Assets:Checking:Monzo",
      values: { units: { label: "7637.59", sortValue: 7637.59 } },
    },
  ];
</script>

<script lang="ts">
  let perspective = $state("holdings");
  let queryRequested = $state(false);
</script>

<Story
  name="Changes perspective and requests the query"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("tab", { name: "Holdings by Account" }),
    );
    await expect(
      canvas.getByRole("tab", { name: "Holdings by Account" }),
    ).toHaveAttribute("data-state", "active");
    await userEvent.click(
      canvas.getByRole("button", { name: "Open holdings query" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Holdings query requested",
    );
  }}
>
  {#snippet template()}
    <div class="bc-preset-query-report-story">
      <PresetQueryReport
        {perspectives}
        {perspective}
        {columns}
        {rows}
        ariaLabel="Holdings"
        tabListLabel="Holdings perspectives"
        queryActionAriaLabel="Open holdings query"
        queryActionPressed={queryRequested}
        statusText={queryRequested ? "Holdings query requested" : ""}
        onPerspectiveChange={(next) => {
          perspective = next;
        }}
        onQueryAction={() => {
          queryRequested = true;
        }}
      />
    </div>
  {/snippet}
</Story>

<Story
  name="Aligns the statistics query action to the toolbar end"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("button", { name: "Open statistics query" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-preset-query-report-story">
      <PresetQueryReport
        {perspectives}
        perspective="holdings"
        {columns}
        {rows}
        ariaLabel="Posting statistics"
        tabListLabel="Statistics perspectives"
        queryActionAriaLabel="Open statistics query"
        queryActionAlign="end"
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-preset-query-report-story {
    max-width: 80rem;
    height: 42rem;
    padding: var(--ui-beancount-space-5);
  }
</style>
