<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import AccountAvatar from "../pickers/AccountAvatar.svelte";
  import type { StatementSummaryTreeNode } from "./StatementSummaryTreeTable.svelte";
  import Self from "./StatementSummaryTreeRow.svelte";

  let {
    node,
    columns,
    collapsedIds,
    onToggle,
    onNavigate,
    depth = 0,
  }: {
    node: StatementSummaryTreeNode;
    columns: readonly { id: string; label: string; title?: string }[];
    collapsedIds: ReadonlySet<string>;
    onToggle: (id: string) => void;
    onNavigate?: (node: StatementSummaryTreeNode) => void;
    depth?: number;
  } = $props();

  const children = $derived(node.children ?? []);
  const hasChildren = $derived(children.length > 0);
  const isCollapsed = $derived(collapsedIds.has(node.id));

  function navigate(event: MouseEvent) {
    if (onNavigate) event.preventDefault();
    onNavigate?.(node);
  }
</script>

<li>
  <div
    class="bj-statement-summary-row"
    style={`--bc-statement-depth: ${depth}; --bc-statement-color: ${node.color ?? "var(--ui-beancount-accent)"}`}
  >
    <div class="bj-statement-summary-name">
      {#if hasChildren}
        <button
          type="button"
          class="bj-statement-summary-disclosure"
          aria-label={`${isCollapsed ? "Expand" : "Collapse"} ${node.label}`}
          aria-expanded={!isCollapsed}
          onclick={() => onToggle(node.id)}
        >
          <span
            class="bj-statement-summary-chevron"
            class:bj-statement-summary-chevron-collapsed={isCollapsed}
          >
            <ChevronDown
              class="bj-statement-summary-chevron-icon"
              aria-hidden="true"
            />
          </span>
        </button>
      {:else}
        <span class="bj-statement-summary-disclosure-spacer" aria-hidden="true"
        ></span>
      {/if}
      {#if node.appearance}
        <AccountAvatar
          account={node.label}
          color={node.appearance.color}
          icon={node.appearance.icon}
          merchantLogoUrl={node.appearance.merchantLogoUrl}
          size="sm"
        />
      {/if}
      {#if node.href}
        <a
          href={node.href}
          class="bj-statement-summary-account-link"
          onclick={navigate}
        >
          {node.label}
        </a>
      {:else}
        <span class="bj-statement-summary-account-label">{node.label}</span>
      {/if}
    </div>
    <span class="bj-statement-summary-meter" aria-hidden="true">
      {#if node.weight && node.weight !== "—"}
        {#each [0, 1, 2, 3, 4] as bar}
          <span style={`opacity: ${0.48 + bar * 0.11}`}></span>
        {/each}
      {/if}
    </span>
    <span class:bj-statement-summary-muted={node.weight === "—"}>
      {node.weight ?? "—"}
    </span>
    {#each columns as column (column.id)}
      <span class:bj-statement-summary-muted={!node.values[column.id]}>
        {node.values[column.id] ?? "—"}
      </span>
    {/each}
    <span class:bj-statement-summary-muted={!node.otherValues?.length}>
      {#each node.otherValues ?? [] as value (value.label)}
        <span class="bj-statement-summary-other-value" title={value.title}
          >{value.value}</span
        >
      {:else}
        —
      {/each}
    </span>
  </div>
  {#if hasChildren && !isCollapsed}
    <ol>
      {#each children as child (child.id)}
        <Self
          {columns}
          {collapsedIds}
          {onToggle}
          {onNavigate}
          node={child}
          depth={depth + 1}
        />
      {/each}
    </ol>
  {/if}
</li>

<style>
  .bj-statement-summary-row {
    display: grid;
    grid-template-columns:
      minmax(16rem, 2fr) 4.5rem 5.5rem repeat(
        var(--bc-statement-column-count),
        minmax(8rem, 1fr)
      )
      minmax(11rem, 1fr);
    min-height: 3rem;
    align-items: center;
    border-top: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 70%, transparent);
    color: var(--ui-beancount-foreground);
    font-size: 0.875rem;
    transition: background-color 150ms ease;
  }

  .bj-statement-summary-row:hover {
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }

  .bj-statement-summary-name {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: 0.25rem;
    padding: 0.5rem 1rem 0.5rem
      calc(0.9rem + var(--bc-statement-depth) * 1.2rem);
  }

  .bj-statement-summary-disclosure {
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

  .bj-statement-summary-disclosure:hover,
  .bj-statement-summary-disclosure:focus-visible {
    background: var(--ui-beancount-surface-muted);
    color: var(--ui-beancount-foreground);
    outline: none;
  }

  .bj-statement-summary-chevron-collapsed {
    transform: rotate(-90deg);
  }

  :global(.bj-statement-summary-chevron-icon) {
    width: var(--ui-beancount-space-3);
    height: var(--ui-beancount-space-3);
  }

  .bj-statement-summary-disclosure-spacer {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    flex-shrink: 0;
  }

  .bj-statement-summary-account-link,
  .bj-statement-summary-account-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-weight: 500;
  }

  .bj-statement-summary-account-link {
    color: var(--ui-beancount-foreground);
  }

  .bj-statement-summary-account-link:hover {
    color: var(--ui-beancount-accent);
    text-decoration: underline;
  }

  .bj-statement-summary-meter {
    display: grid;
    grid-template-columns: repeat(5, 0.22rem);
    gap: 0.14rem;
    height: 0.85rem;
    align-items: stretch;
    justify-self: center;
  }

  .bj-statement-summary-meter > span {
    border-radius: 999px;
    background: var(--bc-statement-color);
  }

  .bj-statement-summary-row > span:not(.bj-statement-summary-meter) {
    padding: 0.5rem 1rem;
    text-align: right;
    font-family: var(--font-mono, ui-monospace, monospace);
    font-size: 0.8125rem;
    font-variant-numeric: tabular-nums;
  }

  .bj-statement-summary-muted {
    color: var(--ui-beancount-muted-foreground);
  }

  .bj-statement-summary-other-value {
    display: block;
  }
</style>
