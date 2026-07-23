<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import ScreenFrame from "./ScreenFrame.svelte";
  import { visualDeltaForScreen } from "./visual-delta.js";
  import BarChart from "../charts/BarChart.svelte";
  import ChartPanel from "../charts/ChartPanel.svelte";
  import ChartSwitcher from "../charts/ChartSwitcher.svelte";
  import FinancialDashboard from "../dashboard/FinancialDashboard.svelte";
  import LedgerActivityTable from "../tables/LedgerActivityTable.svelte";
  import StatementSummaryTreeTable from "../tables/StatementSummaryTreeTable.svelte";
  import QueryResultsTable from "../tables/QueryResultsTable.svelte";
  import IngestionReviewTable from "../tables/IngestionReviewTable.svelte";
  import ValidationErrorTable from "../feedback/ValidationErrorTable.svelte";
  import ContentScrollArea from "../layout/ContentScrollArea.svelte";
  import {
    accountActivityGroups,
    incomeStatementChartGroups,
    incomeStatementContributions,
    incomeStatementNodes,
    journalGroups,
    statementColumns,
    statementNodes,
    queryColumns,
    queryRows,
    validationErrors,
  } from "./fixtures.js";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Screens",
    tags: ["fava-reference-visual", "skip-visual"],
    parameters: {
      docs: {
        description: {
          component:
            "Full-viewport screen compositions for aligning `@stevejuma/ui/apps/beancount` against live Fava captures. Baselines are written by `FAVA_SCREEN_CAPTURE=1 pnpm beancount:screens:capture` into `tests/visual/storybook.spec.ts-snapshots/apps/beancount/screens/`. Open Visual Delta to compare. Stories stay `skip-visual` until compositions are honest enough for Playwright regression.",
        },
      },
      layout: "fullscreen",
    },
  });
</script>

<script lang="ts">
  const dashboardMetrics = [
    { id: "income", label: "Income", valueLabel: "58124.22 GBP" },
    { id: "outflows", label: "Outflows", valueLabel: "41778.29 GBP" },
    {
      id: "cash-flow",
      label: "Net cash flow",
      valueLabel: "16345.93 GBP",
      trend: "up" as const,
      tone: "positive" as const,
    },
    {
      id: "net-worth",
      label: "Net worth",
      valueLabel: "1755.89 GBP",
      changeLabel: "16345.93 GBP",
      changeDescription: " in this period",
      tone: "positive" as const,
    },
  ];

  const dashboardInflows = [
    {
      id: "salary",
      label: "Salary",
      value: 59224.98,
      color: "var(--chart-4)",
    },
  ];

  const dashboardOutflows = [
    {
      id: "joint",
      label: "Joint",
      value: 19500,
      valueLabel: "19500.00 GBP",
      shareLabel: "45.5%",
      color: "var(--chart-3)",
    },
    {
      id: "paye",
      label: "PAYE",
      value: 18703.56,
      valueLabel: "18703.56 GBP",
      shareLabel: "43.6%",
      color: "var(--chart-1)",
    },
    {
      id: "nic",
      label: "NIC",
      value: 2167.5,
      valueLabel: "2167.50 GBP",
      shareLabel: "5.1%",
      color: "var(--chart-5)",
    },
    {
      id: "pension",
      label: "Pension",
      value: 1100.76,
      valueLabel: "1100.76 GBP",
      shareLabel: "2.6%",
      color: "var(--chart-2)",
    },
    {
      id: "phone",
      label: "Phone",
      value: 508.62,
      valueLabel: "508.62 GBP",
      shareLabel: "1.2%",
      color: "var(--chart-4)",
    },
    {
      id: "interest",
      label: "Interest",
      value: 369.43,
      valueLabel: "369.43 GBP",
      shareLabel: "0.9%",
      color: "var(--chart-2)",
    },
    {
      id: "insurance",
      label: "Insurance",
      value: 221.64,
      valueLabel: "221.64 GBP",
      shareLabel: "0.5%",
      color: "var(--chart-1)",
    },
    {
      id: "lifestyle",
      label: "Lifestyle",
      value: 90.93,
      valueLabel: "90.93 GBP",
      shareLabel: "0.2%",
      color: "var(--chart-2)",
    },
    {
      id: "other",
      label: "Other",
      value: 216.61,
      valueLabel: "216.61 GBP",
      shareLabel: "0.5%",
      color: "var(--chart-5)",
    },
  ];

  const formatDashboardAmount = (value: number) => `${value.toFixed(2)} GBP`;
  let journalTimeframe = $state("transactions");
  let incomeChartMode = $state<"single" | "stacked">("stacked");
  let incomePerspective = $state("net-profit");

  const formatReportAxisAmount = (value: number) =>
    `${value < 0 ? "−" : ""}${(Math.abs(value) / 1000).toFixed(1)}k`;
</script>

