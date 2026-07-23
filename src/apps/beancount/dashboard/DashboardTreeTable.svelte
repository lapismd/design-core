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
  class="w-full min-w-0"
  aria-label={ariaLabel}
  data-dashboard-tree-table
>
  <div class="flex items-baseline justify-between gap-4">
    <h2 class="text-foreground text-lg font-semibold tracking-tight">
      {title}
      <span class="text-muted-foreground font-mono text-base font-medium"
        >· {total ? valueFormatter(total) : "—"}</span
      >
    </h2>
    {#if onViewAll}
      <button
        type="button"
        class="text-primary focus-visible:ring-ring rounded-sm text-xs font-medium hover:underline focus-visible:ring-1 focus-visible:outline-none"
        onclick={onViewAll}
      >
        {viewAllLabel}
      </button>
    {/if}
  </div>

  {#if nodes.length}
    <div
      class="bg-muted mt-3 flex h-1.5 w-full overflow-hidden rounded-full"
      role="img"
      aria-label={`${title} category contributions`}
      data-dashboard-contribution-bar
    >
      {#each contributions as contribution (contribution.id)}
        <span
          class="h-full first:rounded-l-full last:rounded-r-full"
          style={`width: ${contribution.percentage}%; background: ${contribution.color}`}
          title={`${contribution.label}: ${valueFormatter(contribution.value)}`}
        ></span>
      {/each}
    </div>
    <div
      class="contribution-legend text-muted-foreground mt-4 gap-x-6 gap-y-2 text-sm"
      data-dashboard-contribution-legend
    >
      {#each contributions as contribution (contribution.id)}
        <span
          class="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_max-content_max-content] items-baseline gap-x-2"
        >
          <span
            class="mt-1 size-2.5 shrink-0 self-start rounded-full"
            style={`background: ${contribution.color}`}
            aria-hidden="true"
          ></span>
          <span class="min-w-0 leading-5 break-words">{contribution.label}</span
          >
          <span
            class="text-foreground font-mono text-xs whitespace-nowrap tabular-nums"
            >{contribution.percentage.toFixed(1)}%</span
          >
          <span
            class="text-foreground font-mono text-xs whitespace-nowrap tabular-nums"
            >{valueFormatter(contribution.value)}</span
          >
        </span>
      {/each}
    </div>

    <ScrollArea.Root
      orientation="horizontal"
      class="mt-4 w-full max-w-full min-w-0 rounded-xl"
    >
      <ol
        class="border-border/80 bg-card min-w-[45rem] overflow-hidden rounded-xl border shadow-sm"
        data-dashboard-tree-rows
      >
        <li
          class="bg-muted/65 text-muted-foreground grid min-h-10 items-center text-xs font-semibold tracking-[0.12em] uppercase"
          style={`grid-template-columns: ${gridTemplate}`}
        >
          <span class="flex items-center gap-2 px-4 py-2">
            {#if collapsibleIds.length}
              <button
                type="button"
                class="text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-ring grid size-4 shrink-0 place-items-center rounded-sm focus-visible:ring-1 focus-visible:outline-none"
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
          <span aria-hidden="true"></span>
          <span class="px-4 py-2 text-right">Weight</span>
          <span class="px-4 py-2 text-right">Value</span>
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
    <p
      class="text-muted-foreground mt-4 grid min-h-40 place-items-center rounded-xl border border-dashed text-sm"
    >
      {emptyLabel}
    </p>
  {/if}
</section>

<style>
  .contribution-legend {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(min(100%, 22rem), 1fr));
  }
</style>
