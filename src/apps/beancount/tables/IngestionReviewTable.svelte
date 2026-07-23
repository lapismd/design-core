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
    switch (status) {
      case "ready":
        return "bg-emerald-500/15";
      case "held":
        return "bg-amber-500/20";
      case "duplicate":
        return "bg-rose-500/15";
      case "accepted":
        return "bg-sky-500/15";
      default:
        return "bg-violet-500/15";
    }
  }

  function statusLabel(row: IngestionReviewRow) {
    if (row.statusLabel) return row.statusLabel;
    return row.status === "needs-review"
      ? "Needs review"
      : row.status[0].toUpperCase() + row.status.slice(1);
  }
</script>

<section class="flex w-full flex-col gap-4" aria-label={ariaLabel}>
  <header
    class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex flex-wrap items-center gap-2" role="status">
      <span
        class="text-foreground inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium"
      >
        <span class="tabular-nums">{counts.ready}</span> ready
      </span>
      <span
        class="text-foreground inline-flex items-center gap-1.5 rounded-full bg-violet-500/15 px-2.5 py-1 text-xs font-medium"
      >
        <span class="tabular-nums">{counts.review}</span> need review
      </span>
      <span
        class="text-foreground inline-flex items-center gap-1.5 rounded-full bg-rose-500/15 px-2.5 py-1 text-xs font-medium"
      >
        <span class="tabular-nums">{counts.duplicates}</span> duplicates
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
    class="review-grid review-grid--header bg-muted text-muted-foreground items-center gap-4 rounded-2xl px-5 py-4 text-xs font-semibold tracking-wide uppercase"
  >
    <input
      type="checkbox"
      checked={allSelected}
      use:setIndeterminate={someSelected}
      class="border-input accent-primary focus-visible:ring-ring size-4 rounded focus-visible:ring-2 focus-visible:outline-none"
      aria-label="Select visible review items"
      disabled={!selectableIds.length}
      onchange={(event) =>
        toggleAll((event.currentTarget as HTMLInputElement).checked)}
    />
    <span>Proposal</span>
    <span class="text-right">Amount</span>
  </div>

  {#if groups.length}
    <div class="flex flex-col gap-3">
      {#each groups as group (group.id)}
        {@const expanded = expandedGroupIds.has(group.id)}
        {@const selection = groupSelection(group)}
        {@const groupRows = selectableRows(group)}
        <section class="bg-muted/80 overflow-hidden rounded-2xl">
          <div
            class="review-grid review-grid--header items-center gap-3 px-5 py-4"
          >
            <input
              type="checkbox"
              checked={selection === "checked"}
              use:setIndeterminate={selection === "indeterminate"}
              class="border-input accent-primary focus-visible:ring-ring size-4 rounded focus-visible:ring-2 focus-visible:outline-none"
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
              class="hover:text-primary focus-visible:ring-ring col-span-2 flex min-w-0 items-center justify-between gap-3 rounded-md text-left outline-none focus-visible:ring-2"
              aria-expanded={expanded}
              aria-controls={`${group.id}-rows`}
              aria-label={`${expanded ? "Collapse" : "Expand"} ${group.label}`}
              onclick={() => toggleDisclosure(group.id)}
            >
              <span
                class="text-foreground truncate text-sm font-semibold tracking-wide"
              >
                {group.label}
                <span class="text-muted-foreground ml-2"
                  >· {group.rows.length}</span
                >
              </span>
              <span
                class="text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground inline-flex size-8 shrink-0 items-center justify-center rounded-md"
                aria-hidden="true"
              >
                {#if expanded}
                  <ChevronUp class="size-4" />
                {:else}
                  <ChevronDown class="size-4" />
                {/if}
              </span>
            </button>
          </div>

          {#if expanded}
            <div
              id={`${group.id}-rows`}
              class="bg-card mx-1 mb-1 overflow-hidden rounded-xl border shadow-sm"
            >
              {#each group.rows as row (row.id)}
                {@const selectable = row.selectable !== false}
                <div
                  class="review-grid review-grid--row hover:bg-accent/60 items-center gap-3 border-b px-[15px] py-4 last:border-b-0"
                >
                  <input
                    type="checkbox"
                    checked={selectedIdSet.has(row.id)}
                    class="border-input accent-primary focus-visible:ring-ring size-4 rounded focus-visible:ring-2 focus-visible:outline-none"
                    aria-label={`Select ${row.title}`}
                    disabled={!selectable}
                    onchange={(event) =>
                      toggleRow(
                        row,
                        (event.currentTarget as HTMLInputElement).checked,
                      )}
                  />
                  <div class="flex min-w-0 items-center gap-3">
                    {#if row.imageUrl}
                      <img
                        class="size-10 shrink-0 rounded-full border object-contain"
                        src={row.imageUrl}
                        alt=""
                      />
                    {:else}
                      <div
                        class="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
                        aria-hidden="true"
                      >
                        {row.initial ?? row.title.slice(0, 1).toUpperCase()}
                      </div>
                    {/if}
                    {#if onOpenRow}
                      <button
                        type="button"
                        class="focus-visible:ring-ring min-w-0 rounded-md text-left outline-none focus-visible:ring-2"
                        aria-label={`Review ${row.title}`}
                        onclick={() => onOpenRow(row)}
                      >
                        <span
                          class="block text-sm font-semibold break-words sm:truncate"
                          >{row.title}</span
                        >
                        {#if row.detail}
                          <span
                            class="text-muted-foreground mt-1 block truncate text-xs"
                            >{row.detail}</span
                          >
                        {/if}
                        <span
                          class={`text-foreground mt-2 inline-flex min-w-20 justify-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(row.status)}`}
                        >
                          {statusLabel(row)}
                        </span>
                      </button>
                    {:else}
                      <div class="min-w-0">
                        <span
                          class="block text-sm font-semibold break-words sm:truncate"
                          >{row.title}</span
                        >
                        {#if row.detail}
                          <span
                            class="text-muted-foreground mt-1 block truncate text-xs"
                            >{row.detail}</span
                          >
                        {/if}
                        <span
                          class={`text-foreground mt-2 inline-flex min-w-20 justify-center rounded-full px-2 py-0.5 text-xs font-medium ${statusClass(row.status)}`}
                        >
                          {statusLabel(row)}
                        </span>
                      </div>
                    {/if}
                  </div>
                  <div class="min-w-0 text-right">
                    {#if row.postings?.length}
                      {#each row.postings as posting (posting.account)}
                        <div
                          class="grid min-w-0 grid-cols-[minmax(0,1fr)_8rem] items-center gap-3"
                        >
                          <span
                            class="text-muted-foreground truncate text-left font-mono text-xs"
                            >{posting.account}</span
                          >
                          <span class="text-sm font-semibold tabular-nums"
                            >{posting.amount}</span
                          >
                        </div>
                      {/each}
                    {:else}
                      {#if row.account}
                        <span
                          class="text-muted-foreground block truncate font-mono text-xs"
                          >{row.account}</span
                        >
                      {/if}
                      <span class="text-sm font-semibold tabular-nums"
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
      class="bg-card text-muted-foreground rounded-2xl border p-8 text-center text-sm"
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

  @media (max-width: 640px) {
    .review-grid--row {
      grid-template-columns: auto minmax(0, 1fr);
    }

    .review-grid--row > :last-child {
      grid-column: 2;
    }
  }
</style>
