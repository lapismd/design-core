<script lang="ts">
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import StatementSummaryTreeRow from "./StatementSummaryTreeRow.svelte";

  export type StatementSummaryColumn = {
    id: string;
    label: string;
    title?: string;
  };

  export type StatementSummaryOtherValue = {
    label: string;
    value: string;
    title?: string;
  };

  export type StatementSummaryTreeNode = {
    id: string;
    label: string;
    values: Readonly<Record<string, string | undefined>>;
    weight?: string;
    otherValues?: readonly StatementSummaryOtherValue[];
    href?: string;
    color?: string;
    children?: readonly StatementSummaryTreeNode[];
  };

  export type StatementSummaryContribution = {
    id: string;
    label: string;
    percentage: number;
    amount: string;
    color: string;
  };

  let {
    title,
    total,
    href,
    nodes,
    columns,
    contributions = [],
    ariaLabel = `${title} account summary`,
    onNavigate,
  }: {
    title: string;
    total?: string;
    href?: string;
    nodes: readonly StatementSummaryTreeNode[];
    columns: readonly StatementSummaryColumn[];
    contributions?: readonly StatementSummaryContribution[];
    ariaLabel?: string;
    onNavigate?: (node: StatementSummaryTreeNode) => void;
  } = $props();

  let collapsedIds = $state<Set<string>>(new Set());

  const collapsibleIds = $derived(collectCollapsibleIds(nodes));
  const allCollapsed = $derived(
    collapsibleIds.length > 0 &&
      collapsibleIds.every((id) => collapsedIds.has(id)),
  );

  function collectCollapsibleIds(
    entries: readonly StatementSummaryTreeNode[],
  ): string[] {
    return entries.flatMap((entry) => {
      const children = entry.children ?? [];
      return children.length
        ? [entry.id, ...collectCollapsibleIds(children)]
        : [];
    });
  }

  function toggle(id: string) {
    const next = new Set(collapsedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    collapsedIds = next;
  }

  function toggleAll() {
    collapsedIds = allCollapsed ? new Set() : new Set(collapsibleIds);
  }
</script>

<section class="bj-statement-summary" aria-label={ariaLabel}>
  <div class="bj-statement-summary-heading">
    <h2>
      {title}
      {#if total}
        <span>· {total}</span>
      {/if}
    </h2>
    {#if href}
      <a class="bj-statement-summary-link" {href}>View account</a>
    {/if}
  </div>

  {#if contributions.length}
    <div
      class="bj-statement-summary-contribution-bar"
      role="img"
      aria-label={`${title} category contributions`}
    >
      {#each contributions as contribution (contribution.id)}
        <span
          style={`width: ${contribution.percentage}%; background: ${contribution.color}`}
          title={`${contribution.label}: ${contribution.amount}`}
        ></span>
      {/each}
    </div>
    <div class="bj-statement-summary-contribution-legend">
      {#each contributions as contribution (contribution.id)}
        <span class="bj-statement-summary-contribution">
          <span
            class="bj-statement-summary-contribution-dot"
            style={`background: ${contribution.color}`}
            aria-hidden="true"
          ></span>
          <span>{contribution.label}</span>
          <span>{contribution.percentage.toFixed(1)}%</span>
          <span>{contribution.amount}</span>
        </span>
      {/each}
    </div>
  {/if}

  <div class="bj-statement-summary-scroll">
    <ol
      class="bj-statement-summary-table"
      style={`--bc-statement-column-count: ${columns.length}`}
    >
      <li class="bj-statement-summary-header">
        <span>
          {#if collapsibleIds.length}
            <button
              type="button"
              aria-label={allCollapsed
                ? "Expand all accounts"
                : "Collapse all accounts"}
              aria-pressed={allCollapsed}
              title={allCollapsed
                ? "Expand all accounts"
                : "Collapse all accounts"}
              onclick={toggleAll}
            >
              <ChevronsUpDown
                class="bj-statement-summary-toggle-icon"
                aria-hidden="true"
              />
            </button>
          {/if}
          Account
        </span>
        <span aria-hidden="true"></span>
        <span>Weight</span>
        {#each columns as column (column.id)}
          <span title={column.title}>{column.label}</span>
        {/each}
        <span>Other</span>
      </li>
      {#each nodes as node (node.id)}
        <StatementSummaryTreeRow
          {columns}
          {collapsedIds}
          onToggle={toggle}
          {onNavigate}
          {node}
        />
      {/each}
    </ol>
  </div>
</section>

<style>
  .bj-statement-summary {
    width: 100%;
    min-width: 0;
  }

  .bj-statement-summary-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 1rem;
  }

  h2 {
    margin: 0;
    color: var(--ui-beancount-foreground);
    font-size: 1.125rem;
    font-weight: 600;
    letter-spacing: -0.01em;
  }

  h2 span {
    color: var(--ui-beancount-muted-foreground);
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 1rem;
    font-weight: 500;
  }

  .bj-statement-summary-link {
    color: var(--ui-beancount-accent);
    font-size: 0.75rem;
    font-weight: 500;
    text-decoration: none;
  }

  .bj-statement-summary-link:hover {
    text-decoration: underline;
  }

  .bj-statement-summary-contribution-bar {
    display: flex;
    height: 0.375rem;
    width: 100%;
    overflow: hidden;
    margin-top: 0.75rem;
    border-radius: 999px;
    background: var(--ui-beancount-surface-muted);
  }

  .bj-statement-summary-contribution-bar > span:first-child {
    border-radius: 999px 0 0 999px;
  }

  .bj-statement-summary-contribution-bar > span:last-child {
    border-radius: 0 999px 999px 0;
  }

  .bj-statement-summary-contribution-legend {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
    gap: 0.5rem 1.5rem;
    margin-top: 1rem;
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
  }

  .bj-statement-summary-contribution {
    display: grid;
    min-width: 0;
    grid-template-columns: auto minmax(0, 1fr) max-content max-content;
    align-items: baseline;
    gap: 0.5rem;
  }

  .bj-statement-summary-contribution-dot {
    width: 0.625rem;
    height: 0.625rem;
    border-radius: 999px;
  }

  .bj-statement-summary-contribution > span:nth-child(2) {
    min-width: 0;
    overflow-wrap: anywhere;
  }

  .bj-statement-summary-contribution > span:nth-child(n + 3) {
    color: var(--ui-beancount-foreground);
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
    white-space: nowrap;
  }

  .bj-statement-summary-scroll {
    width: 100%;
    min-width: 0;
    max-width: 100%;
    overflow-x: auto;
    margin-top: 1rem;
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: 0.75rem;
    background: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bj-statement-summary-table {
    min-width: 45rem;
    overflow: hidden;
    margin: 0;
    padding: 0;
    list-style: none;
  }

  .bj-statement-summary-header {
    display: grid;
    grid-template-columns:
      minmax(16rem, 2fr) 4.5rem 5.5rem repeat(
        var(--bc-statement-column-count),
        minmax(8rem, 1fr)
      )
      minmax(11rem, 1fr);
    min-height: 2.5rem;
    align-items: center;
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .bj-statement-summary-header > span {
    padding: 0.5rem 1rem;
    text-align: right;
  }

  .bj-statement-summary-header > span:first-child {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    text-align: left;
  }

  .bj-statement-summary-header button {
    display: grid;
    width: 1rem;
    height: 1rem;
    flex: 0 0 auto;
    place-items: center;
    border: 0;
    border-radius: 0.125rem;
    background: transparent;
    color: var(--ui-beancount-muted-foreground);
    cursor: pointer;
  }

  .bj-statement-summary-header button:hover,
  .bj-statement-summary-header button:focus-visible {
    background: var(--ui-beancount-surface);
    color: var(--ui-beancount-foreground);
    outline: none;
  }

  :global(.bj-statement-summary-toggle-icon) {
    width: var(--ui-beancount-space-3);
    height: var(--ui-beancount-space-3);
  }
</style>
