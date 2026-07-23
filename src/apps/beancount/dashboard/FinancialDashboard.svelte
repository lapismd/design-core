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
  <section class="bc-financial-dashboard" aria-label={title}>
    <header class="bc-financial-dashboard__header">
      <div>
        <p class="bc-financial-dashboard__eyebrow">
          {eyebrow}
        </p>
        <h1 class="bc-financial-dashboard__title">
          {title}
        </h1>
      </div>
      <div class="bc-financial-dashboard__controls">
        {#if periodOptions.length && period}
          <Select.Root
            type="single"
            value={period}
            onValueChange={(value) => {
              if (typeof value === "string") onPeriodChange?.(value);
            }}
          >
            <Select.Trigger
              class="bc-financial-dashboard__select-trigger bc-financial-dashboard__select-trigger--period"
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
              class="bc-financial-dashboard__select-trigger bc-financial-dashboard__select-trigger--currency"
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
          <span class="bc-financial-dashboard__currency">
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
      class="bc-financial-dashboard__metrics"
      aria-label="Period summary"
    >
      {#each metrics as metric (metric.id)}
        <article class="bc-financial-dashboard__metric">
          <p class="bc-financial-dashboard__metric-label">
            {metric.label}
          </p>
          <p
            class:bc-financial-dashboard__positive={metric.tone === "positive"}
            class:bc-financial-dashboard__negative={metric.tone === "negative"}
            class="bc-financial-dashboard__metric-value"
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
              class:bc-financial-dashboard__positive={metric.tone ===
                "positive"}
              class:bc-financial-dashboard__negative={metric.tone ===
                "negative"}
              class="bc-financial-dashboard__metric-change"
            >
              {metric.changeLabel}
              {#if metric.changeDescription}
                <span class="bc-financial-dashboard__metric-change-description">
                  {metric.changeDescription}
                </span>
              {/if}
            </p>
          {/if}
        </article>
      {:else}
        <p class="bc-financial-dashboard__metric-empty">
          No summary is available for this period.
        </p>
      {/each}
    </section>

    <div class="bc-financial-dashboard__sections">
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
        <div class="bc-financial-dashboard__outflow-layout">
          <DashboardDonut
            categories={outflows}
            {valueFormatter}
            onCategoryFocus={(category) => onOutflowFocus?.(category)}
          />
          <ScrollArea.Root
            orientation="horizontal"
            class="bc-financial-dashboard__outflow-scroll"
          >
            <div
              class="bc-financial-dashboard__outflow-table"
              data-dashboard-outflow-table
            >
              <div class="bc-financial-dashboard__outflow-header">
                <span>Category</span>
                <span class="bc-financial-dashboard__outflow-share-header"
                  >Share</span
                >
                <span class="bc-financial-dashboard__outflow-value-header"
                  >Value</span
                >
              </div>
              {#each outflows as category (category.id)}
                <button
                  type="button"
                  class="bc-financial-dashboard__outflow-row"
                  disabled={!onOutflowSelect}
                  onclick={() => onOutflowSelect?.(category)}
                >
                  <span class="bc-financial-dashboard__outflow-name">
                    <span
                      class="bc-financial-dashboard__outflow-marker"
                      style={`background: ${category.color}`}
                      aria-hidden="true"
                    ></span>
                    <span class="bc-financial-dashboard__outflow-label">
                      {category.label}
                    </span>
                  </span>
                  <span class="bc-financial-dashboard__outflow-share">
                    <span class="bc-financial-dashboard__outflow-share-label"
                      >Share
                    </span>{category.shareLabel}
                  </span>
                  <span class="bc-financial-dashboard__outflow-value">
                    {category.valueLabel ?? valueFormatter(category.value)}
                  </span>
                </button>
              {:else}
                <p class="bc-financial-dashboard__outflow-empty">
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
        <div class="bc-financial-dashboard__balance-sheet">
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
            <p class="bc-financial-dashboard__balance-sheet-empty">
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
          <div class="bc-financial-dashboard__net-worth-header">
            <div>
              <p class="bc-financial-dashboard__net-worth-value">
                {netWorth.valueLabel}
              </p>
            </div>
            <p
              class:bc-financial-dashboard__positive={netWorth.trendTone ===
                "positive"}
              class:bc-financial-dashboard__negative={netWorth.trendTone ===
                "negative"}
              class="bc-financial-dashboard__net-worth-change"
            >
              {netWorth.changeLabel}
              {#if netWorth.changeDescription}
                <span class="bc-financial-dashboard__net-worth-description">
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
          <p class="bc-financial-dashboard__net-worth-empty">
            No net-worth trend is available for this period.
          </p>
        {/if}
      </DashboardSection>
    </div>
  </section>
</ContentScrollArea>

<style>
  .bc-financial-dashboard {
    inline-size: 100%;
    max-inline-size: 90rem;
    margin-inline: auto;
    padding: var(--ui-beancount-space-5) var(--ui-beancount-space-4) 1.75rem;
  }
  .bc-financial-dashboard__header {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-4);
    margin-block-end: calc(var(--ui-beancount-space-3) * 2);
    padding-block-end: var(--ui-beancount-space-5);
    border-block-end: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
  }
  .bc-financial-dashboard__eyebrow,
  .bc-financial-dashboard__metric-label {
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
  }
  .bc-financial-dashboard__title {
    margin-block-start: var(--ui-beancount-space-1);
    color: var(--ui-beancount-foreground);
    font-size: 1.5rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .bc-financial-dashboard__controls {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }
  :global(.bc-financial-dashboard__select-trigger) {
    block-size: var(--ui-beancount-compact-control-height);
    color: var(--ui-beancount-foreground);
    font-size: 0.75rem;
    font-weight: 500;
  }
  :global(.bc-financial-dashboard__select-trigger--period) {
    inline-size: 9rem;
  }
  :global(.bc-financial-dashboard__select-trigger--currency) {
    inline-size: 6rem;
  }
  .bc-financial-dashboard__currency {
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-3);
    border: 1px solid var(--ui-beancount-border);
    border-radius: calc(var(--ui-beancount-radius-panel) / 1.5);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 55%,
      transparent
    );
    color: var(--ui-beancount-foreground);
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }
  .bc-financial-dashboard__metrics {
    display: grid;
    gap: 1px;
    margin-block-end: calc(var(--ui-beancount-space-3) * 2);
    overflow: hidden;
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background: color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
  }
  .bc-financial-dashboard__metric,
  .bc-financial-dashboard__metric-empty {
    padding: var(--ui-beancount-space-4) var(--ui-beancount-space-5);
    background: var(--ui-beancount-surface);
  }
  .bc-financial-dashboard__metric-label {
    letter-spacing: 0.12em;
  }
  .bc-financial-dashboard__metric-value {
    display: flex;
    align-items: center;
    gap: calc(var(--ui-beancount-space-1) + 2px);
    margin-block-start: var(--ui-beancount-space-2);
    color: var(--ui-beancount-foreground);
    font-family: var(--font-mono);
    font-size: 1.25rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .bc-financial-dashboard__metric-change {
    margin-block-start: var(--ui-beancount-space-1);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }
  .bc-financial-dashboard__metric-change-description {
    color: var(--ui-beancount-muted-foreground);
    font-family: var(--font-sans);
  }
  .bc-financial-dashboard__metric-empty,
  .bc-financial-dashboard__outflow-empty,
  .bc-financial-dashboard__balance-sheet-empty,
  .bc-financial-dashboard__net-worth-empty {
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
  }
  .bc-financial-dashboard__sections {
    display: grid;
    gap: calc(var(--ui-beancount-space-3) * 2);
  }
  .bc-financial-dashboard__outflow-layout {
    display: grid;
  }
  .bc-financial-dashboard__outflow-layout > :not(:first-child) {
    border-block-start: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
  }
  :global(.bc-financial-dashboard__outflow-scroll) {
    inline-size: 100%;
    max-inline-size: 100%;
    min-inline-size: 0;
  }
  .bc-financial-dashboard__outflow-table {
    padding: var(--ui-beancount-space-4);
  }
  .bc-financial-dashboard__outflow-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    column-gap: var(--ui-beancount-space-3);
    margin-block-end: var(--ui-beancount-space-2);
    padding: var(--ui-beancount-space-2);
    border-block-end: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .bc-financial-dashboard__outflow-share-header {
    display: none;
    text-align: end;
  }
  .bc-financial-dashboard__outflow-value-header,
  .bc-financial-dashboard__outflow-value {
    text-align: end;
  }
  .bc-financial-dashboard__outflow-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    column-gap: var(--ui-beancount-space-3);
    row-gap: var(--ui-beancount-space-1);
    inline-size: 100%;
    padding: calc(var(--ui-beancount-space-2) + 2px) var(--ui-beancount-space-2);
    border-radius: calc(var(--ui-beancount-radius-panel) / 1.5);
    color: var(--ui-beancount-foreground);
    font-size: 0.875rem;
    outline: none;
    text-align: start;
    transition: background-color 150ms ease;
  }
  .bc-financial-dashboard__outflow-row:hover {
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }
  .bc-financial-dashboard__outflow-row:focus-visible {
    outline: 1px solid var(--ui-beancount-focus-ring);
    outline-offset: 1px;
  }
  .bc-financial-dashboard__outflow-row:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }
  .bc-financial-dashboard__outflow-name {
    display: flex;
    grid-column: span 2;
    min-inline-size: 0;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }
  .bc-financial-dashboard__outflow-marker {
    inline-size: 0.625rem;
    block-size: 0.625rem;
    flex-shrink: 0;
    border-radius: 999px;
  }
  .bc-financial-dashboard__outflow-label {
    color: var(--ui-beancount-foreground);
    font-weight: 500;
    overflow-wrap: break-word;
  }
  .bc-financial-dashboard__outflow-share {
    color: var(--ui-beancount-muted-foreground);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }
  .bc-financial-dashboard__outflow-value {
    color: var(--ui-beancount-foreground);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }
  .bc-financial-dashboard__outflow-empty {
    padding: var(--ui-beancount-space-5) var(--ui-beancount-space-2);
  }
  .bc-financial-dashboard__balance-sheet {
    display: grid;
    gap: calc(var(--ui-beancount-space-4) * 2);
    padding: var(--ui-beancount-space-4);
  }
  .bc-financial-dashboard__net-worth-header {
    padding: var(--ui-beancount-space-4) var(--ui-beancount-space-5);
    border-block-end: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
  }
  .bc-financial-dashboard__net-worth-value {
    color: var(--ui-beancount-foreground);
    font-family: var(--font-mono);
    font-size: 1.5rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .bc-financial-dashboard__net-worth-change {
    margin-block-start: var(--ui-beancount-space-2);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }
  .bc-financial-dashboard__net-worth-description {
    display: block;
    color: var(--ui-beancount-muted-foreground);
    font-family: var(--font-sans);
    font-size: 0.75rem;
  }
  .bc-financial-dashboard__net-worth-empty {
    padding: var(--ui-beancount-space-5);
  }
  .bc-financial-dashboard__positive {
    color: var(--ui-beancount-positive);
  }
  .bc-financial-dashboard__negative {
    color: var(--ui-beancount-negative);
  }

  @media (min-width: 40rem) {
    .bc-financial-dashboard__metrics {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
    .bc-financial-dashboard__outflow-table {
      padding: var(--ui-beancount-space-5);
    }
    .bc-financial-dashboard__balance-sheet {
      padding: calc(var(--ui-beancount-space-3) * 2);
    }
    .bc-financial-dashboard__net-worth-header {
      display: flex;
      align-items: end;
      justify-content: space-between;
    }
    .bc-financial-dashboard__net-worth-change {
      margin-block-start: 0;
      text-align: end;
    }
  }

  @media (min-width: 48rem) {
    .bc-financial-dashboard {
      padding-inline: calc(var(--ui-beancount-space-3) * 2);
    }
  }

  @media (min-width: 64rem) {
    .bc-financial-dashboard {
      padding-inline: calc(var(--ui-beancount-space-4) * 2);
    }
    .bc-financial-dashboard__header {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .bc-financial-dashboard__outflow-layout {
      grid-template-columns: minmax(18rem, 0.8fr) minmax(0, 1.2fr);
    }
    .bc-financial-dashboard__outflow-layout > :not(:first-child) {
      border-block-start: 0;
      border-inline-start: 1px solid
        color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    }
    .bc-financial-dashboard__outflow-table {
      min-inline-size: 32rem;
    }
    .bc-financial-dashboard__outflow-header,
    .bc-financial-dashboard__outflow-row {
      grid-template-columns: minmax(0, 1fr) 5.5rem 9rem;
      column-gap: var(--ui-beancount-space-4);
    }
    .bc-financial-dashboard__outflow-share-header {
      display: block;
    }
    .bc-financial-dashboard__outflow-name {
      grid-column: span 1;
    }
    .bc-financial-dashboard__outflow-share {
      text-align: end;
    }
    .bc-financial-dashboard__outflow-share-label {
      display: none;
    }
  }

  @media (min-width: 76rem) {
    .bc-financial-dashboard__metrics {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
</style>
