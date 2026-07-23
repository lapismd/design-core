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

<section class="flex min-w-0 flex-col gap-4" aria-label="Import mapping">
  <header
    class="border-border/80 bg-card flex flex-col gap-3 rounded-xl border p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="min-w-0">
      <p
        class="text-muted-foreground text-xs font-semibold tracking-wide uppercase"
      >
        Import file
      </p>
      <h2 class="text-foreground mt-1 truncate text-sm font-semibold">
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

  <div class="border-border/80 bg-card min-w-0 rounded-xl border shadow-sm">
    <div
      class="border-border flex flex-col gap-3 border-b p-3 sm:flex-row sm:items-center sm:justify-between"
    >
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
      <p class="text-muted-foreground text-xs">
        Choose an account for each imported row.
      </p>
    </div>

    <div class="max-h-[34rem] overflow-auto">
      <Table.Root class="min-w-[52rem] text-sm">
        <Table.Header class="bg-muted text-muted-foreground sticky top-0 z-10">
          <Table.Row class="hover:bg-muted">
            {#if onOpenSource}
              <Table.Head class="w-12 px-3 py-3">
                <span class="sr-only">Source</span>
              </Table.Head>
            {/if}
            <Table.Head
              class="min-w-64 px-4 py-3 text-xs font-semibold tracking-wide uppercase"
            >
              Account
            </Table.Head>
            {#each columns as column (column.id)}
              <Table.Head
                class={column.align === "right"
                  ? "px-4 py-3 text-right text-xs font-semibold tracking-wide uppercase"
                  : "px-4 py-3 text-xs font-semibold tracking-wide uppercase"}
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
                <Table.Cell class="px-3 py-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    class="h-8 px-2 text-xs"
                    aria-label={`Edit source for ${row.label}`}
                    onclick={() => onOpenSource(row)}
                  >
                    Source
                  </Button>
                </Table.Cell>
              {/if}
              <Table.Cell class="min-w-64 px-4 py-2 align-top">
                <div class="flex min-w-56 flex-col gap-1">
                  <FilterCommandPicker
                    value={row.account}
                    options={accountOptions}
                    label={`Account for ${row.label}`}
                    fullWidth
                    onChange={(account) => onAccountChange(row, account)}
                  />
                  {#if row.accountHint}
                    <p class="text-muted-foreground text-xs leading-snug">
                      {row.accountHint}
                    </p>
                  {/if}
                </div>
              </Table.Cell>
              {#each columns as column (column.id)}
                <Table.Cell
                  class={column.align === "right"
                    ? "px-4 py-3 text-right font-mono tabular-nums"
                    : "px-4 py-3 font-mono"}
                >
                  {displayCell(row.values[column.id])}
                </Table.Cell>
              {/each}
            </Table.Row>
          {:else}
            <Table.Row>
              <Table.Cell
                colspan={columns.length + (onOpenSource ? 2 : 1)}
                class="h-28 px-4 text-center text-sm text-muted-foreground"
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
