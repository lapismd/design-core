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

  const sectionTitleClass = "bc-account-bulk-sheet__section-title";

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
      class="bc-account-bulk-sheet"
      data-account-bulk-action-sheet
      onOpenAutoFocus={(event) => {
        event.preventDefault();
        sheetTitleEl?.focus();
      }}
    >
      <Sheet.Header
        class="bc-account-bulk-sheet__header"
      >
        <div class="bc-account-bulk-sheet__heading">
          <Sheet.Title
            bind:ref={sheetTitleEl}
            tabindex={-1}
            class="bc-account-bulk-sheet__title"
          >
            Bulk actions
          </Sheet.Title>
          <span
            class="bc-account-bulk-sheet__count"
            >{recordCount}</span
          >
        </div>
        <Sheet.Description class="bc-account-bulk-sheet__description">
          Bulk actions on {recordCount} selected record{recordCount === 1
            ? ""
            : "s"}.
        </Sheet.Description>
        <div class="bc-account-bulk-sheet__actions">
          <Tooltip.Root>
            <Tooltip.Trigger>
              {#snippet child({ props })}
                <Button
                  {...props}
                  type="button"
                  variant="ghost"
                  size="icon"
                  class="bc-account-bulk-sheet__icon-button"
                  aria-label={sectionsCollapsedAll
                    ? "Expand all"
                    : "Collapse all"}
                  onclick={toggleCollapseAll}
                >
                  {#if sectionsCollapsedAll}
                    <ChevronsUpDown
                      class="bc-account-bulk-sheet__icon"
                      aria-hidden="true"
                    />
                  {:else}
                    <ChevronsDownUp
                      class="bc-account-bulk-sheet__icon"
                      aria-hidden="true"
                    />
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
                  class="bc-account-bulk-sheet__close"
                  aria-label="Close"
                >
                  <X class="bc-account-bulk-sheet__icon" aria-hidden="true" />
                  <span class="bc-account-bulk-sheet__close-label">Close</span>
                </Sheet.Close>
              {/snippet}
            </Tooltip.Trigger>
            <Tooltip.Content>Close</Tooltip.Content>
          </Tooltip.Root>
        </div>
      </Sheet.Header>

      <div class="bc-account-bulk-sheet__body">
        {#if errors.length}
          <Alert.Root variant="destructive" class="bc-account-bulk-sheet__alert">
            <CircleAlert />
            <Alert.Title>Could not apply bulk action</Alert.Title>
            <Alert.Description class="bc-account-bulk-sheet__alert-description"
              >{errors.join("\n")}</Alert.Description
            >
          </Alert.Root>
        {/if}

        {#if status}
          <p class="bc-account-bulk-sheet__status" role="status">
            {status}
          </p>
        {/if}

        <div class="bc-account-bulk-sheet__form">
          <section class="bc-account-bulk-sheet__section">
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
                  <p class="bc-account-bulk-sheet__summary">
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

          <section class="bc-account-bulk-sheet__section">
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
                <p class="bc-account-bulk-sheet__summary">
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
  :global(.bc-account-bulk-sheet) {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: 0;
    padding: 0;
  }

  :global(.bc-account-bulk-sheet > button.absolute) {
    display: none;
  }

  :global(.bc-account-bulk-sheet__header) {
    display: flex;
    height: 2.75rem;
    flex-shrink: 0;
    flex-direction: row;
    align-items: center;
    gap: var(--ui-beancount-space-2);
    border-block-end: 1px solid var(--ui-beancount-border);
    padding-inline: var(--ui-beancount-space-3);
    text-align: left;
  }

  .bc-account-bulk-sheet__heading {
    display: flex;
    min-width: 0;
    flex: 1;
    align-items: center;
    gap: calc(var(--ui-beancount-space-3) / 2);
  }

  :global(.bc-account-bulk-sheet__title) {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    line-height: 1;
    outline: none;
  }

  .bc-account-bulk-sheet__count {
    display: inline-flex;
    min-width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    background-color: var(--ui-beancount-surface-muted);
    padding-inline: calc(var(--ui-beancount-space-3) / 2);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.6875rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }

  :global(.bc-account-bulk-sheet__description),
  .bc-account-bulk-sheet__close-label {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
    clip: rect(0 0 0 0);
    white-space: nowrap;
  }

  .bc-account-bulk-sheet__actions {
    display: flex;
    flex-shrink: 0;
    align-items: center;
    gap: var(--ui-beancount-space-1);
    margin-inline-start: auto;
  }

  :global(.bc-account-bulk-sheet__icon-button),
  :global(.bc-account-bulk-sheet__close) {
    display: inline-flex;
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    color: var(--ui-beancount-muted-foreground);
    outline: none;
    transition: color 150ms ease, background-color 150ms ease;
  }

  :global(.bc-account-bulk-sheet__icon-button:hover),
  :global(.bc-account-bulk-sheet__close:hover) {
    background-color: var(--accent);
    color: var(--accent-foreground);
  }

  :global(.bc-account-bulk-sheet__icon-button:focus-visible),
  :global(.bc-account-bulk-sheet__close:focus-visible) {
    outline: 2px solid var(--ui-beancount-focus-ring);
  }

  :global(.bc-account-bulk-sheet__icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
  }

  .bc-account-bulk-sheet__body {
    min-height: 0;
    flex: 1;
    overflow-y: auto;
    padding: var(--ui-beancount-space-3);
  }

  :global(.bc-account-bulk-sheet__alert),
  .bc-account-bulk-sheet__status {
    margin-block-end: var(--ui-beancount-space-3);
  }

  :global(.bc-account-bulk-sheet__alert-description) {
    white-space: pre-wrap;
  }

  .bc-account-bulk-sheet__status,
  .bc-account-bulk-sheet__summary {
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-account-bulk-sheet__status {
    font-size: 0.875rem;
  }

  .bc-account-bulk-sheet__form {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: calc(var(--ui-beancount-space-3) * 2);
    padding-inline-start: calc(var(--ui-beancount-space-3) * 2);
  }

  .bc-account-bulk-sheet__section {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-2);
  }

  .bc-account-bulk-sheet__summary {
    font-size: 0.75rem;
  }

  .bc-account-bulk-sheet__form :global(.ui-structured-form) {
    min-width: 0;
  }

  .account-bulk-section-body {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: 0.75rem;
    padding-left: 0.5rem;
  }

  :global(.bc-account-bulk-sheet__title),
  :global(.bc-account-bulk-sheet__section-title),
  .bc-account-bulk-sheet__form :global(.cv-form-section-title-toggle),
  .bc-account-bulk-sheet__form :global(.cv-form-section-title-row h3) {
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  :global(.bc-account-bulk-sheet__section-title) {
    color: var(--ui-beancount-muted-foreground);
  }

  @media (min-width: 640px) {
    :global(.bc-account-bulk-sheet) {
      max-width: 42rem;
    }
  }
</style>
