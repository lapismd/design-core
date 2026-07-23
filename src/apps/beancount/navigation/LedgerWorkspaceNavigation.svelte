<script lang="ts">
  import type { Icon } from "@lucide/svelte";
  import ChevronsDownUp from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import FileText from "@lucide/svelte/icons/file-text";
  import FolderTree from "@lucide/svelte/icons/folder-tree";
  import Hash from "@lucide/svelte/icons/hash";
  import List from "@lucide/svelte/icons/list";
  import ListFilter from "@lucide/svelte/icons/list-filter";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import { Input } from "@stevejuma/ui/shadcn/input";
  import {
    FilterCommandPicker,
    SegmentedControl,
    type FilterCommandOption,
  } from "@stevejuma/ui/forms";
  import WorkspaceTreeNavigation, {
    type WorkspaceTreeNavigationItem,
  } from "./WorkspaceTreeNavigation.svelte";

  export type LedgerWorkspaceView = "ledgers" | "folders" | "tags";
  export type LedgerTagsPresentation = "tree" | "flat";

  /** A display-ready action such as an attached receipt or saved resource. */
  export type LedgerWorkspaceResource = {
    id: string;
    label: string;
    icon?: typeof Icon;
    disabled?: boolean;
  };

  /** A controlled searchable picker shown below a ledger tree. */
  export type LedgerWorkspacePicker = {
    label: string;
    value: string;
    options: readonly FilterCommandOption[];
    ariaLabel?: string;
    placeholder?: string;
  };

  /**
   * The reusable visual part of a multi-ledger workspace sidebar.
   *
   * Map application files, folders, tags, routes, and persisted expansion
   * state into these display-ready models. Routing, filtering from domain data,
   * storage, and picker query execution remain in the application adapter.
   */
  let {
    ledgerItems,
    folderItems = [],
    tagItems = [],
    title = "Ledgers",
    ledgerCount = ledgerItems.length,
    view = "ledgers",
    tagsPresentation = "tree",
    activeLedgerId,
    ledgerExpandedIds = [],
    folderExpandedIds = [],
    tagExpandedIds = [],
    selectedTagIds = [],
    queryPicker,
    accountPicker,
    resources = [],
    ariaLabel = "Ledger workspace navigation",
    onViewChange,
    onLedgerSelect,
    onLedgerExpandedIdsChange,
    onFolderSelect,
    onFolderExpandedIdsChange,
    onTagSelect,
    onTagExpandedIdsChange,
    onSelectedTagIdsChange,
    onTagsPresentationChange,
    onQueryChange,
    onAccountChange,
    onResourceSelect,
  }: {
    /** A ledger tree, usually a ledger file with page destinations as children. */
    ledgerItems: readonly WorkspaceTreeNavigationItem[];
    /** A display-ready filesystem tree. */
    folderItems?: readonly WorkspaceTreeNavigationItem[];
    /** A display-ready tag hierarchy. The component supplies a tag icon by default. */
    tagItems?: readonly WorkspaceTreeNavigationItem[];
    title?: string;
    /** Count shown in the compact sidebar heading. */
    ledgerCount?: number;
    view?: LedgerWorkspaceView;
    tagsPresentation?: LedgerTagsPresentation;
    activeLedgerId?: string;
    ledgerExpandedIds?: readonly string[];
    folderExpandedIds?: readonly string[];
    tagExpandedIds?: readonly string[];
    /** Controlled, multiple tag filters. */
    selectedTagIds?: readonly string[];
    queryPicker?: LedgerWorkspacePicker;
    accountPicker?: LedgerWorkspacePicker;
    resources?: readonly LedgerWorkspaceResource[];
    ariaLabel?: string;
    onViewChange?: (view: LedgerWorkspaceView) => void;
    onLedgerSelect?: (id: string) => void;
    onLedgerExpandedIdsChange?: (ids: string[]) => void;
    onFolderSelect?: (id: string) => void;
    onFolderExpandedIdsChange?: (ids: string[]) => void;
    onTagSelect?: (id: string) => void;
    onTagExpandedIdsChange?: (ids: string[]) => void;
    onSelectedTagIdsChange?: (ids: string[]) => void;
    onTagsPresentationChange?: (presentation: LedgerTagsPresentation) => void;
    onQueryChange?: (value: string) => void;
    onAccountChange?: (value: string) => void;
    onResourceSelect?: (id: string) => void;
  } = $props();

  let ledgerSearch = $state("");
  let folderSearch = $state("");
  let tagSearch = $state("");

  const visibleLedgerItems = $derived(filterTree(ledgerItems, ledgerSearch));
  const visibleFolderItems = $derived(filterTree(folderItems, folderSearch));
  const visibleTagItems = $derived(
    addDefaultIcon(filterTree(tagItems, tagSearch), Hash),
  );
  const flatTagItems = $derived(flattenTree(visibleTagItems));
  const selectedTags = $derived(
    selectedTagIds
      .map((id) => findItem(tagItems, id))
      .filter((item): item is WorkspaceTreeNavigationItem => Boolean(item)),
  );
  const visibleLedgerExpandableIds = $derived(
    expandableItemIds(visibleLedgerItems),
  );
  const visibleFolderExpandableIds = $derived(
    expandableItemIds(visibleFolderItems),
  );

  function filterTree(
    items: readonly WorkspaceTreeNavigationItem[],
    query: string,
  ): readonly WorkspaceTreeNavigationItem[] {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    if (!normalizedQuery) return items;

    return items.flatMap((item) => {
      const children = filterTree(item.children ?? [], query);
      if (
        item.label.toLocaleLowerCase().includes(normalizedQuery) ||
        children.length
      ) {
        return [{ ...item, children }];
      }
      return [];
    });
  }

  function addDefaultIcon(
    items: readonly WorkspaceTreeNavigationItem[],
    icon: typeof Icon,
  ): readonly WorkspaceTreeNavigationItem[] {
    return items.map((item) => ({
      ...item,
      icon: item.icon ?? icon,
      children: addDefaultIcon(item.children ?? [], icon),
    }));
  }

  function flattenTree(
    items: readonly WorkspaceTreeNavigationItem[],
  ): WorkspaceTreeNavigationItem[] {
    return items.flatMap((item) => [item, ...flattenTree(item.children ?? [])]);
  }

  function findItem(
    items: readonly WorkspaceTreeNavigationItem[],
    id: string,
  ): WorkspaceTreeNavigationItem | undefined {
    for (const item of items) {
      if (item.id === id) return item;
      const child = findItem(item.children ?? [], id);
      if (child) return child;
    }
    return undefined;
  }

  function expandableItemIds(
    items: readonly WorkspaceTreeNavigationItem[],
  ): string[] {
    return items.flatMap((item) => [
      ...(item.children?.length ? [item.id] : []),
      ...expandableItemIds(item.children ?? []),
    ]);
  }

  function toggleExpandedItems(
    expandableIds: readonly string[],
    expandedIds: readonly string[],
    onChange?: (ids: string[]) => void,
  ): void {
    if (!onChange) return;
    const hasCollapsed = expandableIds.some((id) => !expandedIds.includes(id));
    onChange(hasCollapsed ? [...expandableIds] : []);
  }

  function toggleTag(id: string): void {
    if (!onSelectedTagIdsChange) return;
    onSelectedTagIdsChange(
      selectedTagIds.includes(id)
        ? selectedTagIds.filter((selectedId) => selectedId !== id)
        : [...selectedTagIds, id],
    );
    onTagSelect?.(id);
  }
