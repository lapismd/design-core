<script lang="ts">
  import {
    FilterCommandPicker,
    type FilterCommandOption,
  } from "@stevejuma/ui/forms";
  import * as AlertDialog from "@stevejuma/ui/shadcn/alert-dialog";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Table from "@stevejuma/ui/shadcn/table";
  import * as Tabs from "@stevejuma/ui/shadcn/tabs";

  export type ImportMappingColumn = {
    id: string;
    label: string;
    align?: "left" | "right";
  };

  export type ImportMappingRow = {
    id: string;
    /** A concise description used for the source editor's accessible name. */
    label: string;
    account: string;
    values: Readonly<Record<string, string | number | null | undefined>>;
    /** Explain why this row needs an account choice without deriving matches here. */
    accountHint?: string;
  };

  export type ImportMappingTab = "categorized" | "uncategorized";

  let {
    fileName,
    columns,
    categorizedRows,
    uncategorizedRows = [],
    accountOptions,
    activeTab = "categorized",
    emptyCategorizedLabel = "No categorized import rows.",
    emptyUncategorizedLabel = "Every imported row has an account.",
    onActiveTabChange = () => {},
    onAccountChange = () => {},
    onOpenSource,
    onReset,
  }: {
    fileName: string;
    columns: readonly ImportMappingColumn[];
    categorizedRows: readonly ImportMappingRow[];
    uncategorizedRows?: readonly ImportMappingRow[];
    accountOptions: FilterCommandOption[];
    activeTab?: ImportMappingTab;
    emptyCategorizedLabel?: string;
    emptyUncategorizedLabel?: string;
    onActiveTabChange?: (tab: ImportMappingTab) => void;
    /** Persist the selected account and any source rewrite in the application layer. */
    onAccountChange?: (row: ImportMappingRow, account: string) => void;
    /** Open the application's source editor for this imported row. */
    onOpenSource?: (row: ImportMappingRow) => void;
    /** Reset the application's imported-file state after the confirmation. */
    onReset?: () => void;
  } = $props();

  let resetOpen = $state(false);
  const rows = $derived(
    activeTab === "categorized" ? categorizedRows : uncategorizedRows,
  );
  const emptyLabel = $derived(
    activeTab === "categorized"
      ? emptyCategorizedLabel
      : emptyUncategorizedLabel,
  );

  function displayCell(value: string | number | null | undefined) {
    return value == null || value === "" ? "—" : String(value);
  }

  function changeTab(next: string) {
    if (next === "categorized" || next === "uncategorized") {
      onActiveTabChange(next);
    }
  }

  function confirmReset() {
    resetOpen = false;
    onReset?.();
  }
</script>

