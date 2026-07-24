<script lang="ts">
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Tabs from "@stevejuma/ui/shadcn/tabs";
  import ContentScrollArea from "../layout/ContentScrollArea.svelte";
  import HoldingsTable, {
    type HoldingColumn,
    type HoldingRow,
    type HoldingsPagination,
  } from "../tables/HoldingsTable.svelte";

  export type PresetQueryPerspective = {
    /** Stable value owned by the host's preset-query adapter. */
    value: string;
    /** Fava-visible label for the preset query perspective. */
    label: string;
  };

  /**
   * Display-only counterpart to Fava's `PresetQueryView`.
   *
   * The host maps query definitions and executed rows into this contract. This
   * component never runs BQL, reads routes, or persists the selected tab.
   */
  let {
    perspectives,
    perspective,
    columns,
    rows,
    ariaLabel = "Preset query results",
    tabListLabel = "Preset query perspectives",
    queryActionLabel = "Query",
    queryActionAriaLabel = "Open query",
    queryActionPressed = false,
    queryActionAlign = "start",
    emptyLabel,
    pagination,
    statusText = "",
    onPerspectiveChange = () => {},
    onQueryAction = () => {},
    onPageChange = () => {},
    onPageSizeChange = () => {},
  }: {
    /** The Fava preset choices, supplied without their executable query text. */
    perspectives: readonly PresetQueryPerspective[];
    /** Controlled active perspective. */
    perspective: string;
    columns: readonly HoldingColumn[];
    rows: readonly HoldingRow[];
    ariaLabel?: string;
    tabListLabel?: string;
    queryActionLabel?: string;
    queryActionAriaLabel?: string;
    queryActionPressed?: boolean;
    /** Statistics places its Query action at the end of the toolbar row. */
    queryActionAlign?: "start" | "end";
    emptyLabel?: string;
    pagination?: HoldingsPagination;
    /** Host-owned, screen-reader-visible feedback for a requested action. */
    statusText?: string;
    onPerspectiveChange?: (perspective: string) => void;
    onQueryAction?: () => void;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  } = $props();

  function selectPerspective(next: string | undefined) {
    if (next) onPerspectiveChange(next);
  }
</script>

<ContentScrollArea {ariaLabel}>
  <div class="bc-preset-query-report">
    <Tabs.Root value={perspective} onValueChange={selectPerspective}>
      <Tabs.List aria-label={tabListLabel}>
        {#each perspectives as item (item.value)}
          <Tabs.Trigger value={item.value}>{item.label}</Tabs.Trigger>
        {/each}
      </Tabs.List>
    </Tabs.Root>

    <div
      class:bc-preset-query-report__query-row--end={queryActionAlign === "end"}
      class="bc-preset-query-report__query-row"
    >
      <Button
        variant="outline"
        class="bc-preset-query-report__query-action"
        aria-label={queryActionAriaLabel}
        aria-pressed={queryActionPressed}
        onclick={onQueryAction}
      >
        {queryActionLabel}
      </Button>
    </div>

    <HoldingsTable
      {columns}
      {rows}
      {pagination}
      {ariaLabel}
      {emptyLabel}
      {onPageChange}
      {onPageSizeChange}
    />
    <output class="bc-preset-query-report__status" aria-live="polite">
      {statusText}
    </output>
  </div>
</ContentScrollArea>

<style>
  .bc-preset-query-report {
    display: grid;
    gap: var(--ui-beancount-space-3);
    padding: var(--ui-beancount-space-4);
  }

  .bc-preset-query-report__query-row {
    display: flex;
  }

  .bc-preset-query-report__query-row--end {
    justify-content: flex-end;
  }

  :global(.bc-preset-query-report__query-action) {
    width: max-content;
  }

  .bc-preset-query-report__status {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }
</style>
