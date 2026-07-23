<script lang="ts">
  import ChevronsDownUp from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import CircleAlert from "@lucide/svelte/icons/circle-alert";
  import X from "@lucide/svelte/icons/x";
  import {
    FilterCommandPicker,
    FormField,
    FormSectionHeader,
    type FilterCommandOption,
  } from "@stevejuma/ui/forms";
  import * as Alert from "@stevejuma/ui/shadcn/alert";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Sheet from "@stevejuma/ui/shadcn/sheet";
  import * as Tooltip from "@stevejuma/ui/shadcn/tooltip";

  export type AccountReplacementSummary = {
    changedCount: number;
    skippedCount?: number;
  };

  export type DuplicateDeletionSummary = {
    groupCount: number;
    deleteCount: number;
    keepCount: number;
    skippedCount?: number;
  };

  let {
    open = $bindable(false),
    recordCount,
    fromAccount = $bindable(""),
    toAccount = $bindable(""),
    fromOptions,
    toOptions,
    replacement,
    duplicates,
    applying = false,
    errors = [],
    status,
    onApplyReplacement = () => {},
    onDeleteDuplicates = () => {},
    onClosed = () => {},
  }: {
    open?: boolean;
    recordCount: number;
    fromAccount?: string;
    toAccount?: string;
    fromOptions: readonly FilterCommandOption[];
    toOptions: readonly FilterCommandOption[];
    /** Counts calculated by the application from the selected records. */
    replacement: AccountReplacementSummary;
    /** Duplicate analysis calculated by the application from the selected records. */
    duplicates: DuplicateDeletionSummary;
    applying?: boolean;
    errors?: readonly string[];
    /** Application feedback displayed after an action completes. */
    status?: string;
    onApplyReplacement?: (selection: {
      fromAccount: string;
      toAccount: string;
    }) => void;
    onDeleteDuplicates?: () => void;
    onClosed?: () => void;
  } = $props();

  const sectionTitleClass =
    "text-xs font-semibold uppercase tracking-wide text-muted-foreground";

  let openSections = $state<Record<"replace" | "duplicates", boolean>>({
    replace: true,
    duplicates: true,
  });
  let sheetTitleEl = $state<HTMLElement | null>(null);

  const canApply = $derived(
    Boolean(fromAccount) &&
      Boolean(toAccount) &&
      fromAccount !== toAccount &&
      replacement.changedCount > 0 &&
      !applying,
  );
  const canDeleteDuplicates = $derived(duplicates.deleteCount > 0 && !applying);
  const sectionsCollapsedAll = $derived(
    Object.values(openSections).every((sectionOpen) => sectionOpen === false),
  );

  function isSectionOpen(id: "replace" | "duplicates") {
    return openSections[id];
  }

  function toggleSection(id: "replace" | "duplicates") {
    openSections = { ...openSections, [id]: !isSectionOpen(id) };
  }

  function toggleCollapseAll() {
    const shouldExpand = sectionsCollapsedAll;
    openSections = { replace: shouldExpand, duplicates: shouldExpand };
  }

  function handleOpenChange(next: boolean) {
    open = next;
    if (!next) onClosed();
  }
</script>

