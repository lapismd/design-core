<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent, within } from "storybook/test";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import * as Breadcrumb from "@stevejuma/ui/shadcn/breadcrumb";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Tabs from "@stevejuma/ui/shadcn/tabs";
  import EditorMenuBar, { type EditorMenuAction } from "./EditorMenuBar.svelte";
  import EditorToolbar from "./EditorToolbar.svelte";
  import LedgerEditorSurface from "./LedgerEditorSurface.svelte";
  import PresetQueryReport from "./PresetQueryReport.svelte";
  import QueryWorkspace from "./QueryWorkspace.svelte";
  import ScreenFrame from "./ScreenFrame.svelte";
  import { visualDeltaForScreen } from "./visual-delta.js";
  import BarChart from "../charts/BarChart.svelte";
  import ChartPanel from "../charts/ChartPanel.svelte";
  import ChartSwitcher from "../charts/ChartSwitcher.svelte";
  import HierarchyChart from "../charts/HierarchyChart.svelte";
  import LineChart from "../charts/LineChart.svelte";
  import FinancialDashboard from "../dashboard/FinancialDashboard.svelte";
  import LedgerActivityTable from "../tables/LedgerActivityTable.svelte";
  import StatementSummaryTreeTable from "../tables/StatementSummaryTreeTable.svelte";
  import IngestionReviewTable from "../tables/IngestionReviewTable.svelte";
  import IngestionReviewToolbar from "../tables/IngestionReviewToolbar.svelte";
  import ValidationErrorTable from "../feedback/ValidationErrorTable.svelte";
  import ContentScrollArea from "../layout/ContentScrollArea.svelte";
  import LedgerSettingsNavigation from "../navigation/LedgerSettingsNavigation.svelte";
  import RuleList from "../rules/RuleList.svelte";
  import RulesToolbar from "../rules/RulesToolbar.svelte";
  import SourceAccountGroups from "../sources/SourceAccountGroups.svelte";
  import SourceConnectionCatalog from "../sources/SourceConnectionCatalog.svelte";
  import ImportAccountsToolbar from "../sources/ImportAccountsToolbar.svelte";
  import SourceToolbar from "../sources/SourceToolbar.svelte";
  import {
    accountDetailGroups,
    accountDetailLineSeries,
    availableSources,
    balanceSheetContributions,
    balanceSheetLineSeries,
    balanceSheetNodes,
    connectedSources,
    editorPreviewLines,
    holdingColumns,
    holdingRows,
    incomeStatementChartGroups,
    incomeStatementContributions,
    incomeStatementNodes,
    journalGroups,
    journalUpcomingGroups,
    readyReviewGroups,
    reviewGroups,
    reviewSourceOptions,
    statementColumns,
    statementNodes,
    statisticsColumns,
    statisticsRows,
    sourceAccountSource,
    sourceAccountActions,
    testRule,
    testRuleActions,
    trialBalanceContributions,
    trialBalanceHierarchy,
    trialBalanceNodes,
    unassignedAccountGroup,
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
      changeTone: "positive" as const,
    },
  ];

  const dashboardInflows = [
    {
      id: "salary",
      label: "Salary",
      value: 59224.98,
      color: "var(--ui-beancount-dashboard-series-indigo)",
    },
  ];

  const dashboardOutflows = [
    {
      id: "joint",
      label: "Joint",
      value: 19500,
      valueLabel: "19500.00 GBP",
      shareLabel: "45.5%",
      color: "var(--ui-beancount-dashboard-series-indigo)",
    },
    {
      id: "paye",
      label: "PAYE",
      value: 18703.56,
      valueLabel: "18703.56 GBP",
      shareLabel: "43.6%",
      color: "var(--ui-beancount-dashboard-series-gold)",
    },
    {
      id: "nic",
      label: "NIC",
      value: 2167.5,
      valueLabel: "2167.50 GBP",
      shareLabel: "5.1%",
      color: "var(--ui-beancount-dashboard-series-cyan)",
    },
    {
      id: "pension",
      label: "Pension",
      value: 1100.76,
      valueLabel: "1100.76 GBP",
      shareLabel: "2.6%",
      color: "var(--ui-beancount-dashboard-series-indigo)",
    },
    {
      id: "phone",
      label: "Phone",
      value: 508.62,
      valueLabel: "508.62 GBP",
      shareLabel: "1.2%",
      color: "var(--ui-beancount-dashboard-series-green)",
    },
    {
      id: "interest",
      label: "Interest",
      value: 369.43,
      valueLabel: "369.43 GBP",
      shareLabel: "0.9%",
      color: "var(--ui-beancount-dashboard-series-indigo)",
    },
    {
      id: "insurance",
      label: "Insurance",
      value: 221.64,
      valueLabel: "221.64 GBP",
      shareLabel: "0.5%",
      color: "var(--ui-beancount-dashboard-series-violet)",
    },
    {
      id: "lifestyle",
      label: "Lifestyle",
      value: 90.93,
      valueLabel: "90.93 GBP",
      shareLabel: "0.2%",
      color: "var(--ui-beancount-dashboard-series-indigo)",
    },
    {
      id: "other",
      label: "Other",
      value: 216.61,
      valueLabel: "216.61 GBP",
      shareLabel: "0.5%",
      color: "var(--ui-beancount-dashboard-series-other)",
    },
  ];

  const dashboardAccountGroups = [
    {
      id: "assets",
      title: "Assets",
      viewAllLabel: "View assets",
      nodes: [
        {
          id: "assets-root",
          label: "Assets",
          value: 6155.89,
          color: "var(--ui-beancount-dashboard-series-orange)",
          children: [
            {
              id: "assets-cash",
              label: "Cash",
              value: 3725.89,
              color: "var(--ui-beancount-dashboard-series-indigo)",
            },
            {
              id: "assets-pension",
              label: "Pension",
              value: 2430,
              color: "var(--ui-beancount-dashboard-series-indigo)",
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
          id: "liabilities-root",
          label: "Liabilities",
          value: 4400,
          color: "var(--ui-beancount-dashboard-series-red)",
          children: [
            {
              id: "liabilities-card",
              label: "Credit card",
              value: 4400,
              color: "var(--ui-beancount-dashboard-series-red)",
            },
          ],
        },
      ],
    },
    {
      id: "equity",
      title: "Equity",
      viewAllLabel: "View equity",
      nodes: [
        {
          id: "equity-root",
          label: "Equity",
          value: 0,
          color: "var(--ui-beancount-dashboard-series-teal)",
        },
      ],
    },
  ];

  const dashboardNetWorth = {
    valueLabel: "1755.89 GBP",
    change: 16345.93,
    changeLabel: "+16345.93 GBP",
    changeDescription: "Compared with the start of this period",
    trendTone: "positive" as const,
    points: [
      {
        id: "january",
        date: new Date("2026-01-01"),
        label: "01 Jan 2026",
        value: -14590.04,
        valueLabel: "−14590.04 GBP",
      },
      {
        id: "april",
        date: new Date("2026-04-01"),
        label: "01 Apr 2026",
        value: -6250.12,
        valueLabel: "−6250.12 GBP",
      },
      {
        id: "july",
        date: new Date("2026-07-01"),
        label: "01 Jul 2026",
        value: 1755.89,
        valueLabel: "1755.89 GBP",
      },
    ],
  };

  const formatDashboardAmount = (value: number) => `${value.toFixed(2)} GBP`;

  /**
   * Full-screen Fava references capture the initial route state. Interaction
   * stories restore that state before Storybook's end-of-play visual capture
   * so controlled values, keyboard focus, and scroll position do not become
   * baseline candidates.
   */
  function restoreReferenceCapture() {
    for (const viewport of document.querySelectorAll<HTMLElement>(
      '[data-fava-screen-frame] [data-content-scroll-area] [data-slot="scroll-area-viewport"]',
    )) {
      viewport.scrollTop = 0;
      viewport.scrollLeft = 0;
    }

    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
  }

  let journalTimeframe = $state("transactions");
  let journalRecordAction = $state("");
  let editorHeadersCollapsedAll = $state(false);
  let editorFormatOnSave = $state(true);
  let editorAction = $state("");
  let dashboardAction = $state("");
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
  let recordsFilter = $state<"review" | "ready">("review");
  let recordsSelectedIds = $state<string[]>([]);
  let recordsSourceId = $state("all");
  let recordsGroupsCollapsedAll = $state(false);
  let recordsAction = $state("");
  let validationErrorNavigation = $state("");
  let sourceAction = $state("");
  let sourceYamlMode = $state(false);
  let sourceExpandedId = $state<string | undefined>();
  let sourceFieldValues = $state<Record<string, string>>({});
  let sourceAccountAction = $state("");
  let sourceAccountExpandedId = $state<string | undefined>();
  let ruleActive = $state(true);
  let ruleAction = $state("");

  const holdingsPageSize = 10;
  const activeJournalGroups = $derived(
    journalTimeframe === "upcoming" ? journalUpcomingGroups : journalGroups,
  );
  const visibleHoldingRows = $derived(
    holdingRows.slice(
      (holdingsPage - 1) * holdingsPageSize,
      holdingsPage * holdingsPageSize,
    ),
  );
  const visibleReviewGroups = $derived(
    recordsFilter === "review" ? reviewGroups : readyReviewGroups,
  );
  const sourceConnectionModels = $derived(
    connectedSources.map((source) => ({
      ...source,
      details: source.details
        ? {
            ...source.details,
            fields: source.details.fields?.map((field) => ({
              ...field,
              value:
                sourceFieldValues[`${source.id}:${field.id}`] ?? field.value,
            })),
          }
        : undefined,
    })),
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
  const formatBalanceSheetAxisAmount = (value: number) =>
    Math.abs(value) < 1000
      ? `${value < 0 ? "−" : ""}${Math.abs(value).toFixed(2)}`
      : `${value < 0 ? "−" : ""}${(Math.abs(value) / 1000).toFixed(2)}k`;

  const editorSources = [{ id: "account-ledger", label: "Account Ledger" }];
  const editorActionLabels: Record<EditorMenuAction, string> = {
    "ask-ai": "Ask AI about selection requested",
    "close-all-folds": "Close all folds requested",
    find: "Find requested",
    "find-next": "Find next requested",
    "find-previous": "Find previous requested",
    format: "Format requested",
    "go-to-line": "Go to line requested",
    "open-all-folds": "Open all folds requested",
    "toggle-comment": "Toggle comment requested",
  };
</script>

<Story
  name="Editor"
  parameters={{ visualDelta: visualDeltaForScreen("editor") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Options")).toBeVisible();
    await expect(canvas.getByText('"Account Ledger"')).toBeVisible();
    await expect(
      canvas.getByRole("button", { name: "Example with budgets" }),
    ).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Collapse all headings" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Collapse headings requested",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Expand all headings" }),
    );
    await expect(canvas.getByText('"Account Ledger"')).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Save ledger" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Save ledger requested",
    );
    await userEvent.click(canvas.getByRole("button", { name: "File" }));
    await userEvent.click(
      within(document.body).getByRole("menuitem", { name: "Go To Line" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Go to line requested",
    );
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Editor">
      {#snippet headerLeading()}
        <EditorMenuBar
          sources={editorSources}
          activeSourceId="account-ledger"
          formatOnSave={editorFormatOnSave}
          onSourceSelect={(source) => {
            editorAction = `Open ${source.label} requested`;
          }}
          onFormatOnSaveChange={(formatOnSave) => {
            editorFormatOnSave = formatOnSave;
            editorAction = `Format on save ${formatOnSave ? "enabled" : "disabled"}`;
          }}
          onAction={(action) => {
            editorAction = editorActionLabels[action];
          }}
        />
      {/snippet}
      {#snippet headerActions()}
        <EditorToolbar
          headersCollapsedAll={editorHeadersCollapsedAll}
          onToggleHeadings={() => {
            editorHeadersCollapsedAll = !editorHeadersCollapsedAll;
            editorAction = editorHeadersCollapsedAll
              ? "Collapse headings requested"
              : "Expand headings requested";
          }}
          onSave={() => {
            editorAction = "Save ledger requested";
          }}
        />
      {/snippet}
      <ContentScrollArea
        ariaLabel="Ledger source content"
        contentClass="bc-screen-story__editor-content"
      >
        <LedgerEditorSurface
          lines={editorPreviewLines}
          headersCollapsedAll={editorHeadersCollapsedAll}
          activeLineNumber={1}
        />
      </ContentScrollArea>
      <output class="bc-screen-story__status" aria-live="polite">
        {editorAction}
      </output>
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
    await expect(
      canvas.getByRole("button", { name: "Credit card" }),
    ).toBeVisible();
    await expect(
      canvas.getByRole("slider", { name: "Explore trend by date" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Credit card" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Open Credit card in Liabilities",
    );
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Dashboard">
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
        accountGroups={dashboardAccountGroups}
        netWorth={dashboardNetWorth}
        valueFormatter={formatDashboardAmount}
        onOutflowSelect={(category) => {
          dashboardAction = `Open ${category.label} outflows`;
        }}
        onAccountSelect={(node, group) => {
          dashboardAction = `Open ${node.label} in ${group.title}`;
        }}
        onAccountGroupSelect={(group) => {
          dashboardAction = `Open ${group.title}`;
        }}
      />
      <output class="bc-screen-story__status" aria-live="polite"
        >{dashboardAction}</output
      >
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
    await expect(canvas.getByText("Scheduled rent")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: /Scheduled rent/ }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Open Scheduled rent",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Transactions" }));
    await expect(
      canvas.getByRole("button", { name: "Transactions" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(canvas.getByText("NHS")).toBeVisible();
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Journal">
      <ContentScrollArea>
        <div class="bc-screen-story__page">
          <LedgerActivityTable
            groups={activeJournalGroups}
            showAccountAvatars
            timeframes={[
              { id: "transactions", label: "Transactions" },
              { id: "upcoming", label: "Upcoming" },
            ]}
            timeframe={journalTimeframe}
            onTimeframeChange={(value) => {
              journalTimeframe = value;
            }}
            onOpenRecord={(record) => {
              journalRecordAction = `Open ${record.description}`;
            }}
          />
          <output class="bc-screen-story__status" aria-live="polite"
            >{journalRecordAction}</output
          >
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
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Income Statement">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__page--report">
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
            onActiveChartChange={(value) => {
              incomePerspective = value;
            }}
          >
            {#snippet children()}
              <ChartPanel
                ariaLabel="Income statement controls"
                legend={{
                  items: [{ id: "gbp", label: "GBP" }],
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
                    chartWidth={900}
                    chartHeight={250}
                    minXLabelSpacing={68}
                    valueDomain={{ min: -10500, max: 7500 }}
                    yTickValues={[
                      -10000, -8000, -6000, -4000, -2000, 0, 2000, 4000, 6000,
                    ]}
                    valueFormatter={formatReportAxisAmount}
                  />
                {/snippet}
              </ChartPanel>
            {/snippet}
          </ChartSwitcher>
          <div class="bc-screen-story__statement-section">
            <StatementSummaryTreeTable
              title="Income"
              total="−213145.48 GBP"
              href="/accounts/Income"
              columns={statementColumns}
              nodes={incomeStatementNodes}
              contributions={incomeStatementContributions}
            />
          </div>
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
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Balance Sheet">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__page--report">
          <ChartSwitcher
            charts={[
              { id: "net-worth", label: "Net Worth" },
              { id: "assets", label: "Assets" },
              { id: "liabilities", label: "Liabilities" },
              { id: "equity", label: "Equity" },
            ]}
            activeChartId={balanceSheetPerspective}
            ariaLabel="Balance sheet sections"
            onActiveChartChange={(value) => {
              balanceSheetPerspective = value;
            }}
          >
            {#snippet children()}
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
                    interpolation="step"
                    xTickCount={6}
                    chartWidth={900}
                    chartHeight={250}
                    valueDomain={{ min: -56500, max: 8000 }}
                    yTickValues={[
                      -50000, -45000, -40000, -35000, -30000, -25000, -20000,
                      -15000, -10000, -5000, 0, 5000,
                    ]}
                    gridOpacity={0.2}
                    ariaLabel="Balance sheet net worth history"
                    valueFormatter={formatBalanceSheetAxisAmount}
                  />
                {/snippet}
              </ChartPanel>
            {/snippet}
          </ChartSwitcher>
          <div class="bc-screen-story__statement-section">
            <StatementSummaryTreeTable
              title="Assets"
              total="24921.78 GBP"
              href="/accounts/Assets"
              columns={statementColumns}
              nodes={balanceSheetNodes}
              contributions={balanceSheetContributions}
            />
          </div>
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
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Trial Balance">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__page--report">
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
            onActiveChartChange={(value) => {
              trialBalancePerspective = value;
            }}
          >
            {#snippet children()}
              <ChartPanel
                ariaLabel="Trial balance controls"
                legend={{
                  items: [{ id: "gbp", label: "GBP" }],
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
                    height={320}
                    ariaLabel="Trial balance allocation"
                  />
                {/snippet}
              </ChartPanel>
            {/snippet}
          </ChartSwitcher>
          <div class="bc-screen-story__statement-section">
            <StatementSummaryTreeTable
              title="Trial Balance"
              total="0.00 GBP"
              columns={statementColumns}
              nodes={trialBalanceNodes}
              contributions={trialBalanceContributions}
            />
          </div>
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
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Account: Assets:Checking">
      <ContentScrollArea>
        <div
          class="bc-screen-story__page bc-screen-story__page--report bc-screen-story__page--account-report"
        >
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
            onActiveChartChange={(value) => {
              accountDetailPerspective = value;
            }}
          >
            {#snippet children()}
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
                    chartWidth={900}
                    chartHeight={250}
                    valueDomain={{ min: -3200, max: 27400 }}
                    yTickValues={[
                      -2000, 0, 2000, 4000, 6000, 8000, 10000, 12000, 14000,
                      16000, 18000, 20000, 22000, 24000, 26000,
                    ]}
                    gridOpacity={0.2}
                    ariaLabel="Assets Checking balance history"
                    valueFormatter={formatReportAxisAmount}
                  />
                {/snippet}
              </ChartPanel>
            {/snippet}
          </ChartSwitcher>
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
                showAccountAvatars
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
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Holdings">
      <PresetQueryReport
        perspectives={[
          { value: "holdings", label: "Holdings" },
          { value: "by-account", label: "Holdings by Account" },
          { value: "by-currency", label: "Holdings by Currency" },
          { value: "by-cost-currency", label: "Holdings by Cost currency" },
        ]}
        perspective={holdingsPerspective}
        columns={holdingColumns}
        rows={visibleHoldingRows}
        ariaLabel="Holdings"
        tabListLabel="Holdings perspectives"
        queryActionAriaLabel="Open holdings query"
        queryActionPressed={holdingsQueryRequested}
        statusText={holdingsQueryRequested ? "Query controls requested" : ""}
        pagination={{
          page: holdingsPage,
          pageCount: Math.ceil(holdingRows.length / holdingsPageSize),
          resultLabel: holdingsResultLabel,
          pageSize: holdingsPageSize,
          pageSizes: [10, 20, 50],
        }}
        onPerspectiveChange={(next) => {
          holdingsPerspective = next;
        }}
        onQueryAction={() => {
          holdingsQueryRequested = !holdingsQueryRequested;
        }}
        onPageChange={(page) => {
          holdingsPage = page;
        }}
      />
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
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Statistics">
      <PresetQueryReport
        perspectives={[
          { value: "postings-by-account", label: "Postings per Account" },
          { value: "update-activity", label: "Update Activity" },
          { value: "entries-by-type", label: "Entries Per Type" },
        ]}
        perspective={statisticsPerspective}
        columns={statisticsColumns}
        rows={visibleStatisticsRows}
        ariaLabel="Posting statistics"
        tabListLabel="Statistics perspectives"
        queryActionAriaLabel="Open statistics query"
        queryActionAlign="end"
        queryActionPressed={statisticsQueryRequested}
        statusText={statisticsQueryRequested ? "Query controls requested" : ""}
        pagination={{
          page: statisticsPage,
          pageCount: Math.ceil(statisticsRows.length / statisticsPageSize),
          resultLabel: statisticsResultLabel,
          pageSize: statisticsPageSize,
          pageSizes: [10, 20, 50],
        }}
        onPerspectiveChange={(next) => {
          statisticsPerspective = next;
        }}
        onQueryAction={() => {
          statisticsQueryRequested = !statisticsQueryRequested;
        }}
        onPageChange={(page) => {
          statisticsPage = page;
        }}
      />
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Query"
  parameters={{ visualDelta: visualDeltaForScreen("query") }}
  play={async ({ canvas }) => {
    const queryInput = canvas.getByRole("textbox", { name: "BQL query" });
    await expect(queryInput).toBeVisible();
    await expect(queryInput).toHaveValue("");
    await expect(canvas.getByText("No ledger files found.")).toBeVisible();
    await expect(
      canvas.queryByRole("button", { name: "Select query" }),
    ).not.toBeInTheDocument();
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame
      pageTitle="Query"
      sidebarLedgerItems={[]}
      sidebarLedgerCount={0}
      showLedgerTools={false}
    >
      <QueryWorkspace />
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Errors"
  parameters={{ visualDelta: visualDeltaForScreen("errors") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("No records")).toBeVisible();
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Errors">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__page--errors">
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
  name="Errors with validation failure"
  play={async ({ canvas }) => {
    await expect(
      canvas.getByText("Duplicate open directive for Assets:Cash"),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("link", { name: "3" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Open editor at line 3",
    );
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Errors">
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__page--errors">
          <ValidationErrorTable
            errors={validationErrors}
            onNavigate={(error) => {
              validationErrorNavigation = `Open editor at line ${error.line}`;
            }}
          />
          <output class="bc-screen-story__status" aria-live="polite">
            {validationErrorNavigation}
          </output>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Records"
  parameters={{ visualDelta: visualDeltaForScreen("records") }}
  play={async ({ canvas }) => {
    const emptyHeading = canvas.getByRole("heading", {
      name: "No imports to review",
    });
    await expect(emptyHeading).toBeVisible();
    const emptyPanel = emptyHeading.closest("section");
    if (!emptyPanel) throw new Error("Records empty panel was not rendered");
    await userEvent.click(
      within(emptyPanel).getByRole("button", { name: "Open Accounts" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Accounts requested",
    );
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Records">
      {#snippet headerActions()}
        <IngestionReviewToolbar
          sourceId={recordsSourceId}
          sourceOptions={reviewSourceOptions}
          canRerunAi={true}
          onOpenLedger={() => {
            recordsAction = "Open active review ledger";
          }}
          onSourceChange={(sourceId) => {
            recordsSourceId = sourceId;
            recordsAction = `Source ${sourceId}`;
          }}
          onToggleCollapseGroups={() => {
            recordsGroupsCollapsedAll = !recordsGroupsCollapsedAll;
            recordsAction = recordsGroupsCollapsedAll
              ? "Collapse all date groups"
              : "Expand all date groups";
          }}
          onOpenMerchants={() => {
            recordsAction = "Review merchants";
          }}
          onOpenAccounts={() => {
            recordsAccountsRequested = true;
          }}
          onForceRefetch={() => {
            recordsAction = "Force re-fetch";
          }}
          onRerunAi={() => {
            recordsAction = "Re-run AI enrichment";
          }}
          onEditSources={() => {
            recordsAction = "Edit sources";
          }}
        />
      {/snippet}
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
  name="Records with populated review queue"
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Northstar Cafe")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("checkbox", { name: "Select Northstar Cafe" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "1 proposal selected",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Ready (1)" }));
    await expect(canvas.getByText("Grocerly")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Review Grocerly" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Open Grocerly");
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Records">
      {#snippet headerActions()}
        <IngestionReviewToolbar
          acceptCount={1}
          canAccept={true}
          canOpenLedger={true}
          sourceId={recordsSourceId}
          sourceOptions={reviewSourceOptions}
          groupsCollapsedAll={recordsGroupsCollapsedAll}
          canForceRefetch={true}
          canRerunAi={true}
          onAccept={() => {
            recordsAction = "Accept 1 ready transaction";
          }}
          onOpenLedger={() => {
            recordsAction = "Open active review ledger";
          }}
          onSourceChange={(sourceId) => {
            recordsSourceId = sourceId;
            recordsAction = `Source ${sourceId}`;
          }}
          onToggleCollapseGroups={() => {
            recordsGroupsCollapsedAll = !recordsGroupsCollapsedAll;
            recordsAction = recordsGroupsCollapsedAll
              ? "Collapse all date groups"
              : "Expand all date groups";
          }}
          onOpenMerchants={() => {
            recordsAction = "Review merchants";
          }}
          onOpenAccounts={() => {
            recordsAction = "Open Accounts";
          }}
          onForceRefetch={() => {
            recordsAction = "Force re-fetch";
          }}
          onRerunAi={() => {
            recordsAction = "Re-run AI enrichment";
          }}
          onEditSources={() => {
            recordsAction = "Edit sources";
          }}
        />
      {/snippet}
      <ContentScrollArea>
        <div class="bc-screen-story__page">
          <IngestionReviewTable
            groups={visibleReviewGroups}
            counts={{ review: 2, ready: 1, duplicates: 1 }}
            filter={recordsFilter}
            selectedIds={recordsSelectedIds}
            onFilterChange={(filter) => {
              recordsFilter = filter;
              recordsSelectedIds = [];
            }}
            onSelectedIdsChange={(ids) => {
              recordsSelectedIds = ids;
              recordsAction = `${ids.length} proposal${ids.length === 1 ? "" : "s"} selected`;
            }}
            onOpenRow={(row) => {
              recordsAction = `Open ${row.title}`;
            }}
          />
          <output class="bc-screen-story__status" aria-live="polite">
            {recordsAction}
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
    const yamlSwitch = canvas.getByRole("switch", {
      name: "Use YAML source configuration",
    });
    const lunchFlowButton = canvas.getByRole("button", {
      name: "Open Lunch Flow",
    });

    await userEvent.click(yamlSwitch);
    await expect(canvas.getByRole("status")).toHaveTextContent("YAML enabled");
    await userEvent.click(lunchFlowButton);
    await expect(
      canvas.getByRole("region", { name: "Lunch Flow connection details" }),
    ).toBeVisible();
    await userEvent.type(canvas.getByLabelText("API key"), "secret-token");
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Update API key",
    );
    await userEvent.click(lunchFlowButton);
    await expect(
      canvas.queryByRole("region", { name: "Lunch Flow connection details" }),
    ).not.toBeInTheDocument();
    await userEvent.click(yamlSwitch);
    await expect(yamlSwitch).toHaveAttribute("aria-checked", "false");
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Sources">
      {#snippet sidebarContent()}
        <LedgerSettingsNavigation
          activeId="bank-sync"
          onBack={() => {
            sourceAction = "Back";
          }}
          onNavigate={(destination) => {
            sourceAction = destination;
          }}
          onBankSyncExpandedChange={() => {}}
        />
      {/snippet}
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
          <div class="bc-screen-story__sources-content">
            <SourceConnectionCatalog
              connectedSources={sourceConnectionModels}
              {availableSources}
              expandedSourceId={sourceExpandedId}
              onOpenConnection={(source) => {
                sourceAction = `Open ${source.name}`;
              }}
              onExpandedSourceChange={(source) => {
                sourceExpandedId = source?.id;
              }}
              onConnectionFieldChange={(source, field, value) => {
                sourceFieldValues = {
                  ...sourceFieldValues,
                  [`${source.id}:${field.id}`]: value,
                };
                sourceAction = `Update ${field.label}`;
              }}
              onUpdateConnection={(source) => {
                sourceAction = `Update ${source.name}`;
              }}
              onConnect={(source) => {
                sourceAction = `Connect ${source.name}`;
              }}
            />
          </div>
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
    const lunchFlowButton = canvas.getByRole("button", {
      name: "Open Lunch Flow accounts",
    });
    const otherAccountsButton = canvas.getByRole("button", {
      name: "Open Other Accounts",
    });

    await userEvent.click(lunchFlowButton);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Open Lunch Flow",
    );
    await expect(
      canvas.getByRole("region", { name: "Lunch Flow account details" }),
    ).toBeVisible();
    await userEvent.click(otherAccountsButton);
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Open Other Accounts",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "Sync all connections" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Sync all");
    await userEvent.click(
      canvas.getByRole("button", { name: "Lunch Flow actions" }),
    );
    await userEvent.click(
      within(document.body).getByRole("menuitem", { name: "Sync" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Sync Lunch Flow",
    );
    await userEvent.click(lunchFlowButton);
    await expect(
      canvas.queryByRole("region", { name: "Lunch Flow account details" }),
    ).not.toBeInTheDocument();
    sourceAccountExpandedId = undefined;
    sourceAccountAction = "";
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Accounts">
      {#snippet sidebarContent()}
        <LedgerSettingsNavigation
          activeId="accounts"
          onBack={() => {
            sourceAccountAction = "Back";
          }}
          onNavigate={(destination) => {
            sourceAccountAction = destination;
          }}
          onBankSyncExpandedChange={() => {}}
        />
      {/snippet}
      {#snippet headerActions()}
        <ImportAccountsToolbar
          onSyncAll={() => {
            sourceAccountAction = "Sync all";
          }}
        />
      {/snippet}
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__source-accounts">
          <div class="bc-screen-story__source-accounts-content">
            <SourceAccountGroups
              source={sourceAccountSource}
              otherAccounts={unassignedAccountGroup}
              sourceActions={sourceAccountActions}
              expandedSourceId={sourceAccountExpandedId}
              onOpenSource={(source) => {
                sourceAccountAction = `Open ${source.name}`;
              }}
              onExpandedSourceChange={(source) => {
                sourceAccountExpandedId = source?.id;
              }}
              onOpenOtherAccounts={(group) => {
                sourceAccountAction = `Open ${group.label}`;
              }}
              onSourceAction={(source, action) => {
                sourceAccountAction = `${action.label} ${source.name}`;
              }}
            />
          </div>
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
    await expect(
      canvas.getByText("1", { selector: ".bc-screen-story__rules-count" }),
    ).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "Apply all" }));
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Apply all rules",
    );
    await userEvent.click(canvas.getByRole("button", { name: "Add rule" }));
    await expect(canvas.getByRole("status")).toHaveTextContent("Add rule");
    await userEvent.click(
      canvas.getByRole("switch", { name: "Deactivate Test Rule" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent(
      "Test Rule inactive",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "More actions for Test Rule" }),
    );
    await userEvent.click(
      within(document.body).getByRole("menuitem", { name: "Run…" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Run Test Rule");
    await userEvent.click(
      canvas.getByRole("switch", { name: "Activate Test Rule" }),
    );
    await expect(
      canvas.getByRole("switch", { name: "Deactivate Test Rule" }),
    ).toBeChecked();
    restoreReferenceCapture();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Rules">
      {#snippet titleTrailing()}
        <Badge class="bc-screen-story__rules-count" variant="secondary">1</Badge
        >
      {/snippet}
      {#snippet sidebarContent()}
        <LedgerSettingsNavigation
          activeId="rules"
          onBack={() => {
            ruleAction = "Back";
          }}
          onNavigate={(destination) => {
            ruleAction = destination;
          }}
          onBankSyncExpandedChange={() => {}}
        />
      {/snippet}
      {#snippet headerActions()}
        <RulesToolbar
          canApplyAll={ruleActive}
          onApplyAll={() => {
            ruleAction = "Apply all rules";
          }}
          onAddRule={() => {
            ruleAction = "Add rule";
          }}
        />
      {/snippet}
      <ContentScrollArea>
        <div class="bc-screen-story__page bc-screen-story__rules">
          <RuleList
            rules={[{ ...testRule, active: ruleActive }]}
            actions={testRuleActions}
            onOpenRule={(rule) => {
              ruleAction = `Open ${rule.name}`;
            }}
            onActiveChange={(rule, active) => {
              ruleActive = active;
              ruleAction = `${rule.name} ${active ? "active" : "inactive"}`;
            }}
            onActionSelect={(rule, action) => {
              ruleAction = `${action.label.replace("…", "")} ${rule.name}`;
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
  /*
   * Fava captures are full 1280×900 browser viewports. Keep the fixed screen
   * frame at the Storybook viewport origin instead of inheriting the catalog's
   * normal preview padding, which would crop the candidate on its right and
   * lower edges before Visual Delta can compare it to the reference.
   */
  :global(#storybook-root:has([data-fava-screen-frame])) {
    padding: 0;
  }

  .bc-screen-story__page {
    padding: var(--ui-beancount-space-4);
  }

  .bc-screen-story__page--errors {
    padding: var(--ui-beancount-space-2);
  }

  .bc-screen-story__page--report {
    display: grid;
    gap: calc(var(--ui-beancount-space-4) * 2);
  }

  .bc-screen-story__page--account-report {
    gap: var(--ui-beancount-space-2);
  }

  .bc-screen-story__statement-section {
    display: grid;
    gap: calc(var(--ui-beancount-space-4) * 2);
  }

  :global(.bc-screen-story__editor-content) {
    height: 100%;
  }

  .bc-screen-story__sources {
    padding: var(--ui-beancount-space-6);
  }

  .bc-screen-story__sources-content {
    max-width: 48rem;
    margin-inline: auto;
  }

  .bc-screen-story__source-accounts {
    padding: var(--ui-beancount-space-6);
  }

  .bc-screen-story__source-accounts-content {
    max-width: 48rem;
    margin-inline: auto;
  }

  .bc-screen-story__rules {
    padding: var(--ui-beancount-space-6);
  }

  :global(.bc-screen-story__rules-count) {
    display: inline-flex;
    min-width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
    justify-content: center;
    border-radius: 999px;
    padding: 0 var(--ui-beancount-space-1);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
    font-variant-numeric: tabular-nums;
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
    background-color: transparent;
    padding: 0;
    box-shadow: none;
  }

  :global(.bc-screen-story__page--report .bc-bar-chart__canvas),
  :global(.bc-screen-story__page--report .bc-line-chart__canvas) {
    border: 0;
    border-radius: 0;
    background-color: transparent;
    padding: 0;
    box-shadow: none;
  }

  :global(.bc-screen-story__page--report .bc-chart-panel__toolbar) {
    border-block-end: 0;
    padding-block-end: var(--ui-beancount-space-2);
  }

  :global(.bc-screen-story__breadcrumbs) {
    margin-block-end: var(--ui-beancount-space-2);
  }
</style>
