<script lang="ts">
  import * as ScrollArea from "@stevejuma/ui/shadcn/scroll-area";
  import * as Select from "@stevejuma/ui/shadcn/select";
  import { SegmentedControl } from "@stevejuma/ui/forms";
  import ContentScrollArea from "../layout/ContentScrollArea.svelte";
  import DashboardDonut, {
    type DashboardDonutCategory,
  } from "./DashboardDonut.svelte";
  import DashboardFlow from "./DashboardFlow.svelte";
  import DashboardLine, {
    type DashboardLinePoint,
    type DashboardTrendTone,
  } from "./DashboardLine.svelte";
  import DashboardSection from "./DashboardSection.svelte";
  import DashboardTreeTable from "./DashboardTreeTable.svelte";
  import type { DashboardFlowCategory } from "./dashboard-flow";
  import type { DashboardTreeNode } from "./dashboard-tree-table";

  export type FinancialDashboardOption = {
    value: string;
    label: string;
  };

  export type FinancialDashboardMetric = {
    id: string;
    label: string;
    valueLabel: string;
    /** Use a direction only when the value itself communicates a trend. */
    trend?: "up" | "down";
    tone?: DashboardTrendTone;
    changeLabel?: string;
    changeDescription?: string;
  };

  export type FinancialDashboardOutflow = DashboardDonutCategory & {
    /** A display-ready percentage or relative contribution. */
    shareLabel: string;
  };

  export type FinancialDashboardAccountGroup = {
    id: string;
    title: string;
    nodes: readonly DashboardTreeNode[];
    emptyLabel?: string;
    viewAllLabel?: string;
  };

  export type FinancialDashboardNetWorth = {
    valueLabel: string;
    change: number;
    changeLabel: string;
    changeDescription?: string;
    trendTone?: DashboardTrendTone;
    points: readonly DashboardLinePoint[];
  };

  export type FinancialDashboardSectionId =
    | "cash-flow"
    | "outflows"
    | "balance-sheet"
    | "net-worth";

  /**
   * A display-model dashboard composition. The application supplies already
   * selected, formatted financial data and remains responsible for all data
   * derivation, routing, persistence, and callbacks.
   */
  let {
    eyebrow = "Overview",
    title = "Financial dashboard",
    period,
    periodOptions = [],
    currency,
    currencyOptions = [],
    valuation,
    valuationOptions = [],
    metrics = [],
    inflows = [],
    outflows = [],
    accountGroups = [],
    netWorth,
    valueFormatter = (value) => String(value),
    onPeriodChange,
    onCurrencyChange,
    onValuationChange,
    onSectionOpenChange,
    onFlowCategorySelect,
    onOutflowFocus,
    onOutflowSelect,
    onAccountSelect,
    onAccountGroupSelect,
  }: {
    eyebrow?: string;
    title?: string;
    period?: string;
    periodOptions?: readonly FinancialDashboardOption[];
    currency?: string;
    currencyOptions?: readonly FinancialDashboardOption[];
    valuation?: string;
    valuationOptions?: readonly FinancialDashboardOption[];
    metrics?: readonly FinancialDashboardMetric[];
    inflows?: readonly DashboardFlowCategory[];
    outflows?: readonly FinancialDashboardOutflow[];
    accountGroups?: readonly FinancialDashboardAccountGroup[];
    netWorth?: FinancialDashboardNetWorth;
    valueFormatter?: (value: number) => string;
    onPeriodChange?: (value: string) => void;
    onCurrencyChange?: (value: string) => void;
    onValuationChange?: (value: string) => void;
    onSectionOpenChange?: (
      section: FinancialDashboardSectionId,
      open: boolean,
    ) => void;
    onFlowCategorySelect?: (category: DashboardFlowCategory) => void;
    onOutflowFocus?: (category: DashboardDonutCategory) => void;
    onOutflowSelect?: (category: FinancialDashboardOutflow) => void;
    onAccountSelect?: (
      node: DashboardTreeNode,
      group: FinancialDashboardAccountGroup,
    ) => void;
    onAccountGroupSelect?: (group: FinancialDashboardAccountGroup) => void;
  } = $props();

  let sectionOpen = $state<Record<FinancialDashboardSectionId, boolean>>({
    "cash-flow": true,
    outflows: true,
    "balance-sheet": true,
    "net-worth": true,
  });

  const valuationLabels = $derived(
    Object.fromEntries(
      valuationOptions.map((option) => [option.value, option.label]),
    ),
  );

  function optionLabel(
    value: string | undefined,
    options: readonly FinancialDashboardOption[],
  ): string {
    return (
      options.find((option) => option.value === value)?.label ?? value ?? ""
    );
  }

  function setSectionOpen(section: FinancialDashboardSectionId, open: boolean) {
    sectionOpen = { ...sectionOpen, [section]: open };
    onSectionOpenChange?.(section, open);
  }