</script>

<section class="bc-ledger-workspace" aria-label={ariaLabel}>
  <div class="bc-ledger-workspace__heading-row">
    <p class="bc-ledger-workspace__heading">{title}</p>
    <span
      class="bc-ledger-workspace__count"
      aria-label={`${ledgerCount} ${title.toLocaleLowerCase()}`}
      >{ledgerCount}</span
    >
  </div>

  <SegmentedControl
    value={view}
    options={["ledgers", "folders", "tags"]}
    labels={{ ledgers: "Ledgers", folders: "Folders", tags: "Tags" }}
    ariaLabel="Ledger navigation views"
    onChange={(nextView) => onViewChange?.(nextView as LedgerWorkspaceView)}
  />

  {#if selectedTags.length}
    <div
      class="bc-ledger-workspace__selected-tags"
      aria-label="Selected tag filters"
    >
      {#each selectedTags as tag (tag.id)}
        <Button
          type="button"
          variant="secondary"
          size="xs"
          class="bc-ledger-workspace__selected-tag"
          aria-label={`Remove ${tag.label} filter`}
          onclick={() => toggleTag(tag.id)}
        >
          <Hash
            class="bc-ledger-workspace__selected-tag-icon"
            aria-hidden="true"
          />
          <span class="bc-ledger-workspace__selected-tag-label"
            >{tag.label}</span
          >
        </Button>
      {/each}
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="bc-ledger-workspace__clear-tags"
        aria-label="Clear tag filters"
        title="Clear tag filters"
        disabled={!onSelectedTagIdsChange}
        onclick={() => onSelectedTagIdsChange?.([])}
      >
        <span aria-hidden="true">×</span>
      </Button>
    </div>
  {/if}

  {#if view === "ledgers"}
    <div class="bc-ledger-workspace__search-row">
      <label class="bc-ledger-workspace__search-field">
        <span class="bc-ledger-workspace__visually-hidden">Search ledgers</span>
        <ListFilter
          class="bc-ledger-workspace__search-icon"
          aria-hidden="true"
        />
        <Input
          bind:value={ledgerSearch}
          placeholder="Search ledgers"
          class="bc-ledger-workspace__search-input"
        />
      </label>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="bc-ledger-workspace__expand-button"
        aria-label={visibleLedgerExpandableIds.some(
          (id) => !ledgerExpandedIds.includes(id),
        )
          ? "Expand all ledgers"
          : "Collapse all ledgers"}
        title={visibleLedgerExpandableIds.some(
          (id) => !ledgerExpandedIds.includes(id),
        )
          ? "Expand all ledgers"
          : "Collapse all ledgers"}
        disabled={!visibleLedgerExpandableIds.length ||
          !onLedgerExpandedIdsChange}
        onclick={() =>
          toggleExpandedItems(
            visibleLedgerExpandableIds,
            ledgerExpandedIds,
            onLedgerExpandedIdsChange,
          )}
      >
        {#if visibleLedgerExpandableIds.some((id) => !ledgerExpandedIds.includes(id))}
          <ChevronsUpDown aria-hidden="true" />
        {:else}
          <ChevronsDownUp aria-hidden="true" />
        {/if}
      </Button>
    </div>

    <div class="bc-ledger-workspace__tree-scroll">
      <WorkspaceTreeNavigation
        items={visibleLedgerItems}
        activeId={activeLedgerId}
        expandedIds={ledgerExpandedIds}
        ariaLabel="Ledger files"
        emptyLabel={ledgerSearch.trim()
          ? "No ledgers match the current filter."
          : "No ledger files found."}
        showExpandAll={false}
        onSelect={onLedgerSelect}
        onExpandedIdsChange={onLedgerExpandedIdsChange}
      />

      {#if queryPicker || accountPicker || resources.length}
        <div class="bc-ledger-workspace__tools">
          <p class="bc-ledger-workspace__tools-heading">Ledger tools</p>
          {#if queryPicker || accountPicker}
            <div class="bc-ledger-workspace__tool-pickers">
              {#if queryPicker}
                <div class="bc-ledger-workspace__tool-picker">
                  <FilterCommandPicker
                    fullWidth
                    label={queryPicker.label}
                    ariaLabel={queryPicker.ariaLabel ?? queryPicker.label}
                    placeholder={queryPicker.placeholder}
                    value={queryPicker.value}
                    options={[...queryPicker.options]}
                    onChange={(value) => onQueryChange?.(value)}
                  />
                </div>
              {/if}
              {#if accountPicker}
                <div class="bc-ledger-workspace__tool-picker">
                  <FilterCommandPicker
                    fullWidth
                    label={accountPicker.label}
                    ariaLabel={accountPicker.ariaLabel ?? accountPicker.label}
                    placeholder={accountPicker.placeholder}
                    value={accountPicker.value}
                    options={[...accountPicker.options]}
                    onChange={(value) => onAccountChange?.(value)}
                  />
                </div>
              {/if}
            </div>
          {/if}
          {#each resources as resource (resource.id)}
            {@const Icon = resource.icon ?? Sparkles}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="bc-ledger-workspace__resource"
              disabled={resource.disabled || !onResourceSelect}
              onclick={() => onResourceSelect?.(resource.id)}
            >
              <Icon
                class="bc-ledger-workspace__resource-icon"
                aria-hidden="true"
              />
              <span class="bc-ledger-workspace__resource-label"
                >{resource.label}</span
              >
            </Button>
          {/each}
        </div>
      {/if}
    </div>
  {:else if view === "folders"}
    <div class="bc-ledger-workspace__search-row">
      <label class="bc-ledger-workspace__search-field">
        <span class="bc-ledger-workspace__visually-hidden">Search folders</span>
        <ListFilter
          class="bc-ledger-workspace__search-icon"
          aria-hidden="true"
        />
        <Input
          bind:value={folderSearch}
          placeholder="Search folders"
          class="bc-ledger-workspace__search-input"
        />
      </label>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="bc-ledger-workspace__expand-button"
        aria-label={visibleFolderExpandableIds.some(
          (id) => !folderExpandedIds.includes(id),
        )
          ? "Expand all filesystem folders"
          : "Collapse all filesystem folders"}
        title={visibleFolderExpandableIds.some(
          (id) => !folderExpandedIds.includes(id),
        )
          ? "Expand all filesystem folders"
          : "Collapse all filesystem folders"}
        disabled={!visibleFolderExpandableIds.length ||
          !onFolderExpandedIdsChange}
        onclick={() =>
          toggleExpandedItems(
            visibleFolderExpandableIds,
            folderExpandedIds,
            onFolderExpandedIdsChange,
          )}
      >
        {#if visibleFolderExpandableIds.some((id) => !folderExpandedIds.includes(id))}
          <ChevronsUpDown aria-hidden="true" />
        {:else}
          <ChevronsDownUp aria-hidden="true" />
        {/if}
      </Button>
    </div>

    <div class="bc-ledger-workspace__tree-scroll">
      <WorkspaceTreeNavigation
        items={visibleFolderItems}
        expandedIds={folderExpandedIds}
        ariaLabel="Ledger folders"
        emptyLabel="No folders match the current filter."
        showExpandAll={false}
        onSelect={onFolderSelect}
        onExpandedIdsChange={onFolderExpandedIdsChange}
      />
    </div>
  {:else}
    <div class="bc-ledger-workspace__search-row">
      <label class="bc-ledger-workspace__search-field">
        <span class="bc-ledger-workspace__visually-hidden">Search tags</span>
        <ListFilter
          class="bc-ledger-workspace__search-icon"
          aria-hidden="true"
        />
        <Input
          bind:value={tagSearch}
          placeholder="Search tags"
          class="bc-ledger-workspace__search-input"
        />
      </label>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        class="bc-ledger-workspace__presentation-toggle"
        aria-label={tagsPresentation === "tree"
          ? "Showing tag hierarchy. Switch to flat tags."
          : "Showing flat tags. Switch to tag hierarchy."}
        title={tagsPresentation === "tree"
          ? "Showing tag hierarchy. Switch to flat tags."
          : "Showing flat tags. Switch to tag hierarchy."}
        aria-pressed={tagsPresentation === "tree"}
        disabled={!onTagsPresentationChange}
        onclick={() =>
          onTagsPresentationChange?.(
            tagsPresentation === "tree" ? "flat" : "tree",
          )}
      >
        {#if tagsPresentation === "tree"}
          <FolderTree aria-hidden="true" />
        {:else}
          <List aria-hidden="true" />
        {/if}
      </Button>
    </div>

    <div class="bc-ledger-workspace__tree-scroll">
      {#if tagsPresentation === "tree"}
        <WorkspaceTreeNavigation
          items={visibleTagItems}
          expandedIds={tagExpandedIds}
          ariaLabel="Ledger tags"
          emptyLabel="No tags match the current filter."
          showExpandAll
          onSelect={toggleTag}
          onExpandedIdsChange={onTagExpandedIdsChange}
        />
      {:else if flatTagItems.length}
        <div
          class="bc-ledger-workspace__flat-tags"
          aria-label="Flat ledger tags"
        >
          {#each flatTagItems as tag (tag.id)}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              class="bc-ledger-workspace__flat-tag"
              aria-pressed={selectedTagIds.includes(tag.id)}
              title={tag.label}
              disabled={tag.disabled || !onSelectedTagIdsChange}
              onclick={() => toggleTag(tag.id)}
            >
              <Hash
                class="bc-ledger-workspace__flat-tag-icon"
                aria-hidden="true"
              />
              <span class="bc-ledger-workspace__flat-tag-label"
                >{tag.label}</span
              >
              {#if tag.badge}
                <span class="bc-ledger-workspace__flat-tag-badge">
                  {tag.badge}
                </span>
              {/if}
            </Button>
          {/each}
        </div>
      {:else}
        <p class="bc-ledger-workspace__empty">
          No tags match the current filter.
        </p>
      {/if}
    </div>
  {/if}
</section>

<style>
  .bc-ledger-workspace {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-ledger-workspace__heading-row,
  .bc-ledger-workspace__search-row {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
    padding-inline: var(--ui-beancount-space-2);
  }

  .bc-ledger-workspace__heading-row {
    justify-content: space-between;
  }

  .bc-ledger-workspace__heading,
  .bc-ledger-workspace__tools-heading,
  .bc-ledger-workspace__empty {
    margin: 0;
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
  }

  .bc-ledger-workspace__heading,
  .bc-ledger-workspace__tools-heading {
    font-weight: var(--font-weight-medium);
    text-transform: uppercase;
  }

  .bc-ledger-workspace__count {
    display: inline-flex;
    min-width: calc(var(--spacing) * 5);
    height: calc(var(--spacing) * 5);
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background: var(--ui-beancount-sidebar-accent);
    color: var(--ui-beancount-muted-foreground);
    padding-inline: calc(var(--ui-beancount-space-1) * 1.5);
    font-size: 0.6875rem;
    font-weight: var(--font-weight-medium);
    font-variant-numeric: tabular-nums;
  }

  .bc-ledger-workspace__selected-tags {
    position: relative;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: calc(var(--ui-beancount-space-1) * 1.5);
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--radius-md);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface) 55%,
      transparent
    );
    color: var(--ui-beancount-muted-foreground);
    padding: calc(var(--ui-beancount-space-1) * 1.5)
      calc(var(--ui-beancount-space-3) * 1.5)
      calc(var(--ui-beancount-space-1) * 1.5) var(--ui-beancount-space-2);
    font-size: var(--text-xs);
  }

  :global(.bc-ledger-workspace__selected-tag) {
    display: inline-flex;
    min-width: 0;
    max-width: 100%;
    gap: var(--ui-beancount-space-1);
    border-radius: 999px;
  }

  :global(.bc-ledger-workspace__selected-tag-icon) {
    width: 0.75rem;
    height: 0.75rem;
    flex: none;
  }

  .bc-ledger-workspace__selected-tag-label,
  .bc-ledger-workspace__resource-label,
  .bc-ledger-workspace__flat-tag-label {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  :global(.bc-ledger-workspace__clear-tags) {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-end: calc(var(--ui-beancount-space-1) * 1.5);
    width: calc(var(--spacing) * 6);
    height: calc(var(--spacing) * 6);
    border-radius: 999px;
    color: var(--ui-beancount-muted-foreground);
    transform: translateY(-50%);
  }

  .bc-ledger-workspace__search-field {
    position: relative;
    min-width: 0;
    flex: 1;
  }

  .bc-ledger-workspace__visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  :global(.bc-ledger-workspace__search-icon) {
    position: absolute;
    inset-block-start: 50%;
    inset-inline-start: calc(var(--ui-beancount-space-2) * 1.25);
    width: 0.875rem;
    height: 0.875rem;
    color: var(--ui-beancount-muted-foreground);
    pointer-events: none;
    transform: translateY(-50%);
  }

  :global(.bc-ledger-workspace__search-input) {
    width: 100%;
    height: var(--ui-beancount-compact-control-height);
    background: var(--ui-beancount-sidebar);
    padding-inline-start: calc(var(--ui-beancount-space-4) * 2);
    font-size: var(--text-xs);
  }

  :global(.bc-ledger-workspace__expand-button),
  :global(.bc-ledger-workspace__presentation-toggle) {
    width: calc(var(--spacing) * 7);
    height: calc(var(--spacing) * 7);
    flex: none;
  }

  :global(.bc-ledger-workspace__presentation-toggle) {
    border-color: var(--ui-beancount-border);
    background: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-ledger-workspace__tree-scroll {
    min-height: 0;
    flex: 1;
    overflow: auto;
    padding-inline-end: var(--ui-beancount-space-1);
  }

  .bc-ledger-workspace__tools {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-2);
    margin-block-start: var(--ui-beancount-space-2);
    border-top: 1px solid var(--ui-beancount-border);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-2) 0;
  }

  .bc-ledger-workspace__tool-pickers {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-beancount-space-2);
  }

  .bc-ledger-workspace__tool-picker {
    min-width: 0;
    flex: 1 1 8rem;
  }

  :global(.bc-ledger-workspace__resource) {
    width: 100%;
    justify-content: flex-start;
  }

  :global(.bc-ledger-workspace__resource-icon),
  :global(.bc-ledger-workspace__flat-tag-icon) {
    width: 1rem;
    height: 1rem;
    flex: none;
  }

  .bc-ledger-workspace__flat-tags {
    display: grid;
    gap: var(--ui-beancount-space-1);
    padding-inline: var(--ui-beancount-space-2);
  }

  :global(.bc-ledger-workspace__flat-tag) {
    min-width: 0;
    width: 100%;
    height: var(--ui-beancount-compact-control-height);
    justify-content: flex-start;
    gap: var(--ui-beancount-space-2);
    color: var(--ui-beancount-muted-foreground);
    padding-inline: var(--ui-beancount-space-2);
    font-size: var(--text-xs);
  }

  :global(.bc-ledger-workspace__flat-tag:hover) {
    background: var(--ui-beancount-surface);
    color: var(--ui-beancount-sidebar-foreground);
  }

  .bc-ledger-workspace__flat-tag-label {
    flex: 1;
    text-align: start;
  }

  .bc-ledger-workspace__flat-tag-badge {
    font-size: 0.625rem;
    font-variant-numeric: tabular-nums;
  }

  .bc-ledger-workspace__empty {
    padding: var(--ui-beancount-space-1) var(--ui-beancount-space-2);
  }
</style>
