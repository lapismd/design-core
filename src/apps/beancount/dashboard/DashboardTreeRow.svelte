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
    branchColor = "var(--ui-beancount-accent)",
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

<li class="bc-dashboard-tree-row__item">
  <div
    class="bc-dashboard-tree-row"
    style={`grid-template-columns: ${gridTemplate}`}
    data-dashboard-tree-row
  >
    <div
      class="bc-dashboard-tree-row__label-cell"
      style={`padding-left: ${0.9 + depth * 1.2}rem`}
    >
      {#if hasChildren}
        <button
          type="button"
          class="bc-dashboard-tree-row__toggle"
          aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${node.label}`}
          aria-expanded={!isCollapsed}
          onclick={() => onToggle(node.id)}
        >
          {#if isCollapsed}
            <ChevronRight
              class="bc-dashboard-tree-row__icon"
              aria-hidden="true"
            />
          {:else}
            <ChevronDown
              class="bc-dashboard-tree-row__icon"
              aria-hidden="true"
            />
          {/if}
        </button>
      {:else}
        <span class="bc-dashboard-tree-row__toggle-spacer" aria-hidden="true"
        ></span>
      {/if}
      <button
        type="button"
        class="bc-dashboard-tree-row__select"
        onclick={() => onNodeSelect(node)}
      >
        {node.label}
      </button>
    </div>
    <span
      class="bc-dashboard-tree-row__meter-cell"
      data-dashboard-weight-meter-column
    >
      <span
        class:is-hidden={!amount}
        class="bc-dashboard-tree-row__weight-meter"
        style={`--bc-meter-color: ${color}`}
        data-dashboard-weight-meter
        aria-hidden="true"
      >
        {#each weightBars as bar}
          <span style={`opacity: ${0.48 + bar * 0.11}`}></span>
        {/each}
      </span>
    </span>
    <span
      class:bc-dashboard-tree-row__dimmed={!amount}
      class="bc-dashboard-tree-row__amount"
      data-dashboard-weight>{amount ? `${weight.toFixed(1)}%` : "—"}</span
    >
    <span
      class:bc-dashboard-tree-row__dimmed={!amount}
      class="bc-dashboard-tree-row__amount"
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
  .bc-dashboard-tree-row {
    display: grid;
    min-block-size: 3rem;
    align-items: center;
    border-block-start: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 70%, transparent);
    color: var(--ui-beancount-foreground);
    font-size: 0.875rem;
    transition: background-color 150ms ease;
  }
  .bc-dashboard-tree-row:hover {
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }
  .bc-dashboard-tree-row__label-cell {
    display: flex;
    min-inline-size: 0;
    align-items: center;
    gap: var(--ui-beancount-space-1);
    padding-block: var(--ui-beancount-space-2);
    padding-inline-end: var(--ui-beancount-space-4);
  }
  .bc-dashboard-tree-row__toggle,
  .bc-dashboard-tree-row__toggle-spacer {
    display: grid;
    inline-size: 1rem;
    block-size: 1rem;
    flex-shrink: 0;
    place-items: center;
    border-radius: calc(var(--ui-beancount-radius-panel) / 2);
  }
  .bc-dashboard-tree-row__toggle {
    color: var(--ui-beancount-muted-foreground);
    outline: none;
    transition:
      background-color 150ms ease,
      color 150ms ease;
  }
  .bc-dashboard-tree-row__toggle:hover {
    background: var(--ui-beancount-surface-muted);
    color: var(--ui-beancount-foreground);
  }
  .bc-dashboard-tree-row__toggle:focus-visible,
  .bc-dashboard-tree-row__select:focus-visible {
    outline: 1px solid var(--ui-beancount-focus-ring);
    outline-offset: 1px;
  }
  :global(.bc-dashboard-tree-row__icon) {
    inline-size: 0.75rem;
    block-size: 0.75rem;
  }
  .bc-dashboard-tree-row__select {
    min-inline-size: 0;
    overflow: hidden;
    border-radius: calc(var(--ui-beancount-radius-panel) / 2);
    color: var(--ui-beancount-accent);
    font-weight: 500;
    outline: none;
    text-align: start;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .bc-dashboard-tree-row__select:hover {
    text-decoration: underline;
  }
  .bc-dashboard-tree-row__meter-cell {
    display: grid;
    place-items: center;
    padding-block: var(--ui-beancount-space-2);
    padding-inline: var(--ui-beancount-space-2) var(--ui-beancount-space-1);
  }
  .bc-dashboard-tree-row__amount {
    padding-inline: var(--ui-beancount-space-4);
    color: var(--ui-beancount-foreground);
    font-family: var(--font-mono);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
    text-align: end;
  }
  .bc-dashboard-tree-row__dimmed {
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-dashboard-tree-row__weight-meter {
    display: grid;
    grid-template-columns: repeat(5, 0.22rem);
    gap: 0.14rem;
    height: 0.85rem;
    align-items: stretch;
    color: var(--bc-meter-color);
  }

  .bc-dashboard-tree-row__weight-meter > span {
    border-radius: 999px;
    background: currentColor;
  }

  .is-hidden {
    visibility: hidden;
  }
</style>
