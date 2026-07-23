<script lang="ts">
  import { untrack } from "svelte";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronUp from "@lucide/svelte/icons/chevron-up";
  import { SegmentedControl } from "@stevejuma/ui/forms";

  export type IngestionReviewFilter = "review" | "ready";

  export type IngestionReviewPosting = {
    account: string;
    amount: string;
  };

  export type IngestionReviewRow = {
    id: string;
    title: string;
    detail?: string;
    status: "ready" | "needs-review" | "held" | "duplicate" | "accepted";
    statusLabel?: string;
    amount?: string;
    account?: string;
    postings?: readonly IngestionReviewPosting[];
    imageUrl?: string;
    initial?: string;
    /** False for rows that need application input before an approval action. */
    selectable?: boolean;
  };

  export type IngestionReviewGroup = {
    id: string;
    label: string;
    rows: readonly IngestionReviewRow[];
  };

  export type IngestionReviewCounts = {
    review: number;
    ready: number;
    duplicates: number;
  };

  let {
    groups,
    counts,
    filter = "review",
    selectedIds = [],
    ariaLabel = "Import review queue",
    emptyLabel = "No proposals are waiting in this queue.",
    onFilterChange = () => {},
    onSelectedIdsChange = () => {},
    onOpenRow,
  }: {
    groups: readonly IngestionReviewGroup[];
    counts: IngestionReviewCounts;
    filter?: IngestionReviewFilter;
    selectedIds?: readonly string[];
    ariaLabel?: string;
    emptyLabel?: string;
    onFilterChange?: (filter: IngestionReviewFilter) => void;
    onSelectedIdsChange?: (ids: string[]) => void;
    onOpenRow?: (row: IngestionReviewRow) => void;
  } = $props();

  let expandedGroupIds = $state<Set<string>>(
    new Set(untrack(() => groups).map((group) => group.id)),
  );
  let expandedGroupSignature = $state("");

  const selectedIdSet = $derived(new Set(selectedIds));
  const selectableIds = $derived(
    groups.flatMap((group) =>
      group.rows.filter((row) => row.selectable !== false).map((row) => row.id),
    ),
  );
  const allSelected = $derived(
    selectableIds.length > 0 &&
      selectableIds.every((id) => selectedIdSet.has(id)),
  );
  const someSelected = $derived(
    !allSelected && selectableIds.some((id) => selectedIdSet.has(id)),
  );

  $effect(() => {
    const signature = groups.map((group) => group.id).join("|");
    if (signature === expandedGroupSignature) return;
    expandedGroupSignature = signature;
    expandedGroupIds = new Set(groups.map((group) => group.id));
  });

  function updateSelection(ids: Iterable<string>) {
    onSelectedIdsChange([...new Set(ids)]);
  }

  function toggleRow(row: IngestionReviewRow, checked: boolean) {
    const next = new Set(selectedIds);
    if (checked) next.add(row.id);
    else next.delete(row.id);
    updateSelection(next);
  }

  function selectableRows(group: IngestionReviewGroup) {
    return group.rows.filter((row) => row.selectable !== false);
  }

  function toggleGroup(group: IngestionReviewGroup, checked: boolean) {
    const next = new Set(selectedIds);
    for (const row of selectableRows(group)) {
      if (checked) next.add(row.id);
      else next.delete(row.id);
    }
    updateSelection(next);
  }

  function toggleAll(checked: boolean) {
    updateSelection(checked ? selectableIds : []);
  }

  function groupSelection(
    group: IngestionReviewGroup,
  ): "checked" | "unchecked" | "indeterminate" {
    const rows = selectableRows(group);
    const count = rows.filter((row) => selectedIdSet.has(row.id)).length;
    if (count === 0) return "unchecked";
    return count === rows.length ? "checked" : "indeterminate";
  }

  function toggleDisclosure(id: string) {
    const next = new Set(expandedGroupIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    expandedGroupIds = next;
  }

  function setIndeterminate(node: HTMLInputElement, value: boolean) {
    node.indeterminate = value;
    return {
      update(next: boolean) {
        node.indeterminate = next;
      },
    };
  }

  function statusClass(status: IngestionReviewRow["status"]) {
    return `bc-ingestion-review__status--${status}`;
  }

  function statusLabel(row: IngestionReviewRow) {
    if (row.statusLabel) return row.statusLabel;
    return row.status === "needs-review"
      ? "Needs review"
      : row.status[0].toUpperCase() + row.status.slice(1);
  }
</script>

<section class="bc-ingestion-review" aria-label={ariaLabel}>
  <header class="bc-ingestion-review__toolbar">
    <div class="bc-ingestion-review__counts" role="status">
      <span
        class="bc-ingestion-review__count bc-ingestion-review__count--ready"
      >
        <span class="bc-ingestion-review__count-value">{counts.ready}</span> ready
      </span>
      <span
        class="bc-ingestion-review__count bc-ingestion-review__count--review"
      >
        <span class="bc-ingestion-review__count-value">{counts.review}</span> need review
      </span>
      <span
        class="bc-ingestion-review__count bc-ingestion-review__count--duplicate"
      >
        <span class="bc-ingestion-review__count-value">{counts.duplicates}</span> duplicates
      </span>
    </div>
    <SegmentedControl
      value={filter}
      options={["review", "ready"]}
      labels={{
        review: `Review (${counts.review})`,
        ready: `Ready (${counts.ready})`,
      }}
      ariaLabel="Import review content"
      onChange={(value) => onFilterChange(value as IngestionReviewFilter)}
    />
  </header>

  <div
    class="review-grid review-grid--header bc-ingestion-review__table-header"
  >
    <input
      type="checkbox"
      checked={allSelected}
      use:setIndeterminate={someSelected}
      class="bc-ingestion-review__checkbox"
      aria-label="Select visible review items"
      disabled={!selectableIds.length}
      onchange={(event) =>
        toggleAll((event.currentTarget as HTMLInputElement).checked)}
    />
    <span>Proposal</span>
    <span class="bc-ingestion-review__amount-heading">Amount</span>
  </div>

  {#if groups.length}
    <div class="bc-ingestion-review__groups">
      {#each groups as group (group.id)}
        {@const expanded = expandedGroupIds.has(group.id)}
        {@const selection = groupSelection(group)}
        {@const groupRows = selectableRows(group)}
        <section class="bc-ingestion-review__group">
          <div
            class="review-grid review-grid--header bc-ingestion-review__group-header"
          >
            <input
              type="checkbox"
              checked={selection === "checked"}
              use:setIndeterminate={selection === "indeterminate"}
              class="bc-ingestion-review__checkbox"
              aria-label={`Select actionable items from ${group.label}`}
              disabled={!groupRows.length}
              onchange={(event) =>
                toggleGroup(
                  group,
                  (event.currentTarget as HTMLInputElement).checked,
                )}
            />
            <button
              type="button"
              class="bc-ingestion-review__group-toggle"
              aria-expanded={expanded}
              aria-controls={`${group.id}-rows`}
              aria-label={`${expanded ? "Collapse" : "Expand"} ${group.label}`}
              onclick={() => toggleDisclosure(group.id)}
            >
              <span
                class="bc-ingestion-review__group-title"
              >
                {group.label}
                <span class="bc-ingestion-review__group-count"
                  >· {group.rows.length}</span
                >
              </span>
              <span
                class="bc-ingestion-review__group-icon"
                aria-hidden="true"
              >
                {#if expanded}
                  <ChevronUp class="bc-ingestion-review__icon" />
                {:else}
                  <ChevronDown class="bc-ingestion-review__icon" />
                {/if}
              </span>
            </button>
          </div>

          {#if expanded}
            <div
              id={`${group.id}-rows`}
              class="bc-ingestion-review__group-rows"
            >
              {#each group.rows as row (row.id)}
                {@const selectable = row.selectable !== false}
                <div
                  class="review-grid review-grid--row bc-ingestion-review__row"
                >
                  <input
                    type="checkbox"
                    checked={selectedIdSet.has(row.id)}
                    class="bc-ingestion-review__checkbox"
                    aria-label={`Select ${row.title}`}
                    disabled={!selectable}
                    onchange={(event) =>
                      toggleRow(
                        row,
                        (event.currentTarget as HTMLInputElement).checked,
                      )}
                  />
                  <div class="bc-ingestion-review__proposal">
                    {#if row.imageUrl}
                      <img
                        class="bc-ingestion-review__avatar-image"
                        src={row.imageUrl}
                        alt=""
                      />
                    {:else}
                      <div
                        class="bc-ingestion-review__avatar-fallback"
                        aria-hidden="true"
                      >
                        {row.initial ?? row.title.slice(0, 1).toUpperCase()}
                      </div>
                    {/if}
                    {#if onOpenRow}
                      <button
                        type="button"
                        class="bc-ingestion-review__row-action"
                        aria-label={`Review ${row.title}`}
                        onclick={() => onOpenRow(row)}
                      >
                        <span
                          class="bc-ingestion-review__row-title"
                          >{row.title}</span
                        >
                        {#if row.detail}
                          <span
                            class="bc-ingestion-review__row-detail"
                            >{row.detail}</span
                          >
                        {/if}
                        <span
                          class={`bc-ingestion-review__status ${statusClass(row.status)}`}
                        >
                          {statusLabel(row)}
                        </span>
                      </button>
                    {:else}
                      <div class="bc-ingestion-review__row-copy">
                        <span
                          class="bc-ingestion-review__row-title"
                          >{row.title}</span
                        >
                        {#if row.detail}
                          <span
                            class="bc-ingestion-review__row-detail"
                            >{row.detail}</span
                          >
                        {/if}
                        <span
                          class={`bc-ingestion-review__status ${statusClass(row.status)}`}
                        >
                          {statusLabel(row)}
                        </span>
                      </div>
                    {/if}
                  </div>
                  <div class="bc-ingestion-review__amounts">
                    {#if row.postings?.length}
                      {#each row.postings as posting (posting.account)}
                        <div
                          class="bc-ingestion-review__posting"
                        >
                          <span
                            class="bc-ingestion-review__posting-account"
                            >{posting.account}</span
                          >
                          <span class="bc-ingestion-review__posting-amount"
                            >{posting.amount}</span
                          >
                        </div>
                      {/each}
                    {:else}
                      {#if row.account}
                        <span
                          class="bc-ingestion-review__account"
                          >{row.account}</span
                        >
                      {/if}
                      <span class="bc-ingestion-review__amount"
                        >{row.amount ?? "—"}</span
                      >
                    {/if}
                  </div>
                </div>
              {/each}
            </div>
          {/if}
        </section>
      {/each}
    </div>
  {:else}
    <div
      class="bc-ingestion-review__empty"
    >
      {emptyLabel}
    </div>
  {/if}
</section>

<style>
  .review-grid {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr) minmax(10rem, 22rem);
  }

  .review-grid--header {
    grid-template-columns: auto minmax(0, 1fr) auto;
  }

  .bc-ingestion-review {
    display: flex;
    width: 100%;
    flex-direction: column;
    gap: var(--ui-beancount-space-4);
  }

  .bc-ingestion-review__toolbar {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-4);
  }

  .bc-ingestion-review__counts {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }

  .bc-ingestion-review__count,
  .bc-ingestion-review__status {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    color: var(--ui-beancount-foreground);
    font-size: 0.75rem;
    font-weight: 500;
  }

  .bc-ingestion-review__count {
    gap: calc(var(--ui-beancount-space-3) / 2);
    padding: var(--ui-beancount-space-1) calc(var(--ui-beancount-space-2) + 0.125rem);
  }

  .bc-ingestion-review__count-value,
  .bc-ingestion-review__posting-amount,
  .bc-ingestion-review__amount {
    font-variant-numeric: tabular-nums;
  }

  .bc-ingestion-review__count--ready,
  .bc-ingestion-review__status--ready {
    background-color: color-mix(in srgb, var(--ui-beancount-positive) 15%, transparent);
  }

  .bc-ingestion-review__count--review,
  .bc-ingestion-review__status--needs-review {
    background-color: color-mix(in srgb, var(--ui-beancount-review) 15%, transparent);
  }

  .bc-ingestion-review__count--duplicate,
  .bc-ingestion-review__status--duplicate {
    background-color: color-mix(in srgb, var(--ui-beancount-negative) 15%, transparent);
  }

  .bc-ingestion-review__status--held {
    background-color: color-mix(in srgb, var(--ui-beancount-held) 20%, transparent);
  }

  .bc-ingestion-review__status--accepted {
    background-color: color-mix(in srgb, var(--ui-beancount-accepted) 15%, transparent);
  }

  .bc-ingestion-review__table-header {
    align-items: center;
    gap: var(--ui-beancount-space-4);
    border-radius: var(--radius-2xl);
    background-color: var(--ui-beancount-surface-muted);
    padding: var(--ui-beancount-space-4) var(--ui-beancount-space-5);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.025em;
    text-transform: uppercase;
  }

  .bc-ingestion-review__checkbox {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    border-color: var(--input);
    accent-color: var(--primary);
    border-radius: var(--radius-sm);
    outline: none;
  }

  .bc-ingestion-review__checkbox:focus-visible,
  .bc-ingestion-review__group-toggle:focus-visible,
  .bc-ingestion-review__row-action:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
  }

  .bc-ingestion-review__amount-heading,
  .bc-ingestion-review__amounts {
    text-align: right;
  }

  .bc-ingestion-review__groups {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-ingestion-review__group {
    overflow: hidden;
    border-radius: var(--radius-2xl);
    background-color: color-mix(in srgb, var(--ui-beancount-surface-muted) 80%, transparent);
  }

  .bc-ingestion-review__group-header {
    align-items: center;
    gap: var(--ui-beancount-space-3);
    padding: var(--ui-beancount-space-4) var(--ui-beancount-space-5);
  }

  .bc-ingestion-review__group-toggle {
    display: flex;
    min-width: 0;
    grid-column: span 2;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-beancount-space-3);
    border-radius: var(--radius-md);
    outline: none;
    text-align: left;
  }

  .bc-ingestion-review__group-toggle:hover {
    color: var(--primary);
  }

  .bc-ingestion-review__group-title {
    overflow: hidden;
    color: var(--ui-beancount-foreground);
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 0.875rem;
    font-weight: 600;
    letter-spacing: 0.025em;
  }

  .bc-ingestion-review__group-count {
    margin-inline-start: var(--ui-beancount-space-2);
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-ingestion-review__group-icon {
    display: inline-flex;
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    border-radius: var(--radius-md);
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-ingestion-review__group-toggle:hover .bc-ingestion-review__group-icon {
    background-color: var(--accent);
    color: var(--accent-foreground);
  }

  :global(.bc-ingestion-review__icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
  }

  .bc-ingestion-review__group-rows {
    overflow: hidden;
    margin-inline: var(--ui-beancount-space-1);
    margin-block-end: var(--ui-beancount-space-1);
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background-color: var(--ui-beancount-surface);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-ingestion-review__row {
    align-items: center;
    gap: var(--ui-beancount-space-3);
    border-block-end: 1px solid var(--ui-beancount-border);
    padding: var(--ui-beancount-space-4) 15px;
  }

  .bc-ingestion-review__row:last-child {
    border-block-end: 0;
  }

  .bc-ingestion-review__row:hover {
    background-color: color-mix(in srgb, var(--accent) 60%, transparent);
  }

  .bc-ingestion-review__proposal {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: var(--ui-beancount-space-3);
  }

  .bc-ingestion-review__avatar-image,
  .bc-ingestion-review__avatar-fallback {
    width: 2.5rem;
    height: 2.5rem;
    flex-shrink: 0;
    border: 1px solid var(--ui-beancount-border);
    border-radius: 999px;
  }

  .bc-ingestion-review__avatar-image {
    object-fit: contain;
  }

  .bc-ingestion-review__avatar-fallback {
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--ui-beancount-surface-muted);
    color: var(--ui-beancount-muted-foreground);
    font-size: 0.875rem;
    font-weight: 600;
  }

  .bc-ingestion-review__row-action,
  .bc-ingestion-review__row-copy {
    min-width: 0;
  }

  .bc-ingestion-review__row-action {
    border-radius: var(--radius-md);
    outline: none;
    text-align: left;
  }

  .bc-ingestion-review__row-title {
    display: block;
    overflow-wrap: break-word;
    font-size: 0.875rem;
    font-weight: 600;
  }

  .bc-ingestion-review__row-detail,
  .bc-ingestion-review__account,
  .bc-ingestion-review__posting-account {
    overflow: hidden;
    color: var(--ui-beancount-muted-foreground);
    text-overflow: ellipsis;
    white-space: nowrap;
    font-family: var(--font-mono);
    font-size: 0.75rem;
  }

  .bc-ingestion-review__row-detail {
    display: block;
    margin-block-start: var(--ui-beancount-space-1);
    font-family: inherit;
  }

  .bc-ingestion-review__status {
    min-width: 5rem;
    margin-block-start: var(--ui-beancount-space-2);
    padding: calc(var(--ui-beancount-space-1) / 2) var(--ui-beancount-space-2);
  }

  .bc-ingestion-review__posting {
    display: grid;
    min-width: 0;
    grid-template-columns: minmax(0, 1fr) 8rem;
    align-items: center;
    gap: var(--ui-beancount-space-3);
  }

  .bc-ingestion-review__posting-account {
    text-align: left;
  }

  .bc-ingestion-review__posting-amount,
  .bc-ingestion-review__amount {
    font-size: 0.875rem;
    font-weight: 600;
  }

  .bc-ingestion-review__account {
    display: block;
  }

  .bc-ingestion-review__empty {
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--radius-2xl);
    background-color: var(--ui-beancount-surface);
    padding: calc(var(--ui-beancount-space-4) * 2);
    color: var(--ui-beancount-muted-foreground);
    text-align: center;
    font-size: 0.875rem;
  }

  @media (min-width: 640px) {
    .bc-ingestion-review__toolbar {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    .bc-ingestion-review__row-title {
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  @media (max-width: 640px) {
    .review-grid--row {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .review-grid--row > :last-child {
      grid-column: 2;
    }
  }
</style>
