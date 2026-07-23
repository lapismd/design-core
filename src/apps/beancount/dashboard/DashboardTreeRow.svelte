<script module lang="ts">
  export type { DashboardTreeNode } from "./dashboard-tree-table";
</script>

<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import Self from "./DashboardTreeRow.svelte";
  import type { DashboardTreeNode } from "./dashboard-tree-table";

  let {
    node,
    total,
    gridTemplate,
    collapsed,
    depth = 0,
    branchColor = "var(--primary)",
    valueFormatter = (value) => String(value),
    onNodeSelect = () => {},
    onToggle = () => {},
  }: {
    node: DashboardTreeNode;
    total: number;
    gridTemplate: string;
    collapsed: ReadonlySet<string>;
    depth?: number;
    branchColor?: string;
    valueFormatter?: (value: number) => string;
    onNodeSelect?: (node: DashboardTreeNode) => void;
    onToggle?: (id: string) => void;
  } = $props();

  const children = $derived(node.children ?? []);
  const hasChildren = $derived(children.length > 0);
  const isCollapsed = $derived(collapsed.has(node.id));
  const amount = $derived(Number.isFinite(node.value) ? node.value : 0);
  const weight = $derived(
    total ? (Math.abs(amount) / Math.abs(total)) * 100 : 0,
  );
  const color = $derived(node.color ?? branchColor);
  const weightBars = [0, 1, 2, 3, 4];
</script>

<li>
  <div
    class="border-border/70 hover:bg-muted/65 grid min-h-12 items-center border-t text-sm transition-colors"
    style={`grid-template-columns: ${gridTemplate}`}
    data-dashboard-tree-row
  >
    <div
      class="flex min-w-0 items-center gap-1 py-2 pr-4"
      style={`padding-left: ${0.9 + depth * 1.2}rem`}
    >
      {#if hasChildren}
        <button
          type="button"
          class="text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-ring grid size-4 shrink-0 place-items-center rounded-sm focus-visible:ring-1 focus-visible:outline-none"
          aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${node.label}`}
          aria-expanded={!isCollapsed}
          onclick={() => onToggle(node.id)}
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
      <button
        type="button"
        class="text-primary focus-visible:ring-ring min-w-0 truncate rounded-sm font-medium hover:underline focus-visible:ring-1 focus-visible:outline-none"
        onclick={() => onNodeSelect(node)}
      >
        {node.label}
      </button>
    </div>
    <span
      class="grid place-items-center py-2 pr-2 pl-4"
      data-dashboard-weight-meter-column
    >
      <span
        class:invisible={!amount}
        class="weight-meter"
        style={`--meter-color: ${color}`}
        data-dashboard-weight-meter
        aria-hidden="true"
      >
        {#each weightBars as bar}
          <span style={`opacity: ${0.48 + bar * 0.11}`}></span>
        {/each}
      </span>
    </span>
    <span
      class:dimmed={!amount}
      class="px-4 text-right font-mono text-[13px] tabular-nums"
      data-dashboard-weight>{amount ? `${weight.toFixed(1)}%` : "—"}</span
    >
    <span
      class:dimmed={!amount}
      class="px-4 text-right font-mono text-[13px] tabular-nums"
    >
      {amount ? valueFormatter(amount) : "—"}
    </span>
  </div>
  {#if hasChildren && !isCollapsed}
    <ol>
      {#each children as child (child.id)}
        <Self
          node={child}
          {total}
          {gridTemplate}
          {collapsed}
          depth={depth + 1}
          branchColor={color}
          {valueFormatter}
          {onNodeSelect}
          {onToggle}
        />
      {/each}
    </ol>
  {/if}
</li>

<style>
  .dimmed {
    color: var(--muted-foreground);
  }

  .weight-meter {
    display: grid;
    grid-template-columns: repeat(5, 0.22rem);
    gap: 0.14rem;
    height: 0.85rem;
    align-items: stretch;
    color: var(--meter-color);
  }

  .weight-meter > span {
    border-radius: 999px;
    background: currentColor;
  }
</style>
