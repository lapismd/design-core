<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as Breadcrumb from "@stevejuma/ui/shadcn/breadcrumb";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Tabs from "@stevejuma/ui/shadcn/tabs";
  import ScreenFrame from "./ScreenFrame.svelte";
  import { visualDeltaForScreen } from "./visual-delta.js";
  import BarChart from "../charts/BarChart.svelte";
  import ChartPanel from "../charts/ChartPanel.svelte";
  import ChartSwitcher from "../charts/ChartSwitcher.svelte";
  import HierarchyChart from "../charts/HierarchyChart.svelte";
  import LineChart from "../charts/LineChart.svelte";
  import FinancialDashboard from "../dashboard/FinancialDashboard.svelte";
  import LedgerActivityTable from "../tables/LedgerActivityTable.svelte";
  import HoldingsTable from "../tables/HoldingsTable.svelte";
  import StatementSummaryTreeTable from "../tables/StatementSummaryTreeTable.svelte";
  import IngestionReviewTable from "../tables/IngestionReviewTable.svelte";
  import ValidationErrorTable from "../feedback/ValidationErrorTable.svelte";
  import ContentScrollArea from "../layout/ContentScrollArea.svelte";
  import RuleList from "../rules/RuleList.svelte";
  import SourceAccountGroups from "../sources/SourceAccountGroups.svelte";
  import SourceConnectionCatalog from "../sources/SourceConnectionCatalog.svelte";
  import SourceToolbar from "../sources/SourceToolbar.svelte";
  import QueryComposer from "./QueryComposer.svelte";
  import {
    accountDetailGroups,
    accountDetailLineSeries,
    availableSources,
    balanceSheetContributions,
    balanceSheetLineSeries,
    balanceSheetNodes,
    connectedSources,
    holdingColumns,
    holdingRows,
    incomeStatementChartGroups,
    incomeStatementContributions,
    incomeStatementNodes,
    journalGroups,
    statementColumns,
    statementNodes,
    statisticsColumns,
    statisticsRows,
    sourceAccountSource,
    testRule,
    trialBalanceContributions,
    trialBalanceHierarchy,
    trialBalanceNodes,
    unassignedAccountGroup,
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
  let balanceSheetChartMode = $state<"line" | "area">("line");
  let balanceSheetPerspective = $state("net-worth");
  let trialBalanceChartMode = $state<"treemap" | "sunburst">("treemap");
  let trialBalancePerspective = $state("income");
  let accountDetailChartMode = $state<"line" | "area">("line");
  let accountDetailPerspective = $state("account-balance");
  let accountDetailTablePerspective = $state("account-table");
  let accountDetailTimeframe = $state("transactions");
  let holdingsPerspective = $state("holdings");
  let holdingsPage = $state(1);
  let holdingsQueryRequested = $state(false);
  let statisticsPerspective = $state("postings-by-account");
  let statisticsPage = $state(1);
  let statisticsQueryRequested = $state(false);
  let recordsAccountsRequested = $state(false);
  let sourceAction = $state("");
  let sourceYamlMode = $state(false);
  let sourceAccountAction = $state("");
  let ruleActive = $state(true);
  let ruleAction = $state("");

  const holdingsPageSize = 10;
  const visibleHoldingRows = $derived(
    holdingRows.slice(
      (holdingsPage - 1) * holdingsPageSize,
      holdingsPage * holdingsPageSize,
    ),
  );
  const holdingsResultLabel = $derived(
    `Showing ${(holdingsPage - 1) * holdingsPageSize + 1}–${Math.min(
      holdingsPage * holdingsPageSize,
      holdingRows.length,
    )} of ${holdingRows.length}`,
  );
  const statisticsPageSize = 10;
  const visibleStatisticsRows = $derived(
    statisticsRows.slice(
      (statisticsPage - 1) * statisticsPageSize,
      statisticsPage * statisticsPageSize,
    ),
  );
  const statisticsResultLabel = $derived(
    `Showing ${(statisticsPage - 1) * statisticsPageSize + 1}–${Math.min(
      statisticsPage * statisticsPageSize,
      statisticsRows.length,
    )} of ${statisticsRows.length}`,
  );

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
    await expect(
      canvas.getByRole("group", { name: "Balance sheet net worth history" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("tab", { name: "Area Map" }));
    await expect(canvas.getByRole("tab", { name: "Area Map" })).toHaveAttribute(
      "data-state",
      "active",
    );
    await userEvent.click(canvas.getByRole("tab", { name: "Line Chart" }));
    await expect(canvas.getByText("Assets:Checking")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Balance sheet">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__page--report">
          <ChartPanel
            ariaLabel="Balance sheet controls"
            legend={{
              items: [
                {
                  id: "gbp",
                  label: "GBP",
                  color: "var(--ui-beancount-accepted)",
                },
              ],
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
              value: balanceSheetChartMode,
              options: [
                { value: "line", label: "Line Chart" },
                { value: "area", label: "Area Map" },
              ],
              ariaLabel: "Balance sheet chart representation",
              onChange: (value) => {
                balanceSheetChartMode = value as "line" | "area";
              },
            }}
          >
            {#snippet children()}
              <LineChart
                series={balanceSheetLineSeries}
                mode={balanceSheetChartMode}
                ariaLabel="Balance sheet net worth history"
                valueFormatter={formatReportAxisAmount}
              />
            {/snippet}
          </ChartPanel>
          <ChartSwitcher
            charts={[
              { id: "net-worth", label: "Net Worth" },
              { id: "assets", label: "Assets" },
              { id: "liabilities", label: "Liabilities" },
              { id: "equity", label: "Equity" },
            ]}
            activeChartId={balanceSheetPerspective}
            ariaLabel="Balance sheet sections"
            tabsPlacement="top"
            onActiveChartChange={(value) => {
              balanceSheetPerspective = value;
            }}
          >
            {#snippet children()}
              <StatementSummaryTreeTable
                title="Assets"
                total="24921.78 GBP"
                href="/accounts/Assets"
                columns={statementColumns}
                nodes={balanceSheetNodes}
                contributions={balanceSheetContributions}
              />
            {/snippet}
          </ChartSwitcher>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Trial balance"
  parameters={{ visualDelta: visualDeltaForScreen("trial-balance") }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("group", { name: "Trial balance allocation" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("tab", { name: "Sunburst" }));
    await expect(canvas.getByRole("tab", { name: "Sunburst" })).toHaveAttribute(
      "data-state",
      "active",
    );
    await userEvent.click(canvas.getByRole("tab", { name: "Treemap" }));
    await expect(canvas.getByRole("tab", { name: "Treemap" })).toHaveAttribute(
      "data-state",
      "active",
    );
    await expect(canvas.getByText("Equity:Opening-Balances")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Trial balance">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__page--report">
          <ChartPanel
            ariaLabel="Trial balance controls"
            legend={{
              items: [
                {
                  id: "gbp",
                  label: "GBP",
                  color: "var(--ui-beancount-accepted)",
                },
              ],
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
              value: trialBalanceChartMode,
              options: [
                { value: "treemap", label: "Treemap" },
                { value: "sunburst", label: "Sunburst" },
              ],
              ariaLabel: "Trial balance chart representation",
              onChange: (value) => {
                trialBalanceChartMode = value as "treemap" | "sunburst";
              },
            }}
          >
            {#snippet children()}
              <HierarchyChart
                root={trialBalanceHierarchy}
                mode={trialBalanceChartMode}
                height={480}
                ariaLabel="Trial balance allocation"
              />
            {/snippet}
          </ChartPanel>
          <ChartSwitcher
            charts={[
              { id: "income", label: "Income" },
              { id: "expenses", label: "Expenses" },
              { id: "assets", label: "Assets" },
              { id: "liabilities", label: "Liabilities" },
              { id: "equity", label: "Equity" },
            ]}
            activeChartId={trialBalancePerspective}
            ariaLabel="Trial balance sections"
            tabsPlacement="top"
            onActiveChartChange={(value) => {
              trialBalancePerspective = value;
            }}
          >
            {#snippet children()}
              <StatementSummaryTreeTable
                title="Trial Balance"
                total="0.00 GBP"
                columns={statementColumns}
                nodes={trialBalanceNodes}
                contributions={trialBalanceContributions}
              />
            {/snippet}
          </ChartSwitcher>
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
    await userEvent.click(canvas.getByRole("tab", { name: "Area Map" }));
    await expect(canvas.getByRole("tab", { name: "Area Map" })).toHaveAttribute(
      "data-state",
      "active",
    );
    await userEvent.click(canvas.getByRole("tab", { name: "Line Chart" }));
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
    <ScreenFrame pageTitle="Account: Assets:Checking">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__page--report">
          <Breadcrumb.Root class="bc-screen-story__breadcrumbs">
            <Breadcrumb.List>
              <Breadcrumb.Item>
                <Breadcrumb.Link href="/journal">Journal</Breadcrumb.Link>
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Link href="/accounts/Assets">Assets</Breadcrumb.Link
                >
              </Breadcrumb.Item>
              <Breadcrumb.Separator />
              <Breadcrumb.Item>
                <Breadcrumb.Page>Assets:Checking</Breadcrumb.Page>
              </Breadcrumb.Item>
            </Breadcrumb.List>
          </Breadcrumb.Root>
          <ChartPanel
            ariaLabel="Account balance controls"
            legend={{
              items: [
                {
                  id: "gbp",
                  label: "GBP",
                  color: "var(--ui-beancount-accepted)",
                },
              ],
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
              value: accountDetailChartMode,
              options: [
                { value: "line", label: "Line Chart" },
                { value: "area", label: "Area Map" },
              ],
              ariaLabel: "Account balance chart representation",
              onChange: (value) => {
                accountDetailChartMode = value as "line" | "area";
              },
            }}
          >
            {#snippet children()}
              <LineChart
                series={accountDetailLineSeries}
                mode={accountDetailChartMode}
                interpolation="step"
                xTickCount={7}
                yTickCount={15}
                ariaLabel="Assets Checking balance history"
                valueFormatter={formatReportAxisAmount}
              />
            {/snippet}
          </ChartPanel>
          <ChartSwitcher
            charts={[
              { id: "account-balance", label: "Account Balance" },
              { id: "changes", label: "Changes" },
              { id: "checking", label: "Assets:Checking" },
              { id: "august-2026", label: "Aug 2026" },
              { id: "july-2026", label: "Jul 2026" },
              { id: "june-2026", label: "Jun 2026" },
            ]}
            activeChartId={accountDetailPerspective}
            ariaLabel="Account report sections"
            tabsPlacement="top"
            onActiveChartChange={(value) => {
              accountDetailPerspective = value;
            }}
          >
            {#snippet children()}
              <ChartSwitcher
                charts={[
                  { id: "account-table", label: "Account Table" },
                  { id: "changes-monthly", label: "Changes (Monthly)" },
                  { id: "balances-monthly", label: "Balances (Monthly)" },
                ]}
                activeChartId={accountDetailTablePerspective}
                ariaLabel="Account table sections"
                tabsPlacement="top"
                onActiveChartChange={(value) => {
                  accountDetailTablePerspective = value;
                }}
              >
                {#snippet children()}
                  <LedgerActivityTable
                    groups={accountDetailGroups}
                    ariaLabel="Assets Checking activity"
                    amountHeading="Balance"
                    timeframes={[
                      { id: "transactions", label: "Transactions" },
                      { id: "upcoming", label: "Upcoming" },
                    ]}
                    timeframe={accountDetailTimeframe}
                    onTimeframeChange={(value) => {
                      accountDetailTimeframe = value;
                    }}
                  />
                {/snippet}
              </ChartSwitcher>
            {/snippet}
          </ChartSwitcher>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Holdings"
  parameters={{ visualDelta: visualDeltaForScreen("holdings") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Assets:Cash")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("tab", { name: "Holdings by Account" }),
    );
    await expect(
      canvas.getByRole("tab", { name: "Holdings by Account" }),
    ).toHaveAttribute("data-state", "active");
    await userEvent.click(
      canvas.getByRole("button", { name: "Open holdings query" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Open holdings query" }),
    ).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(
      canvas.getByRole("button", { name: "Open holdings query" }),
    );
    await userEvent.click(canvas.getByRole("tab", { name: "Holdings" }));
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Holdings">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__holdings">
          <Tabs.Root
            value={holdingsPerspective}
            onValueChange={(next) => {
              if (next) holdingsPerspective = next;
            }}
          >
            <Tabs.List aria-label="Holdings perspectives">
              <Tabs.Trigger value="holdings">Holdings</Tabs.Trigger>
              <Tabs.Trigger value="by-account">Holdings by Account</Tabs.Trigger
              >
              <Tabs.Trigger value="by-currency"
                >Holdings by Currency</Tabs.Trigger
              >
              <Tabs.Trigger value="by-cost-currency"
                >Holdings by Cost currency</Tabs.Trigger
              >
            </Tabs.List>
          </Tabs.Root>
          <Button
            variant="outline"
            class="bc-screen-story__holdings-query"
            aria-label="Open holdings query"
            aria-pressed={holdingsQueryRequested}
            onclick={() => {
              holdingsQueryRequested = !holdingsQueryRequested;
            }}
          >
            Query
          </Button>
          <HoldingsTable
            columns={holdingColumns}
            rows={visibleHoldingRows}
            pagination={{
              page: holdingsPage,
              pageCount: Math.ceil(holdingRows.length / holdingsPageSize),
              resultLabel: holdingsResultLabel,
              pageSize: holdingsPageSize,
              pageSizes: [10, 20, 50],
            }}
            onPageChange={(page) => {
              holdingsPage = page;
            }}
          />
          <output class="bc-screen-story__status" aria-live="polite">
            {holdingsQueryRequested ? "Query controls requested" : ""}
          </output>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Statistics"
  parameters={{ visualDelta: visualDeltaForScreen("statistics") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Liabilities:CreditCard:MbNa")).toBeVisible();
    await userEvent.click(canvas.getByRole("tab", { name: "Update Activity" }));
    await expect(
      canvas.getByRole("tab", { name: "Update Activity" }),
    ).toHaveAttribute("data-state", "active");
    await userEvent.click(
      canvas.getByRole("button", { name: "Open statistics query" }),
    );
    await expect(
      canvas.getByRole("button", { name: "Open statistics query" }),
    ).toHaveAttribute("aria-pressed", "true");
    await userEvent.click(
      canvas.getByRole("button", { name: "Open statistics query" }),
    );
    await userEvent.click(
      canvas.getByRole("tab", { name: "Postings per Account" }),
    );
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Statistics">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__statistics">
          <Tabs.Root
            value={statisticsPerspective}
            onValueChange={(next) => {
              if (next) statisticsPerspective = next;
            }}
          >
            <Tabs.List aria-label="Statistics perspectives">
              <Tabs.Trigger value="postings-by-account"
                >Postings per Account</Tabs.Trigger
              >
              <Tabs.Trigger value="update-activity"
                >Update Activity</Tabs.Trigger
              >
              <Tabs.Trigger value="entries-by-type"
                >Entries Per Type</Tabs.Trigger
              >
            </Tabs.List>
          </Tabs.Root>
          <div class="bc-screen-story__statistics-query-row">
            <Button
              variant="outline"
              aria-label="Open statistics query"
              aria-pressed={statisticsQueryRequested}
              onclick={() => {
                statisticsQueryRequested = !statisticsQueryRequested;
              }}
            >
              Query
            </Button>
          </div>
          <HoldingsTable
            ariaLabel="Posting statistics"
            columns={statisticsColumns}
            rows={visibleStatisticsRows}
            pagination={{
              page: statisticsPage,
              pageCount: Math.ceil(statisticsRows.length / statisticsPageSize),
              resultLabel: statisticsResultLabel,
              pageSize: statisticsPageSize,
              pageSizes: [10, 20, 50],
            }}
            onPageChange={(page) => {
              statisticsPage = page;
            }}
          />
          <output class="bc-screen-story__status" aria-live="polite">
            {statisticsQueryRequested ? "Query controls requested" : ""}
          </output>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Query"
  parameters={{ visualDelta: visualDeltaForScreen("query") }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByRole("textbox", { name: "BQL query" }),
    ).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Query">
      <ContentScrollArea>
        <div class="bc-screen-story__page">
          <QueryComposer />
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Errors"
  parameters={{ visualDelta: visualDeltaForScreen("errors") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No records")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Errors">
      <ContentScrollArea>
        <div class="bc-screen-story__page">
          <ValidationErrorTable
            errors={[]}
            emptyVariant="compact"
            emptyTitle="No records"
          />
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
      canvas.getByRole("heading", { name: "No imports to review" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Open Accounts" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Accounts requested",
    );
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Records">
      <ContentScrollArea>
        <div class="bc-screen-story__page">
          <IngestionReviewTable
            groups={[]}
            counts={{ review: 0, ready: 0, duplicates: 0 }}
            emptyVariant="fava-records"
            onEmptyAction={() => {
              recordsAccountsRequested = true;
            }}
          />
          <output class="bc-screen-story__status" aria-live="polite">
            {recordsAccountsRequested ? "Accounts requested" : ""}
          </output>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Settings"
  parameters={{ visualDelta: visualDeltaForScreen("settings") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Your connections · 1")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("switch", { name: "Use YAML source configuration" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("YAML enabled");
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Sources">
      {#snippet headerActions()}
        <SourceToolbar
          syncAllDisabled={true}
          yamlMode={sourceYamlMode}
          onSyncAll={() => {
            sourceAction = "Sync all";
          }}
          onYamlModeChange={(next) => {
            sourceYamlMode = next;
            sourceAction = `YAML ${next ? "enabled" : "disabled"}`;
          }}
          onEditSources={() => {
            sourceAction = "Edit sources";
          }}
          onOpenSyncHistory={() => {
            sourceAction = "Open source sync history";
          }}
        />
      {/snippet}
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__sources">
          <SourceConnectionCatalog
            {connectedSources}
            {availableSources}
            onOpenConnection={(source) => {
              sourceAction = `Open ${source.name}`;
            }}
            onConnect={(source) => {
              sourceAction = `Connect ${source.name}`;
            }}
          />
          <output class="bc-screen-story__status" aria-live="polite">
            {sourceAction}
          </output>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Settings accounts"
  parameters={{ visualDelta: visualDeltaForScreen("settings-accounts") }}
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("Credential available · Discovering accounts..."),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Open Lunch Flow accounts" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Open Lunch Flow",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Open Other Accounts" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Open Other Accounts",
    );
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Accounts">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__source-accounts">
          <SourceAccountGroups
            source={sourceAccountSource}
            otherAccounts={unassignedAccountGroup}
            onOpenSource={(source) => {
              sourceAccountAction = `Open ${source.name}`;
            }}
            onOpenOtherAccounts={(group) => {
              sourceAccountAction = `Open ${group.label}`;
            }}
          />
          <output class="bc-screen-story__status" aria-live="polite">
            {sourceAccountAction}
          </output>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Settings rules"
  parameters={{ visualDelta: visualDeltaForScreen("settings-rules") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Test Rule")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("switch", { name: "Set Test Rule active" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Test Rule inactive",
    );
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Rules">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__rules">
          <RuleList
            rule={{ ...testRule, active: ruleActive }}
            onOpenRule={(rule) => {
              ruleAction = `Open ${rule.name}`;
            }}
            onActiveChange={(rule, active) => {
              ruleActive = active;
              ruleAction = `${rule.name} ${active ? "active" : "inactive"}`;
            }}
            onMoreActions={(rule) => {
              ruleAction = `More actions for ${rule.name}`;
            }}
          />
          <output class="bc-screen-story__status" aria-live="polite"
            >{ruleAction}</output
          >
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<style>
  .bc-screen-story__page {
    padding: var(--ui-beancount-space-4);
  }

  .bc-screen-story__page--report {
    display: grid;
    gap: calc(var(--ui-beancount-space-4) * 2);
  }

  .bc-screen-story__holdings {
    display: grid;
    gap: var(--ui-beancount-space-3);
  }

  .bc-screen-story__statistics {
    display: grid;
    gap: var(--ui-beancount-space-3);
  }

  .bc-screen-story__statistics-query-row {
    display: flex;
    justify-content: flex-end;
  }

  .bc-screen-story__sources {
    max-width: 70rem;
    margin-inline: auto;
  }

  .bc-screen-story__source-accounts {
    max-width: 70rem;
    margin-inline: auto;
  }

  .bc-screen-story__rules {
    max-width: 96rem;
    margin-inline: auto;
  }

  :global(.bc-screen-story__holdings-query) {
    width: max-content;
  }

  .bc-screen-story__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  :global(.bc-screen-story__page--report .bc-bar-chart__summary) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  :global(.bc-screen-story__page--report .bc-line-chart__summary) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  :global(.bc-screen-story__page--report .bc-hierarchy-chart__summary) {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  :global(.bc-screen-story__page--report .bc-hierarchy-chart__canvas) {
    border: 0;
    border-radius: 0;
    padding: 0;
    box-shadow: none;
  }

  .bc-screen-story__placeholder-title {
    margin: 0;
    color: var(--ui-beancount-foreground);
    font-size: var(--text-base);
    font-weight: var(--font-weight-medium);
  }

  :global(.bc-screen-story__breadcrumbs) {
    margin-block-end: var(--ui-beancount-space-2);
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
