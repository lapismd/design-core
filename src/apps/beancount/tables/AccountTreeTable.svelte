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

<div
  class="border-border/80 bg-card overflow-x-auto rounded-xl border shadow-sm"
>
  <Table.Root aria-label={ariaLabel} class="min-w-[36rem]">
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
            class="min-w-32 px-4 py-2 text-right text-xs font-semibold tracking-[0.12em] uppercase"
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
          <Table.Cell class="px-4 py-2">
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
              {#if node.href}
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
            <Table.Cell
              class="px-4 py-2 text-right font-mono text-xs tabular-nums"
            >
              {formatValue(node.values[column.id], column, node)}
            </Table.Cell>
          {/each}
        </Table.Row>
      {/each}
    </Table.Body>
  </Table.Root>
</div>
