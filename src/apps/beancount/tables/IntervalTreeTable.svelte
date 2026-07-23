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

<div
  data-interval-tree-table
  class="border-border/80 bg-card overflow-x-auto rounded-xl border shadow-sm"
>
  <Table.Root aria-label={ariaLabel} class="min-w-[48rem]">
    <Table.Header>
      <Table.Row class="bg-muted/65 hover:bg-muted/65">
        <Table.Head
          class="min-w-64 px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase"
        >
          <span class="flex items-center gap-2">
            {#if collapsibleIds.length}
              <button
                type="button"
                class="text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-ring grid size-4 place-items-center rounded-sm focus-visible:ring-1 focus-visible:outline-none"
                aria-label={allCollapsed
                  ? "Expand all accounts"
                  : "Collapse all accounts"}
                aria-pressed={allCollapsed}
                onclick={toggleAll}
              >
                <ChevronsUpDown class="size-3" aria-hidden="true" />
              </button>
            {/if}
            Account
          </span>
        </Table.Head>
        {#each columns as column (column.id)}
          <Table.Head
            class="min-w-44 px-4 py-2 text-right text-xs font-semibold tracking-[0.12em] uppercase"
            title={column.title}
          >
            {#if column.href}
              <a
                href={column.href}
                class="text-primary hover:underline"
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
          <Table.Cell class="px-4 py-2 align-top">
            <div
              class="flex min-w-0 items-center gap-2"
              style={`padding-left: ${depth * 1.25}rem`}
            >
              {#if hasChildren}
                <button
                  type="button"
                  class="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring grid size-4 shrink-0 place-items-center rounded-sm focus-visible:ring-1 focus-visible:outline-none"
                  aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${node.label}`}
                  aria-expanded={!isCollapsed}
                  onclick={() => toggle(node.id)}
                >
                  {#if isCollapsed}
                    <ChevronRight class="size-3" aria-hidden="true" />
                  {:else}
                    <ChevronDown class="size-3" aria-hidden="true" />
                  {/if}
                </button>
              {:else}
                <span class="size-4 shrink-0" aria-hidden="true"></span>
              {/if}
              {#if accountCell}
                {@render accountCell(node)}
              {:else if node.href}
                <a
                  href={node.href}
                  class="text-primary min-w-0 truncate font-medium hover:underline"
                  onclick={(event) => navigate(node, event)}
                >
                  {node.label}
                </a>
              {:else}
                <span class="min-w-0 truncate font-medium">{node.label}</span>
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
              class={`px-4 py-2 text-right font-mono text-xs tabular-nums ${displayedCell?.dimmed ? "opacity-55" : ""}`}
            >
              {#each displayedCell?.values ?? [] as amount, index (index)}
                <span class="block whitespace-nowrap" title={amount.title}>
                  {amount.value}
                  {#if amount.difference}
                    <span
                      class={`ml-1 text-[0.9em] ${amount.difference.tone === "positive" ? "text-emerald-700 dark:text-emerald-300" : "text-destructive"}`}
                      title={amount.difference.title}
                    >
                      {amount.difference.value}
                    </span>
                  {/if}
                </span>
              {:else}
                <span class="text-muted-foreground">—</span>
              {/each}
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
