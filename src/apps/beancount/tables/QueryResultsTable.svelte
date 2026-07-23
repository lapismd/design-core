<script lang="ts">
  import ArrowDownWideNarrow from "@lucide/svelte/icons/arrow-down-wide-narrow";
  import ArrowUpDown from "@lucide/svelte/icons/arrow-up-down";
  import ArrowUpNarrowWide from "@lucide/svelte/icons/arrow-up-narrow-wide";
  import TriangleAlert from "@lucide/svelte/icons/triangle-alert";
  import PagePagination from "../navigation/PagePagination.svelte";
  import * as Select from "@stevejuma/ui/shadcn/select";
  import * as Table from "@stevejuma/ui/shadcn/table";

  export type QueryResultCell =
    | string
    | number
    | readonly (string | number)[]
    | null
    | undefined;

  export type QueryResultColumn = {
    id: string;
    label: string;
    /** Opt into local, presentation-only sorting for this column. */
    sortable?: boolean;
    align?: "left" | "right";
  };

  export type QueryResultRow = {
    id: string;
    values: Readonly<Record<string, QueryResultCell>>;
  };

  export type QueryResultsPagination = {
    page: number;
    pageCount: number;
    /** A fully formatted summary, for example “Showing 26–50 of 91”. */
    resultLabel: string;
    pageSize?: number;
    pageSizes?: readonly number[];
  };

  type SortDirection = "ascending" | "descending" | "none";

  let {
    columns,
    rows,
    ariaLabel = "Query results",
    emptyLabel = "No results.",
    error,
    pagination,
    onPageChange = () => {},
    onPageSizeChange = () => {},
  }: {
    columns: readonly QueryResultColumn[];
    rows: readonly QueryResultRow[];
    ariaLabel?: string;
    emptyLabel?: string;
    /** Query execution failures shown beneath a usable result table. */
    error?: string;
    /**
     * Controlled page information. Supply already-paged `rows`; this
     * component does not know the query's complete dataset.
     */
    pagination?: QueryResultsPagination;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
  } = $props();

  let sortedColumnId = $state<string>();
  let sortDirection = $state<SortDirection>("none");

  const sortedRows = $derived.by(() => {
    const columnId = sortedColumnId;
    if (!columnId || sortDirection === "none") return rows;
    const direction = sortDirection === "ascending" ? 1 : -1;
    return [...rows].sort(
      (a, b) =>
        direction * compareCells(a.values[columnId], b.values[columnId]),
    );
  });

  function displayCell(value: QueryResultCell) {
    if (Array.isArray(value)) return value.map(String);
    return value == null ? ["—"] : [String(value)];
  }

  function compareCells(left: QueryResultCell, right: QueryResultCell) {
    const leftValue = displayCell(left).join("\n");
    const rightValue = displayCell(right).join("\n");
    const leftNumber = Number(leftValue);
    const rightNumber = Number(rightValue);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
      return leftNumber - rightNumber;
    }
    return leftValue.localeCompare(rightValue, undefined, { numeric: true });
  }

  function orderFor(column: QueryResultColumn): SortDirection {
    return column.id === sortedColumnId ? sortDirection : "none";
  }

  function toggleSort(column: QueryResultColumn) {
    if (!column.sortable) return;
    if (column.id !== sortedColumnId) {
      sortedColumnId = column.id;
      sortDirection = "ascending";
      return;
    }
    sortDirection =
      sortDirection === "ascending"
        ? "descending"
        : sortDirection === "descending"
          ? "none"
          : "ascending";
  }

  function setPageSize(value: string | undefined) {
    const pageSize = Number(value);
    if (pagination?.pageSizes?.includes(pageSize)) {
      onPageSizeChange(pageSize);
    }
  }
</script>