<Tooltip.Provider delayDuration={0}>
  <Sheet.Root {open} onOpenChange={handleOpenChange}>
    <Sheet.Content
      side="right"
      class="flex w-full flex-col gap-0 p-0 sm:max-w-2xl [&>button.absolute]:hidden"
      data-account-bulk-action-sheet
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        sheetTitleEl?.focus();
      }}
    >
      <Sheet.Header
        class="border-border flex h-11 shrink-0 flex-row items-center gap-2 space-y-0 border-b px-3 text-left"
      >
        <div class="flex min-w-0 flex-1 items-center gap-1.5">
          <Sheet.Title
            bind:ref={sheetTitleEl}
            tabindex={-1}
            class="account-bulk-sheet-title min-w-0 truncate leading-none outline-none"
          >
            Bulk actions
          </Sheet.Title>
          <span
            class="bg-muted text-muted-foreground inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-medium tabular-nums"
            >{recordCount}</span
          >
        </div>
        <Sheet.Description class="sr-only">
          Bulk actions on {recordCount} selected record{recordCount === 1
            ? ""
            : "s"}.
        </Sheet.Description>
        <div class="ml-auto flex shrink-0 items-center gap-1">
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <Button
                  {...props}
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="size-8"
                  aria-label={sectionsCollapsedAll
                    ? "Expand all"
                    : "Collapse all"}
                  onclick={toggleCollapseAll}
                >
                  {#if sectionsCollapsedAll}
                    <ChevronsUpDown class="size-4" aria-hidden="true" />
                  {:else}
                    <ChevronsDownUp class="size-4" aria-hidden="true" />
                  {/if}
                </Button>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>
              {sectionsCollapsedAll ? "Expand all" : "Collapse all"}
            </Tooltip.Content>
          </Tooltip.Root>
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <Sheet.Close
                  {...props}
                  class="text-muted-foreground hover:bg-accent hover:text-accent-foreground focus-visible:ring-ring inline-flex size-8 items-center justify-center rounded-md transition-colors focus-visible:ring-2 focus-visible:outline-none"
                  aria-label="Close"
                >
                  <X class="size-4" aria-hidden="true" />
                  <span class="sr-only">Close</span>
                </Sheet.Close>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>Close</Tooltip.Content>
          </Tooltip.Root>
        </div>
      </Sheet.Header>

      <div class="min-h-0 flex-1 overflow-y-auto px-3 py-3">
        {#if errors.length}
          <Alert.Root variant="destructive" class="mb-3">
            <CircleAlert />
            <Alert.Title>Could not apply bulk action</Alert.Title>
            <Alert.Description class="whitespace-pre-wrap"
              >{errors.join("\n")}</Alert.Description
            >
          </Alert.Root>
        {/if}

        {#if status}
          <p class="text-muted-foreground mb-3 text-sm" role="status">
            {status}
          </p>
        {/if}

        <div class="account-bulk-form flex min-w-0 flex-col gap-6 pl-6">
          <section class="flex flex-col gap-2">
            <FormSectionHeader
              title="Replace"
              index={0}
              total={2}
              titleClass={sectionTitleClass}
              editable={false}
              movable={false}
              removable={false}
              titleToggleable={true}
              open={isSectionOpen("replace")}
              onToggle={() => toggleSection("replace")}
            />
            {#if isSectionOpen("replace")}
              <div class="account-bulk-section-body">
                <div class="ui-structured-form">
                  <FormField label="Account is" as="div" align="center">
                    <FilterCommandPicker
                      fullWidth
                      label="Account"
                      ariaLabel="Account to replace"
                      placeholder="Filter accounts…"
                      value={fromAccount}
                      options={[...fromOptions]}
                      onChange={(next) => {
                        fromAccount = next;
                      }}
                    />
                  </FormField>
                  <FormField label="Replace with" as="div" align="center">
                    <FilterCommandPicker
                      fullWidth
                      allowCustom={true}
                      label="Replacement account"
                      ariaLabel="Replacement account"
                      placeholder="Filter or type an account…"
                      value={toAccount}
                      options={[...toOptions]}
                      onChange={(next) => {
                        toAccount = next;
                      }}
                    />
                  </FormField>
                </div>
                {#if fromAccount && toAccount && fromAccount !== toAccount}
                  <p class="text-muted-foreground text-xs">
                    {replacement.changedCount} record{replacement.changedCount ===
                    1
                      ? ""
                      : "s"} will be updated{#if replacement.skippedCount}
                      ; {replacement.skippedCount} skipped{/if}.
                  </p>
                {/if}
                <Button
                  type="button"
                  disabled={!canApply}
                  onclick={() => onApplyReplacement({ fromAccount, toAccount })}
                >
                  {applying ? "Applying…" : "Apply"}
                </Button>
              </div>
            {/if}
          </section>

          <section class="flex flex-col gap-2">
            <FormSectionHeader
              title="Delete duplicates"
              index={1}
              total={2}
              titleClass={sectionTitleClass}
              editable={false}
              movable={false}
              removable={false}
              titleToggleable={true}
              open={isSectionOpen("duplicates")}
              onToggle={() => toggleSection("duplicates")}
            />
            {#if isSectionOpen("duplicates")}
              <div class="account-bulk-section-body">
                <p class="text-muted-foreground text-xs">
                  {#if duplicates.groupCount === 0}
                    No duplicates found in the selection. Matching uses a source
                    fingerprint when present, otherwise the record identity and
                    posting amounts.
                  {:else}
                    {duplicates.groupCount} duplicate group{duplicates.groupCount ===
                    1
                      ? ""
                      : "s"} · {duplicates.deleteCount} record{duplicates.deleteCount ===
                    1
                      ? ""
                      : "s"} will be deleted · {duplicates.keepCount} kept{#if duplicates.skippedCount}
                      ; {duplicates.skippedCount} skipped (no source){/if}.
                  {/if}
                </p>
                <Button
                  type="button"
                  variant="destructive"
                  disabled={!canDeleteDuplicates}
                  aria-label="Delete duplicate records"
                  onclick={onDeleteDuplicates}
                >
                  {applying ? "Deleting…" : "Delete duplicates"}
                </Button>
              </div>
            {/if}
          </section>
        </div>
      </div>
    </Sheet.Content>
  </Sheet.Root>
</Tooltip.Provider>

<style>
  .account-bulk-form :global(.ui-structured-form) {
    min-width: 0;
  }

  .account-bulk-section-body {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.75rem;
    padding-left: 0.5rem;
  }

  :global(.account-bulk-sheet-title),
  .account-bulk-form :global(.cv-form-section-title-toggle),
  .account-bulk-form :global(.cv-form-section-title-row h3) {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }
</style>
