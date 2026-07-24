<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import FinancialDashboard from "./FinancialDashboard.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Dashboard/Financial Dashboard",
    component: FinancialDashboard,
    parameters: {
      docs: {
        description: {
          component:
            "The canonical financial-dashboard page composition. Supply selected, display-ready summary, chart, category, account, and trend models from an application adapter; this UI component owns the responsive page hierarchy, disclosure, and shared dashboard controls without reading a ledger, route, or store.",
        },
      },
    },
  });

  const periods = [
    { value: "ytd", label: "Year to date" },
    { value: "1y", label: "Last year" },
    { value: "all", label: "All history" },
  ];
  const currencies = [
    { value: "GBP", label: "GBP" },
    { value: "USD", label: "USD" },
  ];
  const valuations = [
    { value: "cost", label: "At cost" },
    { value: "market", label: "At market value" },
    { value: "units", label: "Units" },
  ];

  const metrics = [
    { id: "income", label: "Income", valueLabel: "£3,520.00" },
    { id: "outflows", label: "Outflows", valueLabel: "£2,040.00" },
    {
      id: "cash-flow",
      label: "Net cash flow",
      valueLabel: "£1,480.00",
      trend: "up" as const,
      tone: "positive" as const,
    },
    {
      id: "net-worth",
      label: "Net worth",
      valueLabel: "£14,120.00",
      changeLabel: "+£1,480.00",
      changeDescription: " this period",
      changeTone: "positive" as const,
    },
  ];

  const outflows = [
    {
      id: "groceries",
      label: "Groceries",
      value: 420,
      valueLabel: "£420.00",
      shareLabel: "20.6%",
      color: "var(--ui-beancount-dashboard-series-orange)",
    },
    {
      id: "housing",
      label: "Housing",
      value: 1300,
      valueLabel: "£1,300.00",
      shareLabel: "63.7%",
      color: "var(--ui-beancount-dashboard-series-green)",
    },
    {
      id: "transport",
      label: "Transport",
      value: 320,
      valueLabel: "£320.00",
      shareLabel: "15.7%",
      color: "var(--ui-beancount-dashboard-series-cyan)",
    },
  ];

  const accountGroups = [
    {
      id: "assets",
      title: "Assets",
      viewAllLabel: "View assets",
      nodes: [
        {
          id: "assets",
          label: "Assets",
          value: 17120,
          color: "var(--ui-beancount-accent)",
          children: [
            {
              id: "assets-cash",
              label: "Cash",
              value: 2120,
              color: "var(--ui-beancount-dashboard-series-indigo)",
            },
            {
              id: "assets-investments",
              label: "Investments",
              value: 15000,
              color: "var(--ui-beancount-dashboard-series-orange)",
            },
          ],
        },
      ],
    },
    {
      id: "liabilities",
      title: "Liabilities",
      viewAllLabel: "View liabilities",
      nodes: [
        {
          id: "liabilities",
          label: "Liabilities",
          value: 3000,
          color: "var(--ui-beancount-negative)",
          children: [
            {
              id: "liabilities-card",
              label: "Card",
              value: 3000,
              color: "var(--ui-beancount-negative)",
            },
          ],
        },
      ],
    },
  ];

  const netWorth = {
    valueLabel: "£14,120.00",
    change: 1480,
    changeLabel: "+£1,480.00 (11.7%)",
    changeDescription: "Compared with the start of this period",
    trendTone: "positive" as const,
    points: [
      {
        id: "may",
        date: new Date("2026-05-01"),
        label: "01 May 2026",
        value: 12400,
        valueLabel: "£12,400.00",
      },
      {
        id: "june",
        date: new Date("2026-06-01"),
        label: "01 Jun 2026",
        value: 13640,
        valueLabel: "£13,640.00",
      },
      {
        id: "july",
        date: new Date("2026-07-01"),
        label: "01 Jul 2026",
        value: 14120,
        valueLabel: "£14,120.00",
      },
    ],
  };
</script>

<script lang="ts">
  let period = $state("ytd");
  let currency = $state("GBP");
  let valuation = $state("cost");
  let activity = $state("Ready");
</script>

<Story
  name="Changes dashboard controls and explores sections"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Dashboard period" }),
    );
    await userEvent.click(
      within(document.body).getByRole("option", { name: "Last year" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Period changed to Last year",
    );

    await userEvent.click(
      canvas.getByRole("button", { name: "Last year Cash flow" }),
    );
    await expect(
      canvas.queryByRole("group", { name: /cash flow from/i }),
    ).not.toBeInTheDocument();
  }}
>
  {#snippet template()}
    <div class="bc-financial-dashboard-story__shell">
      <FinancialDashboard
        {period}
        periodOptions={periods}
        {currency}
        currencyOptions={currencies}
        {valuation}
        valuationOptions={valuations}
        {metrics}
        inflows={[
          {
            id: "income-salary",
            label: "Salary",
            value: 3400,
            color: "var(--ui-beancount-dashboard-series-indigo)",
          },
          {
            id: "income-refunds",
            label: "Refunds",
            value: 120,
            color: "var(--ui-beancount-dashboard-series-orange)",
          },
        ]}
        {outflows}
        {accountGroups}
        {netWorth}
        valueFormatter={(value) =>
          `£${value.toLocaleString("en-GB", { minimumFractionDigits: 2 })}`}
        onPeriodChange={(value) => {
          period = value;
          activity = `Period changed to ${periods.find((option) => option.value === value)?.label}`;
        }}
        onCurrencyChange={(value) => {
          currency = value;
          activity = `Currency changed to ${value}`;
        }}
        onValuationChange={(value) => {
          valuation = value;
          activity = `Valuation changed to ${value}`;
        }}
        onOutflowSelect={(category) => {
          activity = `Selected ${category.label}`;
        }}
      />
    </div>
    <output class="bc-financial-dashboard-story__status" aria-live="polite"
      >{activity}</output
    >
  {/snippet}
</Story>

<Story
  name="Explains a dashboard without financial activity"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("No outflows match this period."),
    ).toBeVisible();
    await expect(
      canvas.getByText("No balance-sheet accounts match this period."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <div class="bc-financial-dashboard-story__shell">
      <FinancialDashboard
        metrics={[]}
        period="ytd"
        periodOptions={periods}
        onPeriodChange={() => {}}
      />
    </div>
  {/snippet}
</Story>

<style>
  .bc-financial-dashboard-story__shell {
    block-size: 44rem;
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }
  .bc-financial-dashboard-story__status {
    position: absolute;
    inline-size: 1px;
    block-size: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }
</style>
