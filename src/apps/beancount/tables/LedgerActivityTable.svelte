<script lang="ts">
  import { untrack } from "svelte";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronUp from "@lucide/svelte/icons/chevron-up";
  import FileText from "@lucide/svelte/icons/file-text";
  import Info from "@lucide/svelte/icons/info";
  import PagePagination from "../navigation/PagePagination.svelte";
  import AccountAvatar from "../pickers/AccountAvatar.svelte";
  import { SegmentedControl } from "@stevejuma/ui/forms";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import * as Select from "@stevejuma/ui/shadcn/select";

  export type LedgerActivityAvatar = {
    imageUrl?: string;
    /** Describe a meaningful image; omit for a decorative brand mark. */
    alt?: string;
    /** Visible fallback, typically a merchant or record initial. */
    fallback?: string;
  };

  export type LedgerActivityMerchant = {
    imageUrl: string;
    alt: string;
  };

  /** Display-ready visual metadata for an account-derived posting avatar. */
  export type LedgerActivityAccountAppearance = {
    color?: string;
    icon?: string;
    merchantLogoUrl?: string;
  };

  export type LedgerActivityPosting = {
    id?: string;
    account: string;
    amount?: string;
    href?: string;
    /** Optional account identity shown beside the posting label. */
    avatar?: LedgerActivityAvatar;
    /** Optional host-resolved account appearance for account-avatar mode. */
    appearance?: LedgerActivityAccountAppearance;
  };

  export type LedgerActivityRecord = {
    id: string;
    description: string;
    account?: string;
    amount: string;
    balance?: string;
    /** Generic record identity. Prefer this to the legacy `merchant` field. */
    avatar?: LedgerActivityAvatar;
    /** A display-ready posting breakdown for transaction-style activity. */
    postings?: readonly LedgerActivityPosting[];
    /** @deprecated Use `avatar` for new display models. */
    merchant?: LedgerActivityMerchant;
    /** Secondary text, such as transaction narration or posting detail. */
    detail?: string;
  };

  export type LedgerActivityGroup = {
    id: string;
    date: string;
    records: readonly LedgerActivityRecord[];
    balance?: string;
    summary?: {
      start: string;
      change: string;
      final: string;
    };
  };

  export type LedgerActivityTimeframe = {
    id: string;
    label: string;
  };

  export type LedgerActivityPagination = {
    page: number;
    pageCount: number;
    /** A fully formatted summary, for example “2 of 4”. */
    resultLabel: string;
    pageSize?: number;
    pageSizes?: readonly number[];
  };

  export type LedgerActivitySelectionScope = {
    /** The total matching count calculated by the host, across all pages. */
    totalRecordCount: number;
    /** Plural display noun, for example “journal records”. */
    recordLabel?: string;
  };

  let {
    groups,
    selectedIds = [],
    selectable = true,
    ariaLabel = "Ledger activity",
    dateHeading = "Date",
    amountHeading = "Amount",
    balanceDescription = "Running balance",
    emptyMessage = "No dated records match the current filter.",
    showAccountAvatars = false,
    timeframes = [],
    timeframe,
    pagination,
    selectionScope,
    onSelectedIdsChange = () => {},
    onOpenRecord,
    onTimeframeChange = () => {},
    onPageChange = () => {},
    onPageSizeChange = () => {},
    onRequestSelectAllMatching = () => {},
  }: {
    groups: readonly LedgerActivityGroup[];
    selectedIds?: readonly string[];
    selectable?: boolean;
    ariaLabel?: string;
    /** Column heading for the activity date group. */
    dateHeading?: string;
    amountHeading?: string;
    balanceDescription?: string;
    emptyMessage?: string;
    /**
     * Renders posting accounts with their deterministic Beancount account
     * identity. The host still supplies optional account routes in `href`.
     */
    showAccountAvatars?: boolean;
    /** Two or three display modes, such as posted and upcoming activity. */
    timeframes?: readonly LedgerActivityTimeframe[];
    timeframe?: string;
    /**
     * Controlled page information. Supply only the current page's groups;
     * this component does not derive pages from the complete activity set.
     */
    pagination?: LedgerActivityPagination;
    /**
     * Enables the cross-page selection prompt when this page's records are
     * selected. The host supplies the total matching count and performs the
     * all-matching selection when requested.
     */
    selectionScope?: LedgerActivitySelectionScope;
    onSelectedIdsChange?: (ids: string[]) => void;
    onOpenRecord?: (record: LedgerActivityRecord) => void;
    onTimeframeChange?: (timeframe: string) => void;
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;
    onRequestSelectAllMatching?: () => void;
  } = $props();

  let expandedGroupIds = $state<Set<string>>(
    new Set(untrack(() => groups).map((group) => group.id)),
  );
  let expandedGroupsSignature = $state(
    untrack(() => groups.map((group) => group.id).join("|")),
  );

  $effect(() => {
    const nextSignature = groups.map((group) => group.id).join("|");
    if (nextSignature === expandedGroupsSignature) return;

    expandedGroupsSignature = nextSignature;
    expandedGroupIds = new Set(groups[0] ? [groups[0].id] : []);
  });

  const recordIds = $derived(
    groups.flatMap((group) => group.records.map((record) => record.id)),
  );
  const selectedIdSet = $derived(new Set(selectedIds));
  const allSelected = $derived(
    recordIds.length > 0 && recordIds.every((id) => selectedIdSet.has(id)),
  );
  const someSelected = $derived(
    !allSelected && recordIds.some((id) => selectedIdSet.has(id)),
  );
  const totalMatchingRecordCount = $derived(
    Math.max(0, selectionScope?.totalRecordCount ?? recordIds.length),
  );
  const allMatchingSelected = $derived(
    Boolean(selectionScope) &&
      totalMatchingRecordCount > 0 &&
      selectedIdSet.size === totalMatchingRecordCount,
  );
  const showSelectionScope = $derived(
    Boolean(selectionScope) &&
      totalMatchingRecordCount > recordIds.length &&
      recordIds.length > 0 &&
      (allSelected || allMatchingSelected),
  );

  function updateSelection(ids: Iterable<string>) {
    onSelectedIdsChange([...new Set(ids)]);
  }

  function toggleRecord(id: string, checked: boolean) {
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    updateSelection(next);
  }

  function toggleGroup(group: LedgerActivityGroup, checked: boolean) {
    const next = new Set(selectedIds);
    for (const record of group.records) {
      if (checked) next.add(record.id);
      else next.delete(record.id);
    }
    updateSelection(next);
  }

  function toggleAll(checked: boolean) {
    updateSelection(checked ? recordIds : []);
  }

  function clearSelection() {
    updateSelection([]);
  }

  function toggleGroupDisclosure(id: string) {
    const next = new Set(expandedGroupIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expandedGroupIds = next;
  }

  function groupSelection(
    group: LedgerActivityGroup,
  ): "checked" | "unchecked" | "indeterminate" {
    const count = group.records.filter((record) =>
      selectedIdSet.has(record.id),
    ).length;
    if (count === 0) return "unchecked";
    return count === group.records.length ? "checked" : "indeterminate";
  }

  function setIndeterminate(node: HTMLInputElement, value: boolean) {
    node.indeterminate = value;
    return {
      update(next: boolean) {
        node.indeterminate = next;
      },
    };
  }

  function avatarFor(record: LedgerActivityRecord): LedgerActivityAvatar {
    return record.avatar ?? record.merchant ?? {};
  }

  function setPageSize(value: string | undefined) {
    const pageSize = Number(value);
    if (pagination?.pageSizes?.includes(pageSize)) {
      onPageSizeChange(pageSize);
    }
  }

  function selectionRecordLabel() {
    return selectionScope?.recordLabel?.trim() || "records";
  }
</script>

<section class="bc-ledger-activity" aria-label={ariaLabel}>
  {#if timeframes.length > 1}
    <div class="bc-ledger-activity__timeframes">
      <SegmentedControl
        value={timeframe ?? timeframes[0]!.id}
        options={timeframes.map(({ id }) => id)}
        labels={Object.fromEntries(
          timeframes.map(({ id, label }) => [id, label]),
        )}
        ariaLabel="Activity timeframe"
        onChange={onTimeframeChange}
      />
    </div>
  {/if}
  <div
    class={selectable
      ? "activity-grid activity-grid--selectable bc-ledger-activity__header"
      : "activity-grid activity-grid--read-only bc-ledger-activity__header"}
  >
    {#if selectable}
      <input
        type="checkbox"
        checked={allSelected}
        use:setIndeterminate={someSelected}
        class="bc-ledger-activity__checkbox"
        aria-label="Select all visible records"
        onchange={(event) =>
          toggleAll((event.currentTarget as HTMLInputElement).checked)}
      />
    {/if}
    <span>{dateHeading}</span>
    <span class="bc-ledger-activity__amount-heading">{amountHeading}</span>
  </div>

  {#if selectable && showSelectionScope}
    <div class="bc-ledger-activity__selection-scope" role="status">
      {#if allMatchingSelected}
        All {totalMatchingRecordCount}
        {selectionRecordLabel()} selected.
        <Button
          type="button"
          variant="link"
          size="sm"
          class="bc-ledger-activity__selection-action"
          onclick={clearSelection}
        >
          Clear selection
        </Button>
      {:else}
        All {recordIds.length} records on this page are selected.
        <Button
          type="button"
          variant="link"
          size="sm"
          class="bc-ledger-activity__selection-action"
          onclick={onRequestSelectAllMatching}
        >
          Select all {totalMatchingRecordCount}
          {selectionRecordLabel()}
        </Button>
      {/if}
    </div>
  {/if}

  {#if groups.length}
    <div class="bc-ledger-activity__groups">
      {#each groups as group (group.id)}
        {@const expanded = expandedGroupIds.has(group.id)}
        {@const groupState = groupSelection(group)}
        <section
          class="bc-ledger-activity__group-card"
          aria-labelledby={`${group.id}-heading`}
        >
          <div
            class={selectable
              ? "activity-grid activity-grid--selectable bc-ledger-activity__group"
              : "activity-grid activity-grid--read-only bc-ledger-activity__group"}
          >
            {#if selectable}
              <input
                type="checkbox"
                checked={groupState === "checked"}
                use:setIndeterminate={groupState === "indeterminate"}
                class="bc-ledger-activity__checkbox"
                aria-label={`Select records on ${group.date}`}
                onchange={(event) =>
                  toggleGroup(
                    group,
                    (event.currentTarget as HTMLInputElement).checked,
                  )}
              />
            {/if}
            <button
              type="button"
              class="bc-ledger-activity__group-toggle"
              aria-expanded={expanded}
              aria-controls={`${group.id}-details`}
              aria-label={`${expanded ? "Collapse" : "Expand"} ${group.date}`}
              onclick={() => toggleGroupDisclosure(group.id)}
            >
              <span
                id={`${group.id}-heading`}
                role="heading"
                aria-level="2"
                class="bc-ledger-activity__date">{group.date}</span
              >
              <span class="bc-ledger-activity__record-count"
                >· {group.records.length}</span
              >
            </button>
            {#if group.balance}
              <span
                class="bc-ledger-activity__balance"
                aria-label={`${balanceDescription}: ${group.balance}`}
                >{group.balance}</span
              >
            {:else}
              <span aria-hidden="true"></span>
            {/if}
            <button
              type="button"
              class="bc-ledger-activity__balance-description"
              title={balanceDescription}
              aria-label="About this date's balance"
            >
              <Info class="bc-ledger-activity__icon" aria-hidden="true" />
            </button>
            <button
              type="button"
              class="bc-ledger-activity__group-disclosure"
              aria-expanded={expanded}
              aria-controls={`${group.id}-details`}
              aria-label={`${expanded ? "Hide" : "Show"} balance summary for ${group.date}`}
              onclick={() => toggleGroupDisclosure(group.id)}
            >
              {#if expanded}
                <ChevronUp
                  class="bc-ledger-activity__icon"
                  aria-hidden="true"
                />
              {:else}
                <ChevronDown
                  class="bc-ledger-activity__icon"
                  aria-hidden="true"
                />
              {/if}
            </button>
          </div>

          {#if expanded && group.summary}
            <div
              id={`${group.id}-details`}
              class="bc-ledger-activity__summary"
              aria-label={`Balance summary for ${group.date}`}
            >
              <span>Start balance</span>
              <span class="bc-ledger-activity__summary-rule"></span>
              <span class="bc-ledger-activity__summary-value">
                {group.summary.start}
              </span>
              <span>Net cash flow</span>
              <span class="bc-ledger-activity__summary-rule"></span>
              <span class="bc-ledger-activity__summary-value">
                {group.summary.change}
              </span>
              <span>Final balance</span>
              <span class="bc-ledger-activity__summary-rule"></span>
              <span
                class="bc-ledger-activity__summary-value bc-ledger-activity__summary-value--final"
              >
                {group.summary.final}
              </span>
            </div>
          {/if}
          <div class="bc-ledger-activity__records">
            <ul>
              {#each group.records as record (record.id)}
                <li
                  class={selectable
                    ? "activity-grid activity-grid--selectable bc-ledger-activity__record"
                    : "activity-grid activity-grid--read-only bc-ledger-activity__record"}
                >
                  {#if selectable}
                    <input
                      type="checkbox"
                      checked={selectedIdSet.has(record.id)}
                      aria-label={`Select ${record.description}`}
                      class="bc-ledger-activity__checkbox bc-ledger-activity__checkbox--record"
                      onchange={(event) =>
                        toggleRecord(
                          record.id,
                          (event.currentTarget as HTMLInputElement).checked,
                        )}
                    />
                  {/if}
                  {#if onOpenRecord}
                    <button
                      type="button"
                      class="bc-ledger-activity__record-action"
                      onclick={() => onOpenRecord(record)}
                    >
                      {@render ActivityRecord(record, true)}
                    </button>
                  {:else}
                    <div class="bc-ledger-activity__record-copy">
                      {@render ActivityRecord(record)}
                    </div>
                  {/if}
                  {#if record.postings?.length}
                    <div class="bc-ledger-activity__postings">
                      {#each record.postings as posting, index (`${record.id}-${posting.id ?? posting.account}-${index}`)}
                        <div class="bc-ledger-activity__posting">
                          <span class="bc-ledger-activity__posting-identity">
                            {#if showAccountAvatars}
                              <AccountAvatar
                                account={posting.account}
                                color={posting.appearance?.color}
                                icon={posting.appearance?.icon}
                                merchantLogoUrl={posting.appearance
                                  ?.merchantLogoUrl}
                                size="sm"
                              />
                            {:else if posting.avatar?.imageUrl}
                              <img
                                src={posting.avatar.imageUrl}
                                alt={posting.avatar.alt ?? ""}
                                class="bc-ledger-activity__posting-avatar-image"
                              />
                            {:else if posting.avatar?.fallback}
                              <span
                                class="bc-ledger-activity__posting-avatar-fallback"
                                aria-hidden="true"
                              >
                                {posting.avatar.fallback
                                  .slice(0, 1)
                                  .toUpperCase()}
                              </span>
                            {/if}
                            {#if posting.href}
                              <a
                                href={posting.href}
                                class="bc-ledger-activity__posting-link"
                                class:bc-ledger-activity__posting-link--identified={showAccountAvatars}
                                >{posting.account}</a
                              >
                            {:else}
                              <span
                                class="bc-ledger-activity__posting-account"
                                class:bc-ledger-activity__posting-account--identified={showAccountAvatars}
                                title={posting.account}>{posting.account}</span
                              >
                            {/if}
                          </span>
                          <span class="bc-ledger-activity__posting-amount"
                            >{posting.amount ?? "—"}</span
                          >
                        </div>
                      {/each}
                    </div>
                  {:else}
                    <div class="bc-ledger-activity__amount">
                      {record.amount}
                    </div>
                  {/if}
                </li>
              {/each}
            </ul>
          </div>
        </section>
      {/each}
    </div>
  {:else}
    <div class="bc-ledger-activity__empty">
      {emptyMessage}
    </div>
  {/if}

  {#if pagination && pagination.pageCount > 1}
    <div class="bc-ledger-activity__pagination" data-activity-pagination>
      <span class="bc-ledger-activity__result-label" role="status"
        >{pagination.resultLabel}</span
      >
      <div class="bc-ledger-activity__pagination-controls">
        {#if pagination.pageSize && pagination.pageSizes?.length}
          <div class="bc-ledger-activity__page-size">
            <span class="bc-ledger-activity__page-size-label"
              >Records per page</span
            >
            <Select.Root
              type="single"
              value={String(pagination.pageSize)}
              onValueChange={setPageSize}
            >
              <Select.Trigger
                aria-label="Records per page"
                class="bc-ledger-activity__page-size-select"
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
          ariaLabel={`${ariaLabel} pages`}
          {onPageChange}
        />
      </div>
    </div>
  {/if}
</section>

{#snippet ActivityRecord(record: LedgerActivityRecord, interactive = false)}
  {@const avatar = avatarFor(record)}
  <span class="bc-ledger-activity__identity">
    {#if avatar.imageUrl}
      <img
        src={avatar.imageUrl}
        alt={avatar.alt ?? ""}
        class="bc-ledger-activity__avatar-image"
      />
    {:else}
      <span class="bc-ledger-activity__avatar-fallback" aria-hidden="true">
        {#if avatar.fallback}
          {avatar.fallback.slice(0, 1).toUpperCase()}
        {:else}
          <FileText class="bc-ledger-activity__icon" />
        {/if}
      </span>
    {/if}
    <span class="bc-ledger-activity__identity-copy">
      <span
        class="bc-ledger-activity__record-description"
        class:bc-ledger-activity__record-description--interactive={interactive}
      >
        {record.description}
      </span>
      {#if record.account}
        <span class="bc-ledger-activity__record-account">{record.account}</span>
      {/if}
      {#if record.detail}
        <span class="bc-ledger-activity__record-detail">
          {record.detail}
        </span>
      {/if}
    </span>
  </span>
{/snippet}

<style>
  .activity-grid {
    display: grid;
  }

  .activity-grid--selectable {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .activity-grid--read-only {
    grid-template-columns: minmax(0, 1fr) auto;
  }

  .bc-ledger-activity {
    width: 100%;
  }
  .bc-ledger-activity__timeframes {
    margin-block-end: var(--ui-beancount-space-3);
  }
  .bc-ledger-activity__header {
    align-items: center;
    gap: var(--ui-beancount-space-4);
    border-radius: var(--radius-2xl);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 80%,
      transparent
    );
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-5);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }
  .bc-ledger-activity__checkbox {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    flex-shrink: 0;
    border-color: var(--ui-beancount-input-border);
    border-radius: var(--radius-sm);
    accent-color: var(--ui-beancount-accent);
    outline: none;
  }
  .bc-ledger-activity__checkbox:focus-visible,
  .bc-ledger-activity__group-toggle:focus-visible,
  .bc-ledger-activity__group-disclosure:focus-visible,
  .bc-ledger-activity__record-action:focus-visible,
  .bc-ledger-activity__posting-link:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
  }
  .bc-ledger-activity__checkbox--record {
    margin-block-start: calc(var(--ui-beancount-space-1) / 2);
  }
  .bc-ledger-activity__amount-heading,
  .bc-ledger-activity__balance,
  .bc-ledger-activity__amount,
  .bc-ledger-activity__postings {
    text-align: right;
  }
  .bc-ledger-activity__groups {
    display: grid;
    gap: var(--ui-beancount-space-3);
    margin-block-start: var(--ui-beancount-space-3);
  }
  .bc-ledger-activity__group-card {
    overflow: hidden;
    border-radius: var(--radius-2xl);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 80%,
      transparent
    );
  }
  .bc-ledger-activity__group {
    align-items: center;
    gap: var(--ui-beancount-space-3);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-5);
  }
  .bc-ledger-activity__group.activity-grid--selectable {
    grid-template-columns: auto minmax(0, 1fr) auto auto auto;
  }
  .bc-ledger-activity__group.activity-grid--read-only {
    grid-template-columns: minmax(0, 1fr) auto auto auto;
  }
  .bc-ledger-activity__group-toggle {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: var(--ui-beancount-space-2);
    outline: none;
    text-align: left;
  }
  :global(.bc-ledger-activity__icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    flex-shrink: 0;
    color: var(--ui-beancount-muted-foreground);
  }
  .bc-ledger-activity__date {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
    font-weight: 600;
  }
  .bc-ledger-activity__record-count,
  .bc-ledger-activity__balance,
  .bc-ledger-activity__balance-description {
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.75rem;
  }
  .bc-ledger-activity__balance {
    font-family: var(--font-mono);
    font-weight: var(--font-weight-semibold);
    font-variant-numeric: tabular-nums;
  }
  .bc-ledger-activity__balance-description,
  .bc-ledger-activity__group-disclosure {
    display: inline-flex;
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
    align-items: center;
    justify-content: center;
  }
  .bc-ledger-activity__group-disclosure {
    border-radius: var(--radius-md);
    color: var(--ui-beancount-muted-foreground);
    outline: none;
  }
  .bc-ledger-activity__group-disclosure:hover {
    background: var(--ui-beancount-sidebar-accent);
    color: var(--ui-beancount-sidebar-accent-foreground);
  }
  .bc-ledger-activity__summary {
    display: grid;
    gap: var(--ui-beancount-space-2) var(--ui-beancount-space-4);
    border-block-start: 1px dashed
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    padding: var(--ui-beancount-space-4) var(--ui-beancount-space-5);
    font-size: 0.875rem;
  }
  .bc-ledger-activity__summary-rule {
    display: none;
    border-block-start: 1px dashed
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    align-self: center;
  }
  .bc-ledger-activity__summary-value {
    text-align: right;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .bc-ledger-activity__summary-value--final {
    font-weight: 700;
  }
  .bc-ledger-activity__records {
    margin: var(--ui-beancount-space-1);
    overflow: hidden;
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }
  .bc-ledger-activity__records ul {
    margin: 0;
    padding: 0;
    list-style: none;
  }
  .bc-ledger-activity__record {
    align-items: flex-start;
    gap: var(--ui-beancount-space-4);
    border-block-end: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 70%, transparent);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-5);
    transition: background-color 150ms ease;
  }
  .bc-ledger-activity__record:last-child {
    border-block-end: 0;
  }
  .bc-ledger-activity__record:hover {
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 45%,
      transparent
    );
  }
  .bc-ledger-activity__record-action,
  .bc-ledger-activity__record-copy {
    min-width: 0;
    outline: none;
    text-align: left;
  }
  .bc-ledger-activity__postings {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--ui-beancount-space-1);
  }
  .bc-ledger-activity__posting {
    display: grid;
    min-width: 0;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--ui-beancount-space-3);
  }
  .bc-ledger-activity__posting-identity {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }
  .bc-ledger-activity__posting-link,
  .bc-ledger-activity__posting-account {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
    font-size: 0.75rem;
  }
  .bc-ledger-activity__posting-link {
    color: var(--ui-beancount-accent);
    outline: none;
    text-underline-offset: 4px;
  }
  .bc-ledger-activity__posting-link--identified {
    color: var(--ui-beancount-foreground);
  }
  .bc-ledger-activity__posting-link:hover,
  .bc-ledger-activity__record-description--interactive:hover {
    text-decoration: underline;
  }
  .bc-ledger-activity__posting-account {
    color: var(--ui-beancount-muted-foreground);
  }
  .bc-ledger-activity__posting-account--identified {
    color: var(--ui-beancount-foreground);
  }
  .bc-ledger-activity__posting-avatar-image,
  .bc-ledger-activity__posting-avatar-fallback {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    flex: none;
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 70%, transparent);
    border-radius: 999px;
  }
  .bc-ledger-activity__posting-avatar-image {
    object-fit: contain;
  }
  .bc-ledger-activity__posting-avatar-fallback {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: var(--ui-beancount-surface-muted);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-semibold);
  }
  .bc-ledger-activity__posting-amount,
  .bc-ledger-activity__amount {
    font-family: var(--font-mono);
    font-size: 0.875rem;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .bc-ledger-activity__amount {
    font-weight: 400;
  }
  .bc-ledger-activity__empty {
    margin-block-start: var(--ui-beancount-space-3);
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--radius-2xl);
    background: var(--ui-beancount-surface);
    padding: calc(var(--ui-beancount-space-3) * 4) var(--ui-beancount-space-5);
    color: var(--ui-beancount-muted-foreground);
    text-align: center;
    font-size: 0.875rem;
  }
  .bc-ledger-activity__selection-scope {
    margin-block: var(--ui-beancount-space-3);
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-muted);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }
  :global(.bc-ledger-activity__selection-action) {
    height: auto;
    padding: 0;
    color: var(--ui-beancount-accent);
    vertical-align: baseline;
  }
  .bc-ledger-activity__pagination {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
    margin-block-start: var(--ui-beancount-space-3);
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 80%, transparent);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
    box-shadow: var(--ui-beancount-shadow-panel);
  }
  .bc-ledger-activity__result-label,
  .bc-ledger-activity__page-size-label {
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }
  .bc-ledger-activity__pagination-controls {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }
  .bc-ledger-activity__page-size {
    display: none;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }
  :global(.bc-ledger-activity__page-size-select) {
    width: auto;
    min-width: calc(var(--ui-beancount-space-5) * 2);
  }
  .bc-ledger-activity__identity {
    display: flex;
    min-width: 0;
    align-items: flex-start;
    gap: var(--ui-beancount-space-2);
  }
  .bc-ledger-activity__avatar-image,
  .bc-ledger-activity__avatar-fallback {
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
    margin-block-start: calc(var(--ui-beancount-space-1) / 2);
    border: 1px solid
      color-mix(in srgb, var(--ui-beancount-border) 70%, transparent);
    border-radius: 999px;
  }
  .bc-ledger-activity__avatar-image {
    object-fit: contain;
  }
  .bc-ledger-activity__avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--ui-beancount-surface-muted);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
    font-weight: 600;
  }
  .bc-ledger-activity__identity-copy {
    min-width: 0;
  }
  .bc-ledger-activity__record-description {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
    font-weight: 500;
  }
  .bc-ledger-activity__record-account,
  .bc-ledger-activity__record-detail {
    display: block;
    overflow: hidden;
    color: var(--ui-beancount-muted-foreground);
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.75rem;
  }
  .bc-ledger-activity__record-account {
    margin-block-start: calc(var(--ui-beancount-space-1) / 2);
    font-family: var(--font-mono);
  }
  .bc-ledger-activity__record-detail {
    margin-block-start: var(--ui-beancount-space-1);
  }
  @media (min-width: 640px) {
    .bc-ledger-activity__summary {
      grid-template-columns: auto minmax(0, 1fr) auto;
    }
    .bc-ledger-activity__summary-rule {
      display: block;
    }
    .bc-ledger-activity__pagination {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }
    .bc-ledger-activity__pagination-controls {
      flex-direction: row;
      align-items: center;
    }
    .bc-ledger-activity__page-size {
      display: flex;
    }
  }
</style>
