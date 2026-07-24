<script lang="ts">
  import type { Snippet } from "svelte";
  import Copy from "@lucide/svelte/icons/copy";
  import Trash from "@lucide/svelte/icons/trash";
  import * as Accordion from "@stevejuma/ui/shadcn/accordion";
  import { Button } from "@stevejuma/ui/shadcn/button";

  /** A saved query presented in the workspace history. */
  export type SavedQueryHistoryItem = {
    id: string;
    query: string;
    /** Optional short accessible name when the query itself is not suitable. */
    label?: string;
  };

  /**
   * Controlled, expandable saved-query history.
   *
   * Applications retain persistence, query execution, result rendering, and
   * clipboard effects. Provide `details` to render query-specific results in
   * the open panel.
   */
  let {
    queries,
    selectedId,
    expandedIds = [],
    ariaLabel = "Saved query history",
    emptyLabel = "No saved queries yet.",
    onSelect,
    onExpandedIdsChange,
    onCopy,
    onDelete,
    details,
  }: {
    queries: readonly SavedQueryHistoryItem[];
    selectedId?: string;
    expandedIds?: readonly string[];
    ariaLabel?: string;
    emptyLabel?: string;
    onSelect?: (query: SavedQueryHistoryItem) => void;
    onExpandedIdsChange?: (ids: string[]) => void;
    onCopy?: (query: SavedQueryHistoryItem) => void;
    onDelete?: (query: SavedQueryHistoryItem) => void;
    details?: Snippet<[SavedQueryHistoryItem]>;
  } = $props();

  let accordionValue = $state<string[]>([]);

  $effect(() => {
    accordionValue = [...expandedIds];
  });

  function updateExpansion(items: string[] | undefined): void {
    accordionValue = items ?? [];
    onExpandedIdsChange?.(accordionValue);
  }

  function handleCopy(event: MouseEvent, query: SavedQueryHistoryItem): void {
    event.preventDefault();
    event.stopPropagation();
    onCopy?.(query);
  }

  function handleDelete(event: MouseEvent, query: SavedQueryHistoryItem): void {
    event.preventDefault();
    event.stopPropagation();
    onDelete?.(query);
  }
</script>

{#if queries.length}
  <Accordion.Root
    class="bc-saved-query-history"
    type="multiple"
    value={accordionValue}
    onValueChange={updateExpansion}
    aria-label={ariaLabel}
  >
    {#each queries as query (query.id)}
      <Accordion.Item
        value={query.id}
        class="bc-saved-query-history__item"
        data-selected={selectedId === query.id ? "" : undefined}
      >
        <div class="bc-saved-query-history__summary">
          <div class="bc-saved-query-history__trigger-wrap">
            <Accordion.Trigger
              class="bc-saved-query-history__trigger"
              onclick={() => onSelect?.(query)}
            >
              <code class="bc-saved-query-history__query">
                {query.label ?? query.query}
              </code>
            </Accordion.Trigger>
          </div>
          <div class="bc-saved-query-history__actions">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Copy query: ${query.label ?? query.query}`}
              title="Copy query"
              disabled={!onCopy}
              onclick={(event) => handleCopy(event, query)}
            >
              <Copy aria-hidden="true" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={`Delete query: ${query.label ?? query.query}`}
              title="Delete query"
              disabled={!onDelete}
              onclick={(event) => handleDelete(event, query)}
            >
              <Trash aria-hidden="true" />
            </Button>
          </div>
        </div>
        <Accordion.Content class="bc-saved-query-history__content">
          <div class="bc-saved-query-history__details">
            {@render details?.(query)}
          </div>
        </Accordion.Content>
      </Accordion.Item>
    {/each}
  </Accordion.Root>
{:else}
  <p class="bc-saved-query-history__empty">{emptyLabel}</p>
{/if}

<style>
  :global(.bc-saved-query-history) {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
    padding-block-start: var(--ui-beancount-space-3);
  }

  :global(.bc-saved-query-history__item) {
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
    color: var(--ui-beancount-surface-raised-foreground);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-saved-query-history__item[data-state="open"]) {
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 50%,
      transparent
    );
  }

  :global(.bc-saved-query-history__item[data-selected]) {
    outline: 1px solid
      color-mix(in srgb, var(--ui-beancount-accent) 30%, transparent);
  }

  .bc-saved-query-history__summary {
    display: flex;
    min-height: calc(
      var(--ui-beancount-space-5) * 2 + var(--ui-beancount-space-1)
    );
    align-items: stretch;
    gap: var(--ui-beancount-space-3);
    transition: background-color 150ms ease;
  }

  .bc-saved-query-history__summary:hover {
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 50%,
      transparent
    );
  }

  .bc-saved-query-history__trigger-wrap {
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
  }

  :global(.bc-saved-query-history__trigger) {
    width: 100%;
    min-width: 0;
    height: 100%;
    gap: var(--ui-beancount-space-3);
    padding-block: 0;
    padding-inline-start: var(--ui-beancount-space-4);
    color: inherit;
    font-size: var(--text-xs);
    text-align: start;
  }

  :global(.bc-saved-query-history__trigger:hover) {
    text-decoration: none;
  }

  .bc-saved-query-history__query {
    min-width: 0;
    flex: 1 1 auto;
    overflow-wrap: anywhere;
    font-family: var(--font-mono);
    font-size: var(--text-xs);
    line-height: var(--leading-relaxed);
  }

  .bc-saved-query-history__actions {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: var(--ui-beancount-space-1);
    padding-inline-end: var(--ui-beancount-space-4);
  }

  :global(.bc-saved-query-history__content) {
    border-block-start: 1px solid var(--ui-beancount-border);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 20%,
      transparent
    );
  }

  :global(.bc-saved-query-history__content > div) {
    padding: 0;
  }

  .bc-saved-query-history__details {
    padding-inline: var(--ui-beancount-space-4);
    padding-block-end: var(--ui-beancount-space-4);
  }

  .bc-saved-query-history__empty {
    margin: 0;
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-2);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }
</style>
