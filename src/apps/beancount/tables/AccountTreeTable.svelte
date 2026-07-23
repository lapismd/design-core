<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import * as Table from "@stevejuma/ui/shadcn/table";

  export type AccountTreeColumn = {
    id: string;
    label: string;
    title?: string;
  };

  export type AccountTreeNode = {
    id: string;
    label: string;
    values: Readonly<Record<string, string | number | null | undefined>>;
    href?: string;
    children?: readonly AccountTreeNode[];
  };

  type VisibleNode = {
    node: AccountTreeNode;
    depth: number;
    hasChildren: boolean;
  };

  let {
    nodes,
    columns,
    ariaLabel = "Account hierarchy",
    formatValue = (value) => (value == null ? "—" : String(value)),
    onNavigate,
  }: {
    nodes: readonly AccountTreeNode[];
    columns: readonly AccountTreeColumn[];
    ariaLabel?: string;
    formatValue?: (
      value: string | number | null | undefined,
      column: AccountTreeColumn,
      node: AccountTreeNode,
    ) => string;
    onNavigate?: (node: AccountTreeNode) => void;
  } = $props();

  let collapsedIds = $state<Set<string>>(new Set());

  const collapsibleIds = $derived(collectCollapsibleIds(nodes));
  const allCollapsed = $derived(
    collapsibleIds.length > 0 &&
      collapsibleIds.every((id) => collapsedIds.has(id)),
  );
  const visibleNodes = $derived(flatten(nodes, collapsedIds));

  function collectCollapsibleIds(
    entries: readonly AccountTreeNode[],
  ): string[] {
    return entries.flatMap((entry) => {
      const children = entry.children ?? [];
      return children.length
        ? [entry.id, ...collectCollapsibleIds(children)]
        : [];
    });
  }

  function flatten(
    entries: readonly AccountTreeNode[],
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
    collapsedIds = new Set(collapsedIds);
    if (collapsedIds.has(id)) collapsedIds.delete(id);
    else collapsedIds.add(id);
  }

  function toggleAll() {
    collapsedIds = allCollapsed ? new Set() : new Set(collapsibleIds);
  }

  function navigate(node: AccountTreeNode, event: MouseEvent) {
    if (onNavigate) event.preventDefault();
    onNavigate?.(node);
  }
</script>

<div class="bc-account-tree-table">
  <Table.Root aria-label={ariaLabel} class="bc-account-tree-table__table">
    <Table.Header>
      <Table.Row class="bc-account-tree-table__header-row">
        <Table.Head
          class="bc-account-tree-table__account-heading"
        >
          <span class="bc-account-tree-table__heading-content">
            {#if collapsibleIds.length}
              <button
                type="button"
                class="bc-account-tree-table__disclosure"
                aria-label={allCollapsed
                  ? "Expand all accounts"
                  : "Collapse all accounts"}
                aria-pressed={allCollapsed}
                onclick={toggleAll}
              >
                <ChevronsUpDown
                  class="bc-account-tree-table__disclosure-icon"
                  aria-hidden="true"
                />
              </button>
            {/if}
            Account
          </span>
        </Table.Head>
        {#each columns as column (column.id)}
          <Table.Head
            class="bc-account-tree-table__amount-heading"
            title={column.title}
          >
            {column.label}
          </Table.Head>
        {/each}
      </Table.Row>
    </Table.Header>
    <Table.Body>
      {#each visibleNodes as { node, depth, hasChildren } (node.id)}
        {@const isCollapsed = collapsedIds.has(node.id)}
        <Table.Row>
          <Table.Cell class="bc-account-tree-table__account-cell">
            <div
              class="bc-account-tree-table__account-content"
              style={`padding-left: ${depth * 1.25}rem`}
            >
              {#if hasChildren}
                <button
                  type="button"
                  class="bc-account-tree-table__disclosure bc-account-tree-table__disclosure--row"
                  aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${node.label}`}
                  aria-expanded={!isCollapsed}
                  onclick={() => toggle(node.id)}
                >
                  {#if isCollapsed}
                    <ChevronRight
                      class="bc-account-tree-table__disclosure-icon"
                      aria-hidden="true"
                    />
                  {:else}
                    <ChevronDown
                      class="bc-account-tree-table__disclosure-icon"
                      aria-hidden="true"
                    />
                  {/if}
                </button>
              {:else}
                <span
                  class="bc-account-tree-table__disclosure-spacer"
                  aria-hidden="true"
                ></span>
              {/if}
              {#if node.href}
                <a
                  href={node.href}
                  class="bc-account-tree-table__account-link"
                  onclick={(event) => navigate(node, event)}
                >
                  {node.label}
                </a>
              {:else}
                <span class="bc-account-tree-table__account-label"
                  >{node.label}</span
                >
              {/if}
            </div>
          </Table.Cell>
          {#each columns as column (column.id)}
            <Table.Cell
              class="bc-account-tree-table__amount-cell"
            >
              {formatValue(node.values[column.id], column, node)}
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>

<style>
  .bc-account-tree-table {
    overflow-x: auto;
    border: 1px solid color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-account-tree-table__table) {
    min-width: 36rem;
  }

  :global(.bc-account-tree-table__header-row) {
    background-color: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }

  :global(.bc-account-tree-table__header-row:hover) {
    background-color: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }

  :global(.bc-account-tree-table__account-heading) {
    min-width: 16rem;
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-4);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  .bc-account-tree-table__heading-content,
  .bc-account-tree-table__account-content {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }

  .bc-account-tree-table__disclosure {
    display: grid;
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    place-items: center;
    border-radius: var(--radius-sm);
    color: var(--ui-beancount-muted-foreground);
    outline: none;
  }

  .bc-account-tree-table__disclosure:hover {
    background-color: var(--ui-beancount-surface);
    color: var(--ui-beancount-foreground);
  }

  .bc-account-tree-table__disclosure--row:hover {
    background-color: var(--ui-beancount-surface-muted);
  }

  .bc-account-tree-table__disclosure:focus-visible {
    outline: 1px solid var(--ui-beancount-focus-ring);
  }

  :global(.bc-account-tree-table__disclosure-icon) {
    width: var(--ui-beancount-space-3);
    height: var(--ui-beancount-space-3);
  }

  :global(.bc-account-tree-table__amount-heading) {
    min-width: 8rem;
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-4);
    text-align: right;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.12em;
    text-transform: uppercase;
  }

  :global(.bc-account-tree-table__account-cell),
  :global(.bc-account-tree-table__amount-cell) {
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-4);
  }

  .bc-account-tree-table__disclosure-spacer {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    flex-shrink: 0;
  }

  .bc-account-tree-table__account-link,
  .bc-account-tree-table__account-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .bc-account-tree-table__account-link {
    color: var(--primary);
  }

  .bc-account-tree-table__account-link:hover {
    text-decoration: underline;
  }

  :global(.bc-account-tree-table__amount-cell) {
    text-align: right;
    font-family: var(--font-mono);
    font-size: 0.75rem;
    font-variant-numeric: tabular-nums;
  }
</style>