</script>

<ContentScrollArea contentClass="scroll-container">
  <main class="mx-auto w-full max-w-[1440px] px-4 pt-5 pb-7 md:px-6 lg:px-8">
    <header
      class="border-border/80 mb-6 flex flex-col gap-4 border-b pb-5 lg:flex-row lg:items-center lg:justify-between"
    >
      <div>
        <p
          class="text-muted-foreground text-xs font-semibold tracking-[0.16em] uppercase"
        >
          {eyebrow}
        </p>
        <h1 class="text-foreground mt-1 text-2xl font-semibold tracking-tight">
          {title}
        </h1>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        {#if periodOptions.length && period}
          <Select.Root
            type="single"
            value={period}
            onValueChange={(value) => {
              if (typeof value === "string") onPeriodChange?.(value);
            }}
          >
            <Select.Trigger
              class="h-8 w-36 text-xs font-medium"
              aria-label="Dashboard period"
            >
              {optionLabel(period, periodOptions)}
            </Select.Trigger>
            <Select.Content aria-label="Dashboard period options">
              <Select.Group>
                {#each periodOptions as option (option.value)}
                  <Select.Item value={option.value} label={option.label}>
                    {option.label}
                  </Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        {/if}

        {#if currencyOptions.length > 1 && currency}
          <Select.Root
            type="single"
            value={currency}
            onValueChange={(value) => {
              if (typeof value === "string") onCurrencyChange?.(value);
            }}
          >
            <Select.Trigger
              class="h-8 w-24 text-xs font-medium"
              aria-label="Display currency"
            >
              {optionLabel(currency, currencyOptions)}
            </Select.Trigger>
            <Select.Content aria-label="Display currency options">
              <Select.Group>
                {#each currencyOptions as option (option.value)}
                  <Select.Item value={option.value} label={option.label}>
                    {option.label}
                  </Select.Item>
                {/each}
              </Select.Group>
            </Select.Content>
          </Select.Root>
        {:else if currency}
          <span
            class="border-border bg-muted/55 text-foreground rounded-md border px-3 py-2 font-mono text-xs"
          >
            {currency}
          </span>
        {/if}

        {#if valuation && valuationOptions.length >= 2 && valuationOptions.length <= 3}
          <SegmentedControl
            value={valuation}
            options={valuationOptions.map((option) => option.value)}
            labels={valuationLabels}
            ariaLabel="Dashboard valuation"
            onChange={(value) => onValuationChange?.(value)}
          />
        {/if}
      </div>
    </header>

    <section
      class="border-border/80 bg-border/80 mb-6 grid gap-px overflow-hidden rounded-xl border sm:grid-cols-2 xl:grid-cols-4"
      aria-label="Period summary"
    >
      {#each metrics as metric (metric.id)}
        <article class="bg-card px-5 py-4">
          <p
            class="text-muted-foreground text-xs font-semibold tracking-[0.12em] uppercase"
          >
            {metric.label}
          </p>
          <p
            class:positive={metric.tone === "positive"}
            class:negative={metric.tone === "negative"}
            class="text-foreground mt-2 flex items-center gap-1.5 font-mono text-xl font-semibold tabular-nums"
          >
            {#if metric.trend === "up"}
              <span aria-hidden="true">↗</span>
            {:else if metric.trend === "down"}
              <span aria-hidden="true">↘</span>
            {/if}
            {metric.valueLabel}
          </p>
          {#if metric.changeLabel}
            <p
              class:positive={metric.tone === "positive"}
              class:negative={metric.tone === "negative"}
              class="mt-1 font-mono text-xs tabular-nums"
            >
              {metric.changeLabel}
              {#if metric.changeDescription}
                <span class="text-muted-foreground font-sans">
                  {metric.changeDescription}
                </span>
              {/if}
            </p>
          {/if}
        </article>
      {:else}
        <p class="bg-card px-5 py-4 text-sm text-muted-foreground">
          No summary is available for this period.
        </p>
      {/each}
    </section>

    <div class="grid gap-6">
      <DashboardSection
        id="financial-dashboard-cash-flow"
        title="Cash flow"
        eyebrow={optionLabel(period, periodOptions)}
        open={sectionOpen["cash-flow"]}
        onOpenChange={(open) => setSectionOpen("cash-flow", open)}
      >
        <DashboardFlow
          {inflows}
          {outflows}
          {valueFormatter}
          onCategorySelect={(category) => onFlowCategorySelect?.(category)}
        />
      </DashboardSection>

      <DashboardSection
        id="financial-dashboard-outflows"
        title="Outflows"
        eyebrow="Where money went"
        open={sectionOpen.outflows}
        onOpenChange={(open) => setSectionOpen("outflows", open)}
      >
        <div
          class="divide-border/80 grid divide-y lg:grid-cols-[minmax(18rem,0.8fr)_minmax(0,1.2fr)] lg:divide-x lg:divide-y-0"
        >
          <DashboardDonut
            categories={outflows}
            {valueFormatter}
            onCategoryFocus={(category) => onOutflowFocus?.(category)}
          />
          <ScrollArea.Root
            orientation="horizontal"
            class="w-full max-w-full min-w-0"
          >
            <div
              class="p-4 sm:p-5 lg:min-w-[32rem]"
              data-dashboard-outflow-table
            >
              <div
                class="border-border/80 text-muted-foreground mb-2 grid grid-cols-[minmax(0,1fr)_auto] gap-x-3 border-b px-2 py-2 text-xs font-semibold tracking-[0.12em] uppercase lg:grid-cols-[minmax(0,1fr)_5.5rem_9rem] lg:gap-4"
              >
                <span>Category</span>
                <span class="hidden text-right lg:block">Share</span>
                <span class="text-right">Value</span>
              </div>
              {#each outflows as category (category.id)}
                <button
                  type="button"
                  class="hover:bg-muted/65 focus-visible:ring-ring grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-3 gap-y-1 rounded-md px-2 py-2.5 text-left text-sm transition-colors focus-visible:ring-1 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-70 lg:grid-cols-[minmax(0,1fr)_5.5rem_9rem] lg:gap-4"
                  disabled={!onOutflowSelect}
                  onclick={() => onOutflowSelect?.(category)}
                >
                  <span
                    class="col-span-2 flex min-w-0 items-center gap-2 lg:col-span-1"
                  >
                    <span
                      class="size-2.5 shrink-0 rounded-full"
                      style={`background: ${category.color}`}
                      aria-hidden="true"
                    ></span>
                    <span class="text-foreground font-medium break-words">
                      {category.label}
                    </span>
                  </span>
                  <span
                    class="text-muted-foreground font-mono text-xs tabular-nums lg:text-right"
                  >
                    <span class="lg:hidden">Share </span>{category.shareLabel}
                  </span>
                  <span
                    class="text-foreground text-right font-mono text-sm tabular-nums"
                  >
                    {category.valueLabel ?? valueFormatter(category.value)}
                  </span>
                </button>
              {:else}
                <p class="px-2 py-6 text-sm text-muted-foreground">
                  No outflows match this period.
                </p>
              {/each}
            </div>
          </ScrollArea.Root>
        </div>
      </DashboardSection>

      <DashboardSection
        id="financial-dashboard-balance-sheet"
        title="Balance sheet"
        eyebrow="Current position"
        open={sectionOpen["balance-sheet"]}
        onOpenChange={(open) => setSectionOpen("balance-sheet", open)}
      >
        <div class="grid gap-8 p-4 sm:p-6">
          {#each accountGroups as group (group.id)}
            <DashboardTreeTable
              nodes={group.nodes}
              title={group.title}
              emptyLabel={group.emptyLabel}
              viewAllLabel={group.viewAllLabel}
              {valueFormatter}
              onNodeSelect={(node) => onAccountSelect?.(node, group)}
              onViewAll={onAccountGroupSelect
                ? () => onAccountGroupSelect(group)
                : undefined}
            />
          {:else}
            <p class="text-sm text-muted-foreground">
              No balance-sheet accounts match this period.
            </p>
          {/each}
        </div>
      </DashboardSection>

      <DashboardSection
        id="financial-dashboard-net-worth"
        title="Net worth"
        eyebrow="Trend"
        open={sectionOpen["net-worth"]}
        onOpenChange={(open) => setSectionOpen("net-worth", open)}
      >
        {#if netWorth}
          <div
            class="border-border/80 border-b px-5 py-4 sm:flex sm:items-end sm:justify-between"
          >
            <div>
              <p
                class="text-foreground font-mono text-2xl font-semibold tabular-nums"
              >
                {netWorth.valueLabel}
              </p>
            </div>
            <p
              class:positive={netWorth.trendTone === "positive"}
              class:negative={netWorth.trendTone === "negative"}
              class="mt-2 font-mono text-sm tabular-nums sm:mt-0 sm:text-right"
            >
              {netWorth.changeLabel}
              {#if netWorth.changeDescription}
                <span class="text-muted-foreground block font-sans text-xs">
                  {netWorth.changeDescription}
                </span>
              {/if}
            </p>
          </div>
          <DashboardLine
            points={netWorth.points}
            change={netWorth.change}
            trendTone={netWorth.trendTone}
            {valueFormatter}
          />
        {:else}
          <p class="text-muted-foreground p-5 text-sm">
            No net-worth trend is available for this period.
          </p>
        {/if}
      </DashboardSection>
    </div>
  </main>
</ContentScrollArea>

<style>
  .positive {
    color: var(--success-foreground);
  }

  .negative {
    color: var(--destructive);
  }
</style>
