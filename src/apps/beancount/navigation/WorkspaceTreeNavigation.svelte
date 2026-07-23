<script lang="ts">
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronsDownUp from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import FileText from "@lucide/svelte/icons/file-text";
  import type { Icon } from "@lucide/svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";

  export type WorkspaceTreeNavigationItem = {
    /** Stable application-owned identifier for selection and expansion state. */
    id: string;
    label: string;
    /** A compact count or status displayed at the row end. */
    badge?: string;
    icon?: typeof Icon;
    disabled?: boolean;
    children?: readonly WorkspaceTreeNavigationItem[];
  };

  /**
   * Router-independent, controlled tree navigation for a workspace sidebar.
   * Applications map domain folders, ledgers, tags, or nested pages into this
   * display model and retain routing, filtering, and persistence themselves.
   */
  let {
    items,
    activeId,
    expandedIds = [],
    ariaLabel = "Workspace navigation",
    emptyLabel = "No navigation items are available.",
    showExpandAll = true,
    onSelect,
    onExpandedIdsChange,
  }: {
    items: readonly WorkspaceTreeNavigationItem[];
    activeId?: string;
    expandedIds?: readonly string[];
    ariaLabel?: string;
    emptyLabel?: string;
    showExpandAll?: boolean;
    onSelect?: (id: string) => void;
    onExpandedIdsChange?: (ids: string[]) => void;
  } = $props();

  function childRegionId(id: string): string {
    return `workspace-tree-children-${id.replaceAll(/[^a-zA-Z0-9_-]/g, "-")}`;
  }

  function expandableItemIds(
    tree: readonly WorkspaceTreeNavigationItem[],
  ): string[] {
    return tree.flatMap((item) => [
      ...(item.children?.length ? [item.id] : []),
      ...expandableItemIds(item.children ?? []),
    ]);
  }

  function isExpanded(item: WorkspaceTreeNavigationItem): boolean {
    return expandedIds.includes(item.id);
  }

  function updateExpansion(id: string): void {
    const next = new Set(expandedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onExpandedIdsChange?.([...next]);
  }

  function toggleAll(): void {
    const expandable = expandableItemIds(items);
    const hasCollapsedItem = expandable.some((id) => !expandedIds.includes(id));
    onExpandedIdsChange?.(hasCollapsedItem ? expandable : []);
  }

  function itemIndentStyle(depth: number): string {
    return `padding-left: ${depth * 20}px;`;
  }
</script>

<nav class="bc-workspace-tree" aria-label={ariaLabel}>
  {#if showExpandAll && expandableItemIds(items).length}
    {@const expandable = expandableItemIds(items)}
    {@const hasCollapsedItem = expandable.some(
      (id) => !expandedIds.includes(id),
    )}
    <div class="bc-workspace-tree__expand-all">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="bc-workspace-tree__expand-all-button"
        aria-label={hasCollapsedItem
          ? "Expand all navigation items"
          : "Collapse all navigation items"}
        title={hasCollapsedItem
          ? "Expand all navigation items"
          : "Collapse all navigation items"}
        disabled={!onExpandedIdsChange}
        onclick={toggleAll}
      >
        {#if hasCollapsedItem}
          <ChevronsUpDown aria-hidden="true" />
        {:else}
          <ChevronsDownUp aria-hidden="true" />
        {/if}
      </Button>
    </div>
  {/if}

  {#each items as item (item.id)}
    {@render TreeItem({ item, depth: 0 })}
  {:else}
    <p class="bc-workspace-tree__empty">{emptyLabel}</p>
  {/each}
</nav>

{#snippet TreeItem({
  item,
  depth,
}: {
  item: WorkspaceTreeNavigationItem;
  depth: number;
})}
  {@const expanded = isExpanded(item)}
  {@const hasChildren = Boolean(item.children?.length)}
  {@const selected = item.id === activeId}
  {@const Icon = item.icon ?? FileText}
  <div class="bc-workspace-tree__item" data-workspace-tree-item={item.id}>
    <div
      class={selected
        ? "bc-workspace-tree__row bc-workspace-tree__row--selected"
        : "bc-workspace-tree__row"}
      style={itemIndentStyle(depth)}
    >
      {#each Array(depth) as _, guideDepth (guideDepth)}
        <span
          aria-hidden="true"
          class="bc-workspace-tree__indent-guide"
          style={`left: calc(0.75rem + ${guideDepth * 1.25}rem);`}
        ></span>
      {/each}

      {#if hasChildren}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          class="bc-workspace-tree__expand-button"
          aria-label={expanded
            ? `Collapse ${item.label}`
            : `Expand ${item.label}`}
          aria-controls={childRegionId(item.id)}
          aria-expanded={expanded}
          disabled={item.disabled || !onExpandedIdsChange}
          onclick={() => updateExpansion(item.id)}
        >
          <ChevronRight
            aria-hidden="true"
            class={expanded
              ? "bc-workspace-tree__expand-icon bc-workspace-tree__expand-icon--expanded"
              : "bc-workspace-tree__expand-icon"}
          />
        </Button>
      {:else}
        <span class="bc-workspace-tree__expand-spacer" aria-hidden="true"
        ></span>
      {/if}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="bc-workspace-tree__item-button"
        aria-current={selected ? "page" : undefined}
        disabled={item.disabled || !onSelect}
        title={item.label}
        onclick={() => onSelect?.(item.id)}
      >
        <Icon class="bc-workspace-tree__item-icon" aria-hidden="true" />
        <span class="bc-workspace-tree__item-label">{item.label}</span>
        {#if item.badge}
          <span class="bc-workspace-tree__item-badge">
            {item.badge}
          </span>
        {/if}
      </Button>
    </div>

    {#if hasChildren && expanded}
      <div id={childRegionId(item.id)} class="bc-workspace-tree__children">
        {#each item.children ?? [] as child (child.id)}
          {@render TreeItem({ item: child, depth: depth + 1 })}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}

<style>
  .bc-workspace-tree {
    display: grid;
    gap: var(--ui-beancount-space-1);
    padding-inline: var(--ui-beancount-space-2);
  }

  .bc-workspace-tree__expand-all {
    display: flex;
    justify-content: flex-end;
  }

  :global(.bc-workspace-tree__expand-all-button),
  :global(.bc-workspace-tree__expand-button) {
    width: calc(var(--spacing) * 7);
    height: calc(var(--spacing) * 7);
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-workspace-tree__empty {
    margin: 0;
    padding: var(--ui-beancount-space-1) var(--ui-beancount-space-2);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
  }

  .bc-workspace-tree__item,
  .bc-workspace-tree__children {
    min-width: 0;
  }

  .bc-workspace-tree__row {
    position: relative;
    display: flex;
    min-width: 0;
    height: var(--ui-beancount-compact-control-height);
    align-items: center;
    gap: var(--ui-beancount-space-1);
    border: 1px solid transparent;
    border-radius: var(--radius-md);
    color: var(--ui-beancount-sidebar-foreground);
    font-size: var(--text-xs);
    transition:
      background-color 150ms ease,
      color 150ms ease;
  }

  .bc-workspace-tree__row:hover {
    background: var(--ui-beancount-sidebar-accent);
    color: var(--ui-beancount-sidebar-accent-foreground);
  }

  .bc-workspace-tree__row--selected,
  .bc-workspace-tree__row--selected:hover {
    border-color: var(--ui-beancount-border);
    background: var(--ui-beancount-surface);
    color: var(--ui-beancount-sidebar-accent-foreground);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-workspace-tree__indent-guide {
    position: absolute;
    inset-block: 0;
    width: 1px;
    background: color-mix(in srgb, var(--ui-beancount-border) 70%, transparent);
    pointer-events: none;
  }

  :global(.bc-workspace-tree__expand-button),
  :global(.bc-workspace-tree__item-button) {
    position: relative;
    z-index: 1;
  }

  :global(.bc-workspace-tree__expand-button) {
    flex: none;
    border-radius: var(--radius-sm);
  }

  :global(.bc-workspace-tree__expand-button:hover),
  :global(.bc-workspace-tree__item-button:hover) {
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface) 70%,
      transparent
    );
  }

  :global(.bc-workspace-tree__expand-icon) {
    transition: transform 150ms ease;
  }

  :global(.bc-workspace-tree__expand-icon--expanded) {
    transform: rotate(90deg);
  }

  .bc-workspace-tree__expand-spacer {
    width: calc(var(--spacing) * 7);
    height: calc(var(--spacing) * 7);
    flex: none;
  }

  :global(.bc-workspace-tree__item-button) {
    min-width: 0;
    height: calc(var(--spacing) * 7);
    flex: 1;
    justify-content: flex-start;
    gap: calc(var(--ui-beancount-space-1) * 1.5);
    border-radius: var(--radius-sm);
    padding-inline: var(--ui-beancount-space-1);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
  }

  :global(.bc-workspace-tree__item-icon) {
    width: calc(var(--spacing) * 3.5);
    height: calc(var(--spacing) * 3.5);
    flex: none;
  }

  .bc-workspace-tree__item-label {
    min-width: 0;
    flex: 1;
    overflow: hidden;
    text-align: start;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .bc-workspace-tree__item-badge {
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
  }
</style>
