<script lang="ts">
  import type { Snippet } from "svelte";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import * as Alert from "@stevejuma/ui/shadcn/alert";
  import ContentScrollArea from "../layout/ContentScrollArea.svelte";
  import SavedQueryHistory, {
    type SavedQueryHistoryItem,
  } from "../navigation/SavedQueryHistory.svelte";
  import QueryComposer from "./QueryComposer.svelte";

  /**
   * Display-only counterpart to Fava's Query composition.
   *
   * Hosts own BQL execution, formatting, saved-query persistence, route state,
   * and any expanded result rendering. This component only coordinates the
   * command bar, optional error, and controlled history disclosure.
   */
  let {
    value = $bindable(""),
    history = [],
    selectedHistoryId,
    expandedHistoryIds = [],
    error,
    ariaLabel = "Query workspace",
    historyAriaLabel = "Saved query history",
    placeholder,
    executeLabel,
    onExecute = () => {},
    onFormat = () => {},
    onClear = () => {},
    onHistorySelect,
    onHistoryExpandedIdsChange,
    onHistoryCopy,
    onHistoryDelete,
    historyDetails,
  }: {
    /** Controlled BQL source; the host owns parsing and execution. */
    value?: string;
    history?: readonly SavedQueryHistoryItem[];
    selectedHistoryId?: string;
    expandedHistoryIds?: readonly string[];
    /** A host-formatted execution failure. */
    error?: string;
    ariaLabel?: string;
    historyAriaLabel?: string;
    placeholder?: string;
    executeLabel?: string;
    onExecute?: (value: string) => void;
    onFormat?: (value: string) => void;
    onClear?: (previousValue: string) => void;
    onHistorySelect?: (query: SavedQueryHistoryItem) => void;
    onHistoryExpandedIdsChange?: (ids: string[]) => void;
    onHistoryCopy?: (query: SavedQueryHistoryItem) => void;
    onHistoryDelete?: (query: SavedQueryHistoryItem) => void;
    /** Host-owned, query-specific results for an expanded saved query. */
    historyDetails?: Snippet<[SavedQueryHistoryItem]>;
  } = $props();
</script>

<ContentScrollArea {ariaLabel}>
  <div class="bc-query-workspace">
    <QueryComposer
      bind:value
      {placeholder}
      {executeLabel}
      clearAfterExecute={true}
      {onExecute}
      {onFormat}
      {onClear}
    />

    {#if error}
      <Alert.Root variant="destructive" class="bc-query-workspace__error">
        <TriangleAlert aria-hidden="true" />
        <Alert.Title>Could not run query</Alert.Title>
        <Alert.Description>{error}</Alert.Description>
      </Alert.Root>
    {/if}

    {#if history.length}
      <SavedQueryHistory
        queries={history}
        selectedId={selectedHistoryId}
        expandedIds={expandedHistoryIds}
        ariaLabel={historyAriaLabel}
        onSelect={onHistorySelect}
        onExpandedIdsChange={onHistoryExpandedIdsChange}
        onCopy={onHistoryCopy}
        onDelete={onHistoryDelete}
        details={historyDetails}
      />
    {/if}
  </div>
</ContentScrollArea>

<style>
  .bc-query-workspace {
    display: grid;
    gap: var(--ui-beancount-space-4);
    min-height: 100%;
    padding: var(--ui-beancount-space-4);
  }

  :global(.bc-query-workspace__error) {
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }
</style>