<section class="bc-import-mapping" aria-label="Import mapping">
  <header class="bc-import-mapping__file-header">
    <div class="bc-import-mapping__file-copy">
      <p class="bc-import-mapping__eyebrow">
        Import file
      </p>
      <h2 class="bc-import-mapping__file-name">
        {fileName}
      </h2>
    </div>
    {#if onReset}
      <AlertDialog.Root bind:open={resetOpen}>
        <AlertDialog.Trigger>
          {#snippet child({ props })}
            <Button {...props} type="button" variant="outline" size="sm">
              Reset mapping
            </Button>
          {/snippet}
        </AlertDialog.Trigger>
        <AlertDialog.Content>
          <AlertDialog.Header>
            <AlertDialog.Title>Reset import mapping?</AlertDialog.Title>
            <AlertDialog.Description>
              This removes the account choices associated with {fileName}. The
              application will restore the original imported data.
            </AlertDialog.Description>
          </AlertDialog.Header>
          <AlertDialog.Footer>
            <AlertDialog.Cancel>Cancel</AlertDialog.Cancel>
            <AlertDialog.Action onclick={confirmReset}
              >Confirm reset</AlertDialog.Action
            >
          </AlertDialog.Footer>
        </AlertDialog.Content>
      </AlertDialog.Root>
    {/if}
  </header>

  <div class="bc-import-mapping__table-panel">
    <div class="bc-import-mapping__toolbar">
      <Tabs.Root value={activeTab} onValueChange={changeTab}>
        <Tabs.List aria-label="Import mapping rows">
          <Tabs.Trigger value="categorized">
            Categorized ({categorizedRows.length})
          </Tabs.Trigger>
          {#if uncategorizedRows.length}
            <Tabs.Trigger value="uncategorized">
              Needs account ({uncategorizedRows.length})
            </Tabs.Trigger>
          {/if}
        </Tabs.List>
      </Tabs.Root>
      <p class="bc-import-mapping__hint">
        Choose an account for each imported row.
      </p>
    </div>

    <div class="bc-import-mapping__scroll">
      <Table.Root class="bc-import-mapping__table">
        <Table.Header class="bc-import-mapping__table-header">
          <Table.Row class="bc-import-mapping__header-row">
            {#if onOpenSource}
              <Table.Head class="bc-import-mapping__source-heading">
                <span class="bc-import-mapping__source-label">Source</span>
              </Table.Head>
            {/if}
            <Table.Head
              class="bc-import-mapping__account-heading"
            >
              Account
            </Table.Head>
            {#each columns as column (column.id)}
              <Table.Head
                class={column.align === "right"
                  ? "bc-import-mapping__heading bc-import-mapping__heading--right"
                  : "bc-import-mapping__heading"}
              >
                {column.label}
              </Table.Head>
            {/each}
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each rows as row (row.id)}
            <Table.Row>
              {#if onOpenSource}
                <Table.Cell class="bc-import-mapping__source-cell">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="bc-import-mapping__source-button"
                    aria-label={`Edit source for ${row.label}`}
                    onclick={() => onOpenSource(row)}
                  >
                    Source
                  </Button>
                </Table.Cell>
              {/if}
              <Table.Cell class="bc-import-mapping__account-cell">
                <div class="bc-import-mapping__account-control">
                  <FilterCommandPicker
                    value={row.account}
                    options={accountOptions}
                    label={`Account for ${row.label}`}
                    fullWidth
                    onChange={(account) => onAccountChange(row, account)}
                  />
                  {#if row.accountHint}
                    <p class="bc-import-mapping__account-hint">
                      {row.accountHint}
                    </p>
                  {/if}
                </div>
              </Table.Cell>
              {#each columns as column (column.id)}
                <Table.Cell
                  class={column.align === "right"
                    ? "bc-import-mapping__cell bc-import-mapping__cell--right"
                    : "bc-import-mapping__cell"}
                >
                  {displayCell(row.values[column.id])}
                </Table.Cell>
              {/each}
            </Table.Row>
          {:else}
            <Table.Row>
              <Table.Cell
                colspan={columns.length + (onOpenSource ? 2 : 1)}
                class="bc-import-mapping__empty"
              >
                {emptyLabel}
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  </div>
</section>

<style>
  .bc-import-mapping {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--ui-beancount-space-4);
  }

  .bc-import-mapping__file-header,
  .bc-import-mapping__toolbar {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-import-mapping__file-header {
    border: 1px solid color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    padding: var(--ui-beancount-space-4);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-import-mapping__file-copy {
    min-width: 0;
  }

  .bc-import-mapping__eyebrow {
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  .bc-import-mapping__file-name {
    margin-block-start: var(--ui-beancount-space-1);
    overflow: hidden;
    color: var(--ui-beancount-foreground);
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .bc-import-mapping__table-panel {
    min-width: 0;
    overflow: hidden;
    border: 1px solid color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-import-mapping__toolbar {
    border-block-end: 1px solid var(--ui-beancount-border);
    padding: var(--ui-beancount-space-3);
  }

  .bc-import-mapping__hint,
  .bc-import-mapping__account-hint {
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.75rem;
  }

  .bc-import-mapping__account-hint {
    line-height: 1.375;
  }

  .bc-import-mapping__scroll {
    max-height: 34rem;
    overflow: auto;
  }

  :global(.bc-import-mapping__table) {
    min-width: 52rem;
    font-size: 0.875rem;
  }

  :global(.bc-import-mapping__table-header) {
    position: sticky;
    z-index: 10;
    top: 0;
    background-color: var(--ui-beancount-surface-muted);
    color: var(--ui-beancount-muted-foreground);
  }

  :global(.bc-import-mapping__header-row:hover) {
    background-color: var(--ui-beancount-surface-muted);
  }

  :global(.bc-import-mapping__source-heading) {
    width: 3rem;
    padding: var(--ui-beancount-space-3);
  }

  .bc-import-mapping__source-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  :global(.bc-import-mapping__account-heading) {
    min-width: 16rem;
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  :global(.bc-import-mapping__heading) {
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  :global(.bc-import-mapping__heading--right) {
    text-align: right;
  }

  :global(.bc-import-mapping__source-cell) {
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-3);
  }

  :global(.bc-import-mapping__source-button) {
    height: var(--ui-beancount-compact-control-height);
    padding-inline: var(--ui-beancount-space-2);
    font-size: 0.75rem;
  }

  :global(.bc-import-mapping__account-cell) {
    min-width: 16rem;
    vertical-align: top;
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-4);
  }

  .bc-import-mapping__account-control {
    display: flex;
    min-width: 14rem;
    flex-direction: column;
    gap: var(--ui-beancount-space-1);
  }

  :global(.bc-import-mapping__cell) {
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
    font-family: var(--font-mono);
  }

  :global(.bc-import-mapping__cell--right) {
    text-align: right;
    font-variant-numeric: tabular-nums;
  }

  :global(.bc-import-mapping__empty) {
    height: 7rem;
    padding-inline: var(--ui-beancount-space-4);
    color: var(--ui-beancount-muted-foreground);
    text-align: center;
    font-size: 0.875rem;
  }

  @media (min-width: 640px) {
    .bc-import-mapping__file-header,
    .bc-import-mapping__toolbar {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
  }
</style>
