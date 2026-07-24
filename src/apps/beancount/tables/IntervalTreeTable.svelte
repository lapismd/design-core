<script lang="ts">
  import type { Snippet } from "svelte";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import * as Table from "@stevejuma/ui/shadcn/table";

  export type IntervalTreeColumn = {
    id: string;
    label: string;
    title?: string;
    href?: string;
  };

  export type IntervalTreeAmount = {
    value: string;
    title?: string;
    difference?: {
      value: string;
      title?: string;
      tone: "positive" | "negative";
    };
  };

  export type IntervalTreeCell = {
    values: readonly IntervalTreeAmount[];
    /** Values to show when this row's descendants are collapsed into it. */
    collapsedValues?: readonly IntervalTreeAmount[];
    dimmed?: boolean;
    /** Dimmed state to use alongside `collapsedValues`. */
    collapsedDimmed?: boolean;
  };

  export type IntervalTreeNode = {
    id: string;
    label: string;
    cells: Readonly<Record<string, IntervalTreeCell | undefined>>;
    href?: string;
    children?: readonly IntervalTreeNode[];
  };

  type VisibleNode = {
    node: IntervalTreeNode;
    depth: number;
    hasChildren: boolean;
  };

  let {
    nodes,
    columns,
    ariaLabel = "Account interval comparison",
    initialCollapsedIds = new Set<string>(),
    onNavigate,
    onColumnNavigate,
    accountCell,
  }: {
    nodes: readonly IntervalTreeNode[];
    columns: readonly IntervalTreeColumn[];
    ariaLabel?: string;
    /** Account ids initially collapsed from an application's persisted preferences. */
    initialCollapsedIds?: ReadonlySet<string>;
    onNavigate?: (node: IntervalTreeNode) => void;
    onColumnNavigate?: (column: IntervalTreeColumn) => void;
    /**
     * Optional application-specific account renderer. When supplied, it owns
     * account navigation and can add contextual content such as an avatar.
     */
    accountCell?: Snippet<[IntervalTreeNode]>;
  } = $props();

  let collapsedIds = $state<Set<string>>(new Set());
  let hasAppliedInitialCollapsedIds = false;

  $effect.pre(() => {
    if (hasAppliedInitialCollapsedIds) return;
    collapsedIds = new Set(initialCollapsedIds);
    hasAppliedInitialCollapsedIds = true;
  });

  const collapsibleIds = $derived(collectCollapsibleIds(nodes));
  const allCollapsed = $derived(
    collapsibleIds.length > 0 &&
      collapsibleIds.every((id) => collapsedIds.has(id)),
  );
  const visibleNodes = $derived(flatten(nodes, collapsedIds));

  function collectCollapsibleIds(
    entries: readonly IntervalTreeNode[],
  ): string[] {
    return entries.flatMap((entry) => {
      const children = entry.children ?? [];
      return children.length
        ? [entry.id, ...collectCollapsibleIds(children)]
        : [];
    });
  }

  function flatten(
    entries: readonly IntervalTreeNode[],
    collapsed: ReadonlySet<string>,
    depth = 0,
  ): VisibleNode[] {
    return entries.flatMap((entry) => {
      const children = entry.children ?? [];
      const hasChildren = children.length > 0;
      const row = { node: entry, depth, hasChildren };
      return hasChildren && !collapsed.has(entry.id)
        ? [row, ...flatten(children, collapsed, depth + 1)]
        : [row];
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

  function navigate(node: IntervalTreeNode, event: MouseEvent) {
    if (onNavigate) event.preventDefault();
    onNavigate?.(node);
  }

  function navigateColumn(column: IntervalTreeColumn, event: MouseEvent) {
    if (onColumnNavigate) event.preventDefault();
    onColumnNavigate?.(column);
  }
</script>

<div data-interval-tree-table class="bc-interval-tree-table">
  <Table.Root aria-label={ariaLabel} class="bc-interval-tree-table__table">
    <Table.Header>
      <Table.Row class="bc-interval-tree-table__header-row">
        <Table.Head class="bc-interval-tree-table__account-heading">
          <span class="bc-interval-tree-table__heading-content">
            {#if collapsibleIds.length}
              <button
                type="button"
                class="bc-interval-tree-table__disclosure"
                aria-label={allCollapsed
                  ? "Expand all accounts"
                  : "Collapse all accounts"}
                aria-pressed={allCollapsed}
                onclick={toggleAll}
              >
                <ChevronsUpDown
                  class="bc-interval-tree-table__disclosure-icon"
                  aria-hidden="true"
                />
              </button>
            {/if}
            Account
          </span>
        </Table.Head>
        {#each columns as column (column.id)}
          <Table.Head
            class="bc-interval-tree-table__amount-heading"
            title={column.title}
          >
            {#if column.href}
              <a
                href={column.href}
                class="bc-interval-tree-table__column-link"
                onclick={(event) => navigateColumn(column, event)}
              >
                {column.label}
              </a>
            {:else}
              {column.label}
            {/if}
          </Table.Head>
        {/each}
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each visibleNodes as { node, depth, hasChildren } (node.id)}
        {@const isCollapsed = collapsedIds.has(node.id)}
        <Table.Row>
          <Table.Cell class="bc-interval-tree-table__account-cell">
            <div
              class="bc-interval-tree-table__account-content"
              style={`padding-left: ${depth * 1.25}rem`}
            >
              {#if hasChildren}
                <button
                  type="button"
                  class="bc-interval-tree-table__disclosure bc-interval-tree-table__disclosure--row"
                  aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${node.label}`}
                  aria-expanded={!isCollapsed}
                  onclick={() => toggle(node.id)}
                >
                  {#if isCollapsed}
                    <ChevronRight
                      class="bc-interval-tree-table__disclosure-icon"
                      aria-hidden="true"
                    />
                  {:else}
                    <ChevronDown
                      class="bc-interval-tree-table__disclosure-icon"
                      aria-hidden="true"
                    />
                  {/if}
                </button>
              {:else}
                <span
                  class="bc-interval-tree-table__disclosure-spacer"
                  aria-hidden="true"
                ></span>
              {/if}
              {#if accountCell}
                {@render accountCell(node)}
              {:else if node.href}
                <a
                  href={node.href}
                  class="bc-interval-tree-table__account-link"
                  onclick={(event) => navigate(node, event)}
                >
                  {node.label}
                </a>
              {:else}
                <span class="bc-interval-tree-table__account-label"
                  >{node.label}</span
                >
              {/if}
            </div>
          </Table.Cell>
          {#each columns as column (column.id)}
            {@const cell = node.cells[column.id]}
            {@const displayedCell =
              isCollapsed && cell?.collapsedValues !== undefined
                ? {
                    values: cell.collapsedValues,
                    dimmed: cell.collapsedDimmed ?? cell.dimmed,
                  }
                : cell}
            <Table.Cell
              class={displayedCell?.dimmed
                ? "bc-interval-tree-table__amount-cell bc-interval-tree-table__amount-cell--dimmed"
                : "bc-interval-tree-table__amount-cell"}
            >
              {#each displayedCell?.values ?? [] as amount, index (index)}
                <span
                  class="bc-interval-tree-table__amount"
                  title={amount.title}
                >
                  {amount.value}
                  {#if amount.difference}
                    <span
                      class="bc-interval-tree-table__difference"
                      class:bc-interval-tree-table__difference--positive={amount
                        .difference.tone === "positive"}
                      class:bc-interval-tree-table__difference--negative={amount
                        .difference.tone === "negative"}
                      title={amount.difference.title}
                    >
                      {amount.difference.value}
                    </span>
                  {/if}
                </span>
              {:else}
                <span class="bc-interval-tree-table__empty-value">—</span>
              {/each}
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>

<style>
  .bc-interval-tree-table {
    overflow-x: auto;
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-interval-tree-table__table) {
    min-width: 48rem;
  }

  :global(.bc-interval-tree-table__header-row) {
    background-color: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }

  :global(.bc-interval-tree-table__header-row:hover) {
    background-color: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }

  :global(.bc-interval-tree-table__account-heading) {
    min-width: 16rem;
  }

  .bc-interval-tree-table__heading-content,
  .bc-interval-tree-table__account-content {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-interval-tree-table__account-heading),
  :global(.bc-interval-tree-table__amount-heading) {
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-4);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  :global(.bc-interval-tree-table__amount-heading) {
    min-width: 11rem;
    text-align: right;
  }

  .bc-interval-tree-table__column-link,
  .bc-interval-tree-table__account-link {
    color: var(--ui-beancount-accent);
  }

  .bc-interval-tree-table__column-link:hover,
  .bc-interval-tree-table__account-link:hover {
    text-decoration: underline;
  }

  .bc-interval-tree-table__disclosure {
    display: grid;
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    flex-shrink: 0;
    place-items: center;
    border-radius: var(--radius-sm);
    color: var(--ui-beancount-muted-foreground);
    outline: none;
  }

  .bc-interval-tree-table__disclosure:hover {
    background-color: var(--ui-beancount-surface);
    color: var(--ui-beancount-foreground);
  }

  .bc-interval-tree-table__disclosure--row:hover {
    background-color: var(--ui-beancount-surface-muted);
  }

  .bc-interval-tree-table__disclosure:focus-visible {
    outline: 1px solid var(--ui-beancount-focus-ring);
  }

  :global(.bc-interval-tree-table__disclosure-icon) {
    width: var(--ui-beancount-space-3);
    height: var(--ui-beancount-space-3);
  }

  :global(.bc-interval-tree-table__account-cell),
  :global(.bc-interval-tree-table__amount-cell) {
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-4);
  }

  :global(.bc-interval-tree-table__account-cell) {
    vertical-align: top;
  }

  .bc-interval-tree-table__disclosure-spacer {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    flex-shrink: 0;
  }

  .bc-interval-tree-table__account-link,
  .bc-interval-tree-table__account-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  :global(.bc-interval-tree-table__amount-cell) {
    text-align: right;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }

  :global(.bc-interval-tree-table__amount-cell--dimmed) {
    opacity: 0.55;
  }

  .bc-interval-tree-table__amount {
    display: block;
    white-space: nowrap;
  }

  .bc-interval-tree-table__difference {
    margin-inline-start: var(--ui-beancount-space-1);
    font-size: 0.9em;
  }

  .bc-interval-tree-table__difference--positive {
    color: var(--ui-beancount-positive);
  }

  .bc-interval-tree-table__difference--negative {
    color: var(--ui-beancount-negative);
  }

  .bc-interval-tree-table__empty-value {
    color: var(--ui-beancount-muted-foreground);
  }
</style>
