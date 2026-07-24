<script module lang="ts">
  export type {
    DashboardTreeContribution,
    DashboardTreeNode,
  } from "./dashboard-tree-table";
</script>

<script lang="ts">
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import * as ScrollArea from "@stevejuma/ui/shadcn/scroll-area";
  import DashboardTreeRow from "./DashboardTreeRow.svelte";
  import {
    dashboardTreeCollapsibleIds,
    dashboardTreeContributions,
    dashboardTreeTotal,
    type DashboardTreeNode,
  } from "./dashboard-tree-table";

  let {
    nodes = [],
    title,
    ariaLabel = `${title} account hierarchy`,
    emptyLabel = "No accounts match this period.",
    viewAllLabel = "View account",
    valueFormatter = (value) => String(value),
    onNodeSelect = () => {},
    onViewAll,
  }: {
    nodes?: readonly DashboardTreeNode[];
    title: string;
    ariaLabel?: string;
    emptyLabel?: string;
    viewAllLabel?: string;
    valueFormatter?: (value: number) => string;
    /** Report an account/category activation without owning application routes. */
    onNodeSelect?: (node: DashboardTreeNode) => void;
    /** Report an explicit request to view the complete account group. */
    onViewAll?: () => void;
  } = $props();

  const accountColumn = "16rem";
  const weightMeterColumn = "4.5rem";
  const weightColumn = "5.5rem";
  const gridTemplate = `${accountColumn} ${weightMeterColumn} ${weightColumn} minmax(10rem, 1fr)`;

  let collapsed = $state<Set<string>>(new Set());
  const collapsibleIds = $derived(dashboardTreeCollapsibleIds(nodes));
  const allCollapsed = $derived(
    collapsibleIds.length > 0 &&
      collapsibleIds.every((id) => collapsed.has(id)),
  );
  const total = $derived(dashboardTreeTotal(nodes));
  const contributions = $derived(dashboardTreeContributions(nodes));

  function toggle(id: string) {
    const next = new Set(collapsed);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    collapsed = next;
  }

  function toggleAll() {
    collapsed = allCollapsed ? new Set() : new Set(collapsibleIds);
  }
</script>

<section
  class="bc-dashboard-tree-table"
  aria-label={ariaLabel}
  data-dashboard-tree-table