<div class="bc-query-results">
  <div class="bc-query-results__table-frame">
    <Table.Root aria-label={ariaLabel} class="bc-query-results__table">
      <Table.Header class="bc-query-results__header">
        <Table.Row class="bc-query-results__header-row">
          {#each columns as column (column.id)}
            {@const order = orderFor(column)}
            <Table.Head
              aria-sort={column.sortable ? order : undefined}
              class={column.align === "right"
                ? "bc-query-results__head bc-query-results__head--right"
                : "bc-query-results__head"}
            >
              {#if column.sortable}
                <button
                  type="button"
                  class={column.align === "right"
                    ? "bc-query-results__sort-control bc-query-results__sort-control--right"
                    : "bc-query-results__sort-control"}
                  aria-label={`Sort by ${column.label}`}
                  onclick={() => toggleSort(column)}
                >
                  <span>{column.label}</span>
                  {#if order === "ascending"}
                    <ArrowUpNarrowWide
                      class="bc-query-results__sort-icon"
                      aria-hidden="true"
                    />
                  {:else if order === "descending"}
                    <ArrowDownWideNarrow
                      class="bc-query-results__sort-icon"
                      aria-hidden="true"
                    />
                  {:else}
                    <ArrowUpDown
                      class="bc-query-results__sort-icon bc-query-results__sort-icon--idle"
                      aria-hidden="true"
                    />
                  {/if}
                </button>
              {:else}
                <span
                  class="bc-query-results__column-label"
                  >{column.label}</span
                >
              {/if}
            </Table.Head>
          {/each}
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each sortedRows as row (row.id)}
          <Table.Row>
            {#each columns as column (column.id)}
              <Table.Cell
                class={column.align === "right"
                  ? "bc-query-results__cell bc-query-results__cell--right"
                  : "bc-query-results__cell"}
              >
                {#each displayCell(row.values[column.id]) as value, index}
                  <span
                    class="bc-query-results__cell-line"
                    class:bc-query-results__cell-line--stacked={index > 0}
                  >
                    {value}
                  </span>
                {/each}
              </Table.Cell>
            {/each}
          </Table.Row>
        {:else}
          <Table.Row>
            <Table.Cell
              colspan={Math.max(columns.length, 1)}
              class="bc-query-results__empty"
            >
              {emptyLabel}
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
      {#if error}
        <Table.Footer
          class="bc-query-results__error-footer"
        >
          <Table.Row class="bc-query-results__error-row">
            <Table.Cell
              colspan={Math.max(columns.length, 1)}
              class="bc-query-results__error-cell"
            >
              <div class="bc-query-results__error" role="alert">
                <TriangleAlert
                  class="bc-query-results__error-icon"
                  aria-hidden="true"
                />
                <div>
                  <p class="bc-query-results__error-title">
                    Could not run query
                  </p>
                  <p
                    class="bc-query-results__error-message"
                  >
                    {error}
                  </p>
                </div>
              </div>
            </Table.Cell>
          </Table.Row>
        </Table.Footer>
      {/if}
    </Table.Root>
  </div>
  {#if pagination && pagination.pageCount > 1}
    <div
      class="bc-query-results__pagination"
    >
      <span class="bc-query-results__result-label">{pagination.resultLabel}</span
      >
      <div class="bc-query-results__pagination-controls">
        {#if pagination.pageSize && pagination.pageSizes?.length}
          <div class="bc-query-results__page-size">
            <span
              class="bc-query-results__page-size-label"
              id="query-results-page-size-label">Rows per page</span
            >
            <Select.Root
              type="single"
              value={String(pagination.pageSize)}
              onValueChange={setPageSize}
            >
              <Select.Trigger
                aria-labelledby="query-results-page-size-label"
                class="bc-query-results__page-size-select"
              >
                {pagination.pageSize}
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  {#each pagination.pageSizes as pageSize (pageSize)}
                    <Select.Item
                      value={String(pageSize)}
                      label={`${pageSize} records`}
                    >
                      {pageSize}
                    </Select.Item>
                  {/each}
                </Select.Group>
              </Select.Content>
            </Select.Root>
          </div>
        {/if}
        <PagePagination
          page={pagination.page}
          pageCount={pagination.pageCount}
          ariaLabel="Query result pages"
          {onPageChange}
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .bc-query-results {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-query-results__table-frame {
    overflow-x: auto;
    border: 1px solid color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-query-results__table) {
    min-width: max-content;
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  :global(.bc-query-results__header),
  :global(.bc-query-results__header-row) {
    background-color: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
    color: var(--ui-beancount-muted-foreground);
  }

  :global(.bc-query-results__header-row:hover) {
    background-color: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }

  :global(.bc-query-results__head) {
    padding: 0;
  }

  :global(.bc-query-results__head--right) {
    text-align: right;
  }

  .bc-query-results__sort-control,
  .bc-query-results__column-label {
    display: inline-flex;
    width: 100%;
    height: 2.5rem;
    align-items: center;
    gap: var(--ui-beancount-space-1);
    padding-inline: var(--ui-beancount-space-4);
    font-family: var(--font-sans);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  .bc-query-results__sort-control {
    outline: none;
    transition: color 150ms ease;
  }

  .bc-query-results__sort-control--right {
    justify-content: flex-end;
  }

  .bc-query-results__sort-control:hover {
    color: var(--ui-beancount-foreground);
  }

  .bc-query-results__sort-control:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
  }

  :global(.bc-query-results__sort-icon) {
    width: 0.875rem;
    height: 0.875rem;
  }

  :global(.bc-query-results__sort-icon--idle) {
    opacity: 0.5;
  }

  :global(.bc-query-results__cell) {
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
    font-family: var(--font-mono);
  }

  :global(.bc-query-results__cell--right) {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .bc-query-results__cell-line {
    display: block;
    white-space: pre-wrap;
  }

  .bc-query-results__cell-line--stacked {
    margin-block-start: var(--ui-beancount-space-1);
  }

  :global(.bc-query-results__empty) {
    height: 6rem;
    color: var(--ui-beancount-muted-foreground);
    text-align: center;
    font-family: var(--font-sans);
    font-size: 0.875rem;
  }

  :global(.bc-query-results__error-footer) {
    border-top: 1px solid
      color-mix(in srgb, var(--ui-beancount-negative) 45%, transparent);
    background-color: color-mix(
      in srgb,
      var(--ui-beancount-negative) 10%,
      transparent
    );
    color: var(--ui-beancount-foreground);
  }

  :global(.bc-query-results__error-row:hover) {
    background-color: transparent;
  }

  :global(.bc-query-results__error-cell) {
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
  }

  .bc-query-results__error {
    display: flex;
    align-items: flex-start;
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-query-results__error-icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    margin-block-start: calc(var(--ui-beancount-space-1) / 2);
    flex-shrink: 0;
  }

  .bc-query-results__error-title {
    font-family: var(--font-sans);
    font-size: 0.75rem;
    font-weight: 600;
  }

  .bc-query-results__error-message {
    margin-block-start: var(--ui-beancount-space-1);
    overflow-wrap: break-word;
    font-family: var(--font-mono);
    font-size: 0.6875rem;
    line-height: 1.375;
  }

  .bc-query-results__pagination {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
    border: 1px solid color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
  }

  .bc-query-results__result-label,
  .bc-query-results__page-size-label {
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
  }

  .bc-query-results__pagination-controls {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-query-results__page-size {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-query-results__page-size-select) {
    width: 5rem;
    height: var(--ui-beancount-compact-control-height);
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-variant-numeric: tabular-nums;
  }

  @media (min-width: 640px) {
    .bc-query-results__pagination,
    .bc-query-results__pagination-controls {
      flex-direction: row;
      align-items: center;
    }

    .bc-query-results__pagination {
      justify-content: space-between;
    }
  }
</style>
