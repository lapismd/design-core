<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect } from "storybook/test";
  import ScreenFrame from "./ScreenFrame.svelte";
  import { visualDeltaForScreen } from "./visual-delta.js";
  import FinancialDashboard from "../dashboard/FinancialDashboard.svelte";
  import LedgerActivityTable from "../tables/LedgerActivityTable.svelte";
  import StatementSummaryTreeTable from "../tables/StatementSummaryTreeTable.svelte";
  import QueryResultsTable from "../tables/QueryResultsTable.svelte";
  import IngestionReviewTable from "../tables/IngestionReviewTable.svelte";
  import ValidationErrorTable from "../feedback/ValidationErrorTable.svelte";
  import ContentScrollArea from "../layout/ContentScrollArea.svelte";
  import {
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
    { id: "income", label: "Income", valueLabel: "£3,520.00" },
    { id: "outflows", label: "Outflows", valueLabel: "£2,040.00" },
    {
      id: "cash-flow",
      label: "Net cash flow",
      valueLabel: "£1,480.00",
      trend: "up" as const,
      tone: "positive" as const,
    },
  ];
</script>

<Story
  name="Editor"
  parameters={{ visualDelta: visualDeltaForScreen("editor") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Editor")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Editor">
      <ContentScrollArea>
        <div class="text-muted-foreground p-6 font-mono text-sm">
          <p class="text-foreground mb-2 font-sans text-base font-medium">
            Beancount editor
          </p>
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
          onPeriodChange={() => {}}
        />
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Journal"
  parameters={{ visualDelta: visualDeltaForScreen("journal") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Groceries")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Journal">
      <ContentScrollArea>
        <div class="p-4">
          <LedgerActivityTable groups={journalGroups} selectable={false} />
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Income statement"
  parameters={{ visualDelta: visualDeltaForScreen("income-statement") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Expenses")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Income statement">
      <ContentScrollArea>
        <div class="p-4">
          <StatementSummaryTreeTable
            title="Income statement"
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
  name="Balance sheet"
  parameters={{ visualDelta: visualDeltaForScreen("balance-sheet") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Expenses")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Balance sheet">
      <ContentScrollArea>
        <div class="p-4">
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
        <div class="p-4">
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
        <div class="space-y-4 p-4">
          <h2 class="text-lg font-medium">Assets:Checking</h2>
          <LedgerActivityTable groups={journalGroups} selectable={false} />
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>

<Story
  name="Holdings"
  parameters={{ visualDelta: visualDeltaForScreen("holdings") }}
  play={async ({ canvas }) => {
    await expect(canvas.getByText("Holdings")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Holdings">
      <ContentScrollArea>
        <div class="text-muted-foreground p-6 text-sm">
          <p class="text-foreground mb-2 text-base font-medium">Holdings</p>
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
    await expect(canvas.getByText("Statistics")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Statistics">
      <ContentScrollArea>
        <div class="text-muted-foreground p-6 text-sm">
          <p class="text-foreground mb-2 text-base font-medium">Statistics</p>
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
        <div class="p-4">
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
        <div class="p-4">
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
        <div class="p-4">
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
    await expect(canvas.getByText("Sources")).toBeVisible();
  }}
>
  {#snippet template()}
    <ScreenFrame pageTitle="Sources">
      <ContentScrollArea>
        <div class="text-muted-foreground p-6 text-sm">
          <p class="text-foreground mb-2 text-base font-medium">Sources</p>
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
        <div class="text-muted-foreground p-6 text-sm">
          <p class="text-foreground mb-2 text-base font-medium">
            Import accounts
          </p>
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
        <div class="text-muted-foreground p-6 text-sm">
          <p class="text-foreground mb-2 text-base font-medium">Rules</p>
          <p>Rules settings remain Fava-owned for now.</p>
        </div>
      </ContentScrollArea>
    </ScreenFrame>
  {/snippet}
</Story>