>
  <div class="bc-dashboard-tree-table__heading">
    <h2 class="bc-dashboard-tree-table__title">
      {title}
      <span class="bc-dashboard-tree-table__total"
        >· {total ? valueFormatter(total) : "—"}</span
      >
    </h2>
    {#if onViewAll}
      <button
        type="button"
        class="bc-dashboard-tree-table__view-all"
        onclick={onViewAll}
      >
        {viewAllLabel}
      </button>
    {/if}
  </div>

  {#if nodes.length}
    <div
      class="bc-dashboard-tree-table__contribution-bar"
      role="img"
      aria-label={`${title} category contributions`}
      data-dashboard-contribution-bar
    >
      {#each contributions as contribution (contribution.id)}
        <span
          class="bc-dashboard-tree-table__contribution-segment"
          style={`width: ${contribution.percentage}%; background: ${contribution.color}`}
          title={`${contribution.label}: ${valueFormatter(contribution.value)}`}
        ></span>
      {/each}
    </div>
    <div
      class="bc-dashboard-tree-table__contribution-legend"
      data-dashboard-contribution-legend
    >
      {#each contributions as contribution (contribution.id)}
        <span class="bc-dashboard-tree-table__contribution">
          <span
            class="bc-dashboard-tree-table__contribution-marker"
            style={`background: ${contribution.color}`}
            aria-hidden="true"
          ></span>
          <span class="bc-dashboard-tree-table__contribution-label"
            >{contribution.label}</span
          >
          <span class="bc-dashboard-tree-table__contribution-value"
            >{contribution.percentage.toFixed(1)}%</span
          >
          <span class="bc-dashboard-tree-table__contribution-value"
            >{valueFormatter(contribution.value)}</span
          >
        </span>
      {/each}
    </div>

    <ScrollArea.Root
      orientation="horizontal"
      class="bc-dashboard-tree-table__scroll"
    >
      <ol class="bc-dashboard-tree-table__rows" data-dashboard-tree-rows>
        <li
          class="bc-dashboard-tree-table__row-header"
          style={`grid-template-columns: ${gridTemplate}`}
        >
          <span class="bc-dashboard-tree-table__account-header">
            {#if collapsibleIds.length}
              <button
                type="button"
                class="bc-dashboard-tree-table__toggle-all"
                aria-label={allCollapsed
                  ? "Expand all accounts"
                  : "Collapse all accounts"}
                aria-pressed={allCollapsed}
                onclick={toggleAll}
              >
                <ChevronsUpDown
                  class="bc-dashboard-tree-table__toggle-icon"
                  aria-hidden="true"
                />
              </button>
            {/if}
            Account
          </span>
          <span aria-hidden="true"></span>
          <span class="bc-dashboard-tree-table__value-header">Weight</span>
          <span class="bc-dashboard-tree-table__value-header">Value</span>
        </li>
        {#each nodes as node (node.id)}
          <DashboardTreeRow
            {node}
            {total}
            {gridTemplate}
            {collapsed}
            {valueFormatter}
            {onNodeSelect}
            onToggle={toggle}
          />
        {/each}
      </ol>
    </ScrollArea.Root>
  {:else}
    <p class="bc-dashboard-tree-table__empty">
      {emptyLabel}
    </p>
  {/if}
</section>

<style>
  .bc-dashboard-tree-table {
    inline-size: 100%;
    min-inline-size: 0;
  }
  .bc-dashboard-tree-table__heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: var(--ui-beancount-space-4);
  }
  .bc-dashboard-tree-table__title {
    color: var(--ui-beancount-foreground);
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }
  .bc-dashboard-tree-table__total {
    color: var(--ui-beancount-muted-foreground);
    font-family: var(--font-mono);
    font-size: 1rem;
    font-weight: 500;
  }
  .bc-dashboard-tree-table__view-all {
    border-radius: calc(var(--ui-beancount-radius-panel) / 2);
    color: var(--ui-beancount-accent);
    font-size: 0.75rem;
    font-weight: 500;
    outline: none;
  }
  .bc-dashboard-tree-table__view-all:hover {
    text-decoration: underline;
  }
  .bc-dashboard-tree-table__view-all:focus-visible,
  .bc-dashboard-tree-table__toggle-all:focus-visible {
    outline: 1px solid var(--ui-beancount-focus-ring);
    outline-offset: 1px;
  }
  .bc-dashboard-tree-table__contribution-bar {
    display: flex;
    block-size: 0.375rem;
    inline-size: 100%;
    margin-block-start: var(--ui-beancount-space-3);
    overflow: hidden;
    border-radius: 999px;
    background: var(--ui-beancount-surface-muted);
  }
  .bc-dashboard-tree-table__contribution-segment {
    block-size: 100%;
  }
  .bc-dashboard-tree-table__contribution-segment:first-child {
    border-radius: 999px 0 0 999px;
  }
  .bc-dashboard-tree-table__contribution-segment:last-child {
    border-radius: 0 999px 999px 0;
  }
  .bc-dashboard-tree-table__contribution-legend {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
    gap: var(--ui-beancount-space-2) calc(var(--ui-beancount-space-3) * 2);
    margin-block-start: var(--ui-beancount-space-4);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
  }
  .bc-dashboard-tree-table__contribution {
    display: grid;
    min-inline-size: 0;
    grid-template-columns: auto minmax(0, 1fr) max-content max-content;
    align-items: baseline;
    column-gap: var(--ui-beancount-space-2);
  }
  .bc-dashboard-tree-table__contribution-marker {
    inline-size: 0.625rem;
    block-size: 0.625rem;
    flex-shrink: 0;
    align-self: start;
    margin-block-start: var(--ui-beancount-space-1);
    border-radius: 999px;
  }
  .bc-dashboard-tree-table__contribution-label {
    min-inline-size: 0;
    line-height: 1.25rem;
    overflow-wrap: break-word;
  }
  .bc-dashboard-tree-table__contribution-value {
    color: var(--ui-beancount-foreground);
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }
  :global(.bc-dashboard-tree-table__scroll) {
    inline-size: 100%;
    max-inline-size: 100%;
    min-inline-size: 0;
    margin-block-start: var(--ui-beancount-space-4);
    border-radius: var(--ui-beancount-radius-panel);
  }
  .bc-dashboard-tree-table__rows {
    min-inline-size: 45rem;
    overflow: hidden;
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }
  .bc-dashboard-tree-table__row-header {
    display: grid;
    min-block-size: 2.5rem;
    align-items: center;
    color: var(--ui-beancount-muted-foreground);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }
  .bc-dashboard-tree-table__account-header {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-4);
  }
  .bc-dashboard-tree-table__toggle-all {
    display: grid;
    inline-size: 1rem;
    block-size: 1rem;
    flex-shrink: 0;
    place-items: center;
    border-radius: calc(var(--ui-beancount-radius-panel) / 2);
    color: var(--ui-beancount-muted-foreground);
    outline: none;
  }
  .bc-dashboard-tree-table__toggle-all:hover {
    color: var(--ui-beancount-foreground);
    background: var(--ui-beancount-surface);
  }
  :global(.bc-dashboard-tree-table__toggle-icon) {
    inline-size: 0.75rem;
    block-size: 0.75rem;
  }
  .bc-dashboard-tree-table__value-header {
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-4);
    text-align: end;
  }
  .bc-dashboard-tree-table__empty {
    display: grid;
    min-block-size: 10rem;
    place-items: center;
    margin-block-start: var(--ui-beancount-space-4);
    border: 1px dashed var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
  }
</style>
