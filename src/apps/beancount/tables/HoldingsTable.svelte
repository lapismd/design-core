<script lang="ts">
  import ArrowDownWideNarrow from "@lucide/svelte/icons/arrow-down-wide-narrow";
  import ArrowUpDown from "@lucide/svelte/icons/arrow-up-down";
  import ArrowUpNarrowWide from "@lucide/svelte/icons/arrow-up-narrow-wide";
  import PagePagination from "../navigation/PagePagination.svelte";
  import AccountAvatar from "../pickers/AccountAvatar.svelte";
  import * as Select from "@stevejuma/ui/shadcn/select";
  import * as Table from "@stevejuma/ui/shadcn/table";

  export type HoldingValue = {
    /** Formatted text supplied by the holdings adapter. An omitted value stays blank. */
    label?: string;
    /** Stable display-model value used only for local sorting. */
    sortValue?: string | number;
  };

  export type HoldingColumn = {
    id: string;
    label: string;
    align?: "left" | "right";
  };

  export type HoldingRow = {
    id: string;
    account: string;
    values: Readonly<Record<string, HoldingValue | undefined>>;
  };

  export type HoldingsPagination = {
    page: number;
    pageCount: number;
    /** A fully formatted summary, for example “Showing 1–10 of 12”. */
    resultLabel: string;
    pageSize?: number;
    pageSizes?: readonly number[];
  };

  type SortDirection = "ascending" | "descending" | "none";

  let {
    columns,
    rows,
    ariaLabel = "Holdings",
    emptyLabel = "No holdings.",
    pagination,
    onPageChange = () => {},
    onPageSizeChange = () => {},
  }: {
    columns: readonly HoldingColumn[];
    rows: readonly HoldingRow[];
    ariaLabel?: string;
    emptyLabel?: string;
    /**
     * Controlled page information. The holdings adapter supplies the current
     * page's display rows; this component does not calculate holdings.
     */
    pagination?: HoldingsPagination;
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
      (left, right) =>
        direction *
        compareValues(
          valueForSort(left, columnId),
          valueForSort(right, columnId),
        ),
    );
  });

  function valueForSort(row: HoldingRow, columnId: string) {
    if (columnId === "account") return row.account;
    const value = row.values[columnId];
    return value?.sortValue ?? value?.label ?? "";
  }

  function compareValues(left: string | number, right: string | number) {
    if (typeof left === "number" && typeof right === "number") {
      return left - right;
    }
    return String(left).localeCompare(String(right), undefined, {
      numeric: true,
    });
  }

  function orderFor(column: HoldingColumn): SortDirection {
    return column.id === sortedColumnId ? sortDirection : "none";
  }

  function toggleSort(column: HoldingColumn) {
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

<div class="bc-holdings-table">
  <div class="bc-holdings-table__frame">
    <div class="bc-holdings-table__scroll">
      <Table.Root aria-label={ariaLabel} class="bc-holdings-table__table">
        <Table.Header class="bc-holdings-table__header">
          <Table.Row class="bc-holdings-table__header-row">
            {#each columns as column (column.id)}
              {@const order = orderFor(column)}
              <Table.Head
                aria-sort={order}
                class={column.align === "right"
                  ? "bc-holdings-table__head bc-holdings-table__head--right"
                  : "bc-holdings-table__head"}
              >
                <button
                  type="button"
                  class={column.align === "right"
                    ? "bc-holdings-table__sort-control bc-holdings-table__sort-control--right"
                    : "bc-holdings-table__sort-control"}
                  aria-label={`Sort by ${column.label}`}
                  onclick={() => toggleSort(column)}
                >
                  <span>{column.label}</span>
                  {#if order === "ascending"}
                    <ArrowUpNarrowWide
                      class="bc-holdings-table__sort-icon"
                      aria-hidden="true"
                    />
                  {:else if order === "descending"}
                    <ArrowDownWideNarrow
                      class="bc-holdings-table__sort-icon"
                      aria-hidden="true"
                    />
                  {:else}
                    <ArrowUpDown
                      class="bc-holdings-table__sort-icon bc-holdings-table__sort-icon--idle"
                      aria-hidden="true"
                    />
                  {/if}
                </button>
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
                    ? "bc-holdings-table__cell bc-holdings-table__cell--right"
                    : "bc-holdings-table__cell"}
                >
                  {#if column.id === "account"}
                    <div class="bc-holdings-table__account">
                      <AccountAvatar account={row.account} />
                      <code>{row.account}</code>
                    </div>
                  {:else}
                    {row.values[column.id]?.label ?? ""}
                  {/if}
                </Table.Cell>
              {/each}
            </Table.Row>
          {:else}
            <Table.Row>
              <Table.Cell
                colspan={Math.max(columns.length, 1)}
                class="bc-holdings-table__empty"
              >
                {emptyLabel}
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  </div>

  {#if pagination && pagination.pageCount > 1}
    <div class="bc-holdings-table__pagination">
      <span class="bc-holdings-table__result-label" role="status"
        >{pagination.resultLabel}</span
      >
      <div class="bc-holdings-table__pagination-controls">
        {#if pagination.pageSize && pagination.pageSizes?.length}
          <div class="bc-holdings-table__page-size">
            <span
              class="bc-holdings-table__page-size-label"
              id="holdings-page-size-label">Rows per page</span
            >
            <Select.Root
              type="single"
              value={String(pagination.pageSize)}
              onValueChange={setPageSize}
            >
              <Select.Trigger
                aria-labelledby="holdings-page-size-label"
                class="bc-holdings-table__page-size-select"
              >
                {pagination.pageSize}
              </Select.Trigger>
              <Select.Content>
                <Select.Group>
                  {#each pagination.pageSizes as pageSize (pageSize)}
                    <Select.Item
                      value={String(pageSize)}
                      label={`${pageSize} rows`}
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
          ariaLabel="Holdings pages"
          {onPageChange}
        />
      </div>
    </div>
  {/if}
</div>

<style>
  .bc-holdings-table {
    display: grid;
    min-width: 0;
    gap: var(--ui-beancount-space-3);
  }

  .bc-holdings-table__frame {
    overflow: hidden;
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-holdings-table__scroll {
    overflow-x: auto;
  }

  :global(.bc-holdings-table__table) {
    width: 100%;
    table-layout: fixed;
    font-size: var(--text-xs);
  }

  :global(.bc-holdings-table__head:first-child),
  :global(.bc-holdings-table__cell:first-child) {
    width: 30%;
  }

  :global(.bc-holdings-table__header),
  :global(.bc-holdings-table__header-row) {
    background-color: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
    color: var(--ui-beancount-muted-foreground);
  }

  :global(.bc-holdings-table__header-row:hover) {
    background-color: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 65%,
      transparent
    );
  }

  :global(.bc-holdings-table__head) {
    padding: 0;
  }
  :global(.bc-holdings-table__head--right) {
    text-align: right;
  }

  .bc-holdings-table__sort-control {
    display: inline-flex;
    width: 100%;
    height: var(--ui-beancount-control-height);
    align-items: center;
    gap: var(--ui-beancount-space-1);
    padding-inline: var(--ui-beancount-space-4);
    color: inherit;
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
    outline: none;
    transition: color 150ms ease;
  }

  .bc-holdings-table__sort-control--right {
    justify-content: flex-end;
  }
  .bc-holdings-table__sort-control:hover {
    color: var(--ui-beancount-foreground);
  }
  .bc-holdings-table__sort-control:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: -2px;
  }
  :global(.bc-holdings-table__sort-icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
  }
  :global(.bc-holdings-table__sort-icon--idle) {
    opacity: 0.5;
  }

  :global(.bc-holdings-table__cell) {
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
    color: var(--ui-beancount-foreground);
    font-family: var(--font-mono);
    white-space: nowrap;
  }

  :global(.bc-holdings-table__cell--right) {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  .bc-holdings-table__account {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
    font-family: var(--font-sans);
  }

  .bc-holdings-table__account code {
    overflow: hidden;
    text-overflow: ellipsis;
    color: var(--ui-beancount-foreground);
    font-family: var(--font-mono);
    font-size: var(--text-xs);
  }

  :global(.bc-holdings-table__empty) {
    height: 6rem;
    color: var(--ui-beancount-muted-foreground);
    text-align: center;
    font-family: var(--font-sans);
    font-size: var(--text-sm);
  }

  .bc-holdings-table__pagination {
    display: flex;
    min-height: calc(
      var(--ui-beancount-control-height) + var(--ui-beancount-space-3)
    );
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-beancount-space-3);
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-3);
  }

  .bc-holdings-table__result-label,
  .bc-holdings-table__page-size-label {
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
    white-space: nowrap;
  }

  .bc-holdings-table__pagination-controls,
  .bc-holdings-table__page-size {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }

  .bc-holdings-table__pagination-controls {
    flex-wrap: wrap;
    justify-content: flex-end;
  }
  :global(.bc-holdings-table__page-size-select) {
    width: 3.5rem;
    height: var(--ui-beancount-compact-control-height);
    font-size: var(--text-xs);
  }

  @media (max-width: 640px) {
    .bc-holdings-table__pagination {
      align-items: flex-start;
      flex-direction: column;
    }
    .bc-holdings-table__pagination-controls {
      width: 100%;
      justify-content: space-between;
    }
  }
</style>
