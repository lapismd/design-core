<script lang="ts">
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import ChevronsDownUp from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import FileText from "@lucide/svelte/icons/file-text";
  import type { Icon } from "@lucide/svelte";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { cn } from "../../../lib/utils.js";

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

<nav class="grid gap-1 px-2" aria-label={ariaLabel}>
  {#if showExpandAll && expandableItemIds(items).length}
    {@const expandable = expandableItemIds(items)}
    {@const hasCollapsedItem = expandable.some(
      (id) => !expandedIds.includes(id),
    )}
    <div class="flex justify-end">
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="text-muted-foreground size-7"
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
    <p class="px-2 py-1 text-xs text-muted-foreground">{emptyLabel}</p>
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
  <div class="min-w-0" data-workspace-tree-item={item.id}>
    <div
      class={cn(
        "relative flex h-8 min-w-0 items-center gap-1 rounded-md text-xs transition-colors",
        selected
          ? "border-sidebar-border bg-background text-sidebar-accent-foreground border shadow-sm"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground border border-transparent",
      )}
      style={itemIndentStyle(depth)}
    >
      {#each Array(depth) as _, guideDepth (guideDepth)}
        <span
          aria-hidden="true"
          class="bg-sidebar-border/70 pointer-events-none absolute top-0 bottom-0 w-px"
          style={`left: calc(0.75rem + ${guideDepth * 1.25}rem);`}
        ></span>
      {/each}

      {#if hasChildren}
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          class="hover:bg-background/70 relative z-10 size-7 shrink-0 rounded-sm p-0"
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
            class={cn("transition-transform", expanded && "rotate-90")}
          />
        </Button>
      {:else}
        <span class="size-7 shrink-0" aria-hidden="true"></span>
      {/if}

      <Button
        type="button"
        variant="ghost"
        size="sm"
        class="hover:bg-background/70 relative z-10 h-7 min-w-0 flex-1 justify-start gap-1.5 rounded-sm px-1 text-xs font-medium"
        aria-current={selected ? "page" : undefined}
        disabled={item.disabled || !onSelect}
        title={item.label}
        onclick={() => onSelect?.(item.id)}
      >
        <Icon class="size-3.5 shrink-0" aria-hidden="true" />
        <span class="min-w-0 flex-1 truncate text-left">{item.label}</span>
        {#if item.badge}
          <span class="text-muted-foreground text-[10px] tabular-nums">
            {item.badge}
          </span>
        {/if}
      </Button>
    </div>

    {#if hasChildren && expanded}
      <div id={childRegionId(item.id)} class="min-w-0">
        {#each item.children ?? [] as child (child.id)}
          {@render TreeItem({ item: child, depth: depth + 1 })}
        {/each}
      </div>
    {/if}
  </div>
{/snippet}