<Story
  name="Editor"
  parameters={{ visualDelta: visualDeltaForScreen("editor") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Beancount editor")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Editor">
      <ContentScrollArea>
        <div
          class="bc-screen-story__placeholder bc-screen-story__placeholder--code"
        >
          <p class="bc-screen-story__placeholder-title">Beancount editor</p>
          <p>
            CodeMirror ledger editing remains in Fava until a catalog editor
            surface lands. This screen story frames the Studio shell for Visual
            Delta chrome alignment.
          </p>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Dashboard"
  parameters={{ visualDelta: visualDeltaForScreen("dashboard") }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("heading", { name: "Financial dashboard" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("button", {
        name: "Salary to Cash flow: 59224.98 GBP",
      }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Dashboard">
      <ContentScrollArea>
        <FinancialDashboard
          metrics={dashboardMetrics}
          period="ytd"
          periodOptions={[
            { value: "ytd", label: "Year to date" },
            { value: "1y", label: "Last year" },
          ]}
          currency="GBP"
          currencyOptions={[{ value: "GBP", label: "GBP" }]}
          valuation="cost"
          valuationOptions={[
            { value: "cost", label: "At Cost" },
            { value: "market", label: "At Market Value" },
            { value: "units", label: "Units" },
          ]}
          onPeriodChange={() => {}}
          inflows={dashboardInflows}
          outflows={dashboardOutflows}
          valueFormatter={formatDashboardAmount}
        />
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Journal"
  parameters={{ visualDelta: visualDeltaForScreen("journal") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("NHS")).toBeVisible();
    await expect(
      canvas.getByText("Expenses:Health:Prescription"),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Upcoming" }));
    await expect(
      canvas.getByRole("button", { name: "Upcoming" }),
    ).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(canvas.getByRole("button", { name: "Transactions" }));
    await expect(
      canvas.getByRole("button", { name: "Transactions" }),
    ).toHaveAttribute("aria-pressed", "true");
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Journal">
      <ContentScrollArea>
        <div class="bc-screen-story__page">
          <LedgerActivityTable
            groups={journalGroups}
            timeframes={[
              { id: "transactions", label: "Transactions" },
              { id: "upcoming", label: "Upcoming" },
            ]}
            timeframe={journalTimeframe}
            onTimeframeChange={(value) => {
              journalTimeframe = value;
            }}
          />
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Income statement"
  parameters={{ visualDelta: visualDeltaForScreen("income-statement") }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("group", {
        name: "Income statement historical performance",
      }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("tab", { name: "Single Bars" }));
    await expect(
      canvas.getByRole("tab", { name: "Single Bars" }),
    ).toHaveAttribute("data-state", "active");
    await userEvent.click(canvas.getByRole("tab", { name: "Stacked Bars" }));
    await expect(canvas.getByText("Income:Starling")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Income statement">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__page--report">
          <ChartPanel
            ariaLabel="Income statement controls"
            legend={{
              items: [{ id: "gbp", label: "GBP", color: "var(--chart-4)" }],
              selection: "single",
              selectedIds: ["gbp"],
            }}
            conversion={{
              ariaLabel: "Valuation",
              value: "cost",
              options: [{ value: "cost", label: "At Cost" }],
            }}
            interval={{
              ariaLabel: "Interval",
              value: "month",
              options: [{ value: "month", label: "Monthly" }],
            }}
            modes={{
              value: incomeChartMode,
              options: [
                { value: "stacked", label: "Stacked Bars" },
                { value: "single", label: "Single Bars" },
              ],
              ariaLabel: "Income statement chart representation",
              onChange: (value) => {
                incomeChartMode = value as "single" | "stacked";
              },
            }}
          >
            {#snippet children()}
              <BarChart
                groups={incomeStatementChartGroups}
                mode={incomeChartMode}
                ariaLabel="Income statement historical performance"
                valueFormatter={formatReportAxisAmount}
              />
            {/snippet}
          </ChartPanel>
          <ChartSwitcher
            charts={[
              { id: "net-profit", label: "Net Profit" },
              { id: "income-monthly", label: "Income (Monthly)" },
              { id: "expenses-monthly", label: "Expenses (Monthly)" },
              { id: "income", label: "Income" },
              { id: "expenses", label: "Expenses" },
            ]}
            activeChartId={incomePerspective}
            ariaLabel="Income statement sections"
            tabsPlacement="top"
            onActiveChartChange={(value) => {
              incomePerspective = value;
            }}
          >
            {#snippet children()}
              <StatementSummaryTreeTable
                title="Income"
                total="−213145.48 GBP"
                href="/accounts/Income"
                columns={statementColumns}
                nodes={incomeStatementNodes}
                contributions={incomeStatementContributions}
              />
            {/snippet}
          </ChartSwitcher>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Balance sheet"
  parameters={{ visualDelta: visualDeltaForScreen("balance-sheet") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Expenses")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Balance sheet">
      <ContentScrollArea>
        <div class="bc-screen-story__page">
          <StatementSummaryTreeTable
            title="Balance sheet"
            columns={statementColumns}
            nodes={statementNodes}
            contributions={[]}
          />
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Trial balance"
  parameters={{ visualDelta: visualDeltaForScreen("trial-balance") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Expenses")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Trial balance">
      <ContentScrollArea>
        <div class="bc-screen-story__page">
          <StatementSummaryTreeTable
            title="Trial balance"
            columns={statementColumns}
            nodes={statementNodes}
            contributions={[]}
          />
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Account detail"
  parameters={{ visualDelta: visualDeltaForScreen("account-detail") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Assets:Checking")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Account">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__page--stack">
          <h2 class="bc-screen-story__section-title">Assets:Checking</h2>
          <LedgerActivityTable
            groups={accountActivityGroups}
            selectable={false}
          />
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Holdings"
  parameters={{ visualDelta: visualDeltaForScreen("holdings") }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText(/Holdings query results compose through/),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Holdings">
      <ContentScrollArea>
        <div class="bc-screen-story__placeholder">
          <p class="bc-screen-story__placeholder-title">Holdings</p>
          <p>
            Holdings query results compose through QueryResultsTable / charts
            once Fava adapters supply display models.
          </p>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Statistics"
  parameters={{ visualDelta: visualDeltaForScreen("statistics") }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText(
        "Preset statistics views stay Fava-owned until extracted.",
      ),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Statistics">
      <ContentScrollArea>
        <div class="bc-screen-story__placeholder">
          <p class="bc-screen-story__placeholder-title">Statistics</p>
          <p>Preset statistics views stay Fava-owned until extracted.</p>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Query"
  parameters={{ visualDelta: visualDeltaForScreen("query") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Groceries")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Query">
      <ContentScrollArea>
        <div class="bc-screen-story__page">
          <QueryResultsTable columns={queryColumns} rows={queryRows} />
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Errors"
  parameters={{ visualDelta: visualDeltaForScreen("errors") }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("Duplicate open directive for Assets:Cash"),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Errors">
      <ContentScrollArea>
        <div class="bc-screen-story__page">
          <ValidationErrorTable errors={validationErrors} />
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Records"
  parameters={{ visualDelta: visualDeltaForScreen("records") }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("No proposals are waiting in this queue."),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Review imports">
      <ContentScrollArea>
        <div class="bc-screen-story__page">
          <IngestionReviewTable
            groups={[]}
            counts={{ review: 0, ready: 0, duplicates: 0 }}
          />
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Settings"
  parameters={{ visualDelta: visualDeltaForScreen("settings") }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText(/Ingestion config editors remain in Fava/),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Sources">
      <ContentScrollArea>
        <div class="bc-screen-story__placeholder">
          <p class="bc-screen-story__placeholder-title">Sources</p>
          <p>
            Ingestion config editors remain in Fava (forms stay out of this
            catalog migration). Shell chrome is framed for Visual Delta.
          </p>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Settings accounts"
  parameters={{ visualDelta: visualDeltaForScreen("settings-accounts") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Import accounts")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Import accounts">
      <ContentScrollArea>
        <div class="bc-screen-story__placeholder">
          <p class="bc-screen-story__placeholder-title">Import accounts</p>
          <p>Account setup sheets remain Fava-owned for now.</p>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Settings rules"
  parameters={{ visualDelta: visualDeltaForScreen("settings-rules") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Rules")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Rules">
      <ContentScrollArea>
        <div class="bc-screen-story__placeholder">
          <p class="bc-screen-story__placeholder-title">Rules</p>
          <p>Rules settings remain Fava-owned for now.</p>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<style>
  .bc-screen-story__page {
    padding: var(--ui-beancount-space-4);
  }

  .bc-screen-story__page--stack {
    display: grid;
    gap: var(--ui-beancount-space-4);
  }

  .bc-screen-story__page--report {
    display: grid;
    gap: calc(var(--ui-beancount-space-4) * 2);
  }

  :global(.bc-screen-story__page--report .bc-bar-chart__summary) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .bc-screen-story__section-title,
  .bc-screen-story__placeholder-title {
    margin: 0;
    color: var(--ui-beancount-foreground);
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
  }

  .bc-screen-story__section-title {
    font-size: var(--text-lg);
  }

  .bc-screen-story__placeholder {
    color: var(--ui-beancount-muted-foreground);
    padding: calc(var(--ui-beancount-space-3) * 2);
    font-size: var(--text-sm);
  }

  .bc-screen-story__placeholder-title {
    margin-block-end: var(--ui-beancount-space-2);
  }

  .bc-screen-story__placeholder--code {
    font-family: var(--studio-font-mono);
  }

  .bc-screen-story__placeholder--code .bc-screen-story__placeholder-title {
    font-family: var(--font-sans);
  }
</style>
