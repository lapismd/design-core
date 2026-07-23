<script lang="ts">
  import { untrack } from "svelte";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import FileText from "@lucide/svelte/icons/file-text";
  import { SegmentedControl } from "@stevejuma/ui/forms";

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

  export type LedgerActivityPosting = {
    id?: string;
    account: string;
    amount?: string;
    href?: string;
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

  let {
    groups,
    selectedIds = [],
    selectable = true,
    ariaLabel = "Ledger activity",
    amountHeading = "Amount",
    balanceDescription = "Running balance",
    emptyMessage = "No dated records match the current filter.",
    timeframes = [],
    timeframe,
    onSelectedIdsChange = () => {},
    onOpenRecord,
    onTimeframeChange = () => {},
  }: {
    groups: readonly LedgerActivityGroup[];
    selectedIds?: readonly string[];
    selectable?: boolean;
    ariaLabel?: string;
    amountHeading?: string;
    balanceDescription?: string;
    emptyMessage?: string;
    /** Two or three display modes, such as posted and upcoming activity. */
    timeframes?: readonly LedgerActivityTimeframe[];
    timeframe?: string;
    onSelectedIdsChange?: (ids: string[]) => void;
    onOpenRecord?: (record: LedgerActivityRecord) => void;
    onTimeframeChange?: (timeframe: string) => void;
  } = $props();

  let expandedGroupIds = $state<Set<string>>(
    new Set(untrack(() => groups).map((group) => group.id)),
  );

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
</script>

<section class="w-full" aria-label={ariaLabel}>
  {#if timeframes.length > 1}
    <div class="mb-3">
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
    class="border-border/80 bg-card overflow-hidden rounded-2xl border shadow-sm"
  >
    <div
      class={selectable
        ? "activity-grid activity-grid--selectable bg-muted/65 text-muted-foreground items-center gap-4 px-5 py-3 text-xs font-semibold tracking-wide uppercase"
        : "activity-grid activity-grid--read-only bg-muted/65 text-muted-foreground items-center gap-4 px-5 py-3 text-xs font-semibold tracking-wide uppercase"}
    >
      {#if selectable}
        <input
          type="checkbox"
          checked={allSelected}
          use:setIndeterminate={someSelected}
          class="border-input accent-primary focus-visible:ring-ring size-4 shrink-0 rounded focus-visible:ring-2 focus-visible:outline-none"
          aria-label="Select all visible records"
          onchange={(event) =>
            toggleAll((event.currentTarget as HTMLInputElement).checked)}
        />
      {/if}
      <span>Date and record</span>
      <span class="text-right">{amountHeading}</span>
    </div>

    {#if groups.length}
      <div class="divide-border/80 divide-y">
        {#each groups as group (group.id)}
          {@const expanded = expandedGroupIds.has(group.id)}
          {@const groupState = groupSelection(group)}
          <section>
            <div
              class={selectable
                ? "activity-grid activity-grid--selectable bg-card items-center gap-4 px-5 py-3"
                : "activity-grid activity-grid--read-only bg-card items-center gap-4 px-5 py-3"}
            >
              {#if selectable}
                <input
                  type="checkbox"
                  checked={groupState === "checked"}
                  use:setIndeterminate={groupState === "indeterminate"}
                  class="border-input accent-primary focus-visible:ring-ring size-4 shrink-0 rounded focus-visible:ring-2 focus-visible:outline-none"
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
                class="focus-visible:ring-ring flex min-w-0 items-center gap-2 text-left focus-visible:ring-2 focus-visible:outline-none"
                aria-expanded={expanded}
                aria-controls={`${group.id}-details`}
                onclick={() => toggleGroupDisclosure(group.id)}
              >
                {#if expanded}
                  <ChevronDown
                    class="text-muted-foreground size-4 shrink-0"
                    aria-hidden="true"
                  />
                {:else}
                  <ChevronRight
                    class="text-muted-foreground size-4 shrink-0"
                    aria-hidden="true"
                  />
                {/if}
                <span class="truncate text-sm font-semibold">{group.date}</span>
                <span class="text-muted-foreground text-xs"
                  >{group.records.length} record{group.records.length === 1
                    ? ""
                    : "s"}</span
                >
              </button>
              {#if group.balance}
                <span
                  class="text-muted-foreground text-right font-mono text-xs tabular-nums"
                  aria-label={`${balanceDescription}: ${group.balance}`}
                  >{group.balance}</span
                >
              {:else}
                <span aria-hidden="true"></span>
              {/if}
            </div>

            {#if expanded}
              <div id={`${group.id}-details`} class="border-border/70 border-t">
                {#if group.summary}
                  <div
                    class="border-border/80 grid gap-x-4 gap-y-2 border-b border-dashed px-5 py-4 text-sm sm:grid-cols-[auto_minmax(0,1fr)_auto]"
                    aria-label={`Balance summary for ${group.date}`}
                  >
                    <span>Start balance</span>
                    <span
                      class="border-border/80 hidden self-center border-t border-dashed sm:block"
                    ></span>
                    <span class="text-right font-semibold tabular-nums">
                      {group.summary.start}
                    </span>
                    <span>Net cash flow</span>
                    <span
                      class="border-border/80 hidden self-center border-t border-dashed sm:block"
                    ></span>
                    <span class="text-right font-semibold tabular-nums">
                      {group.summary.change}
                    </span>
                    <span>Final balance</span>
                    <span
                      class="border-border/80 hidden self-center border-t border-dashed sm:block"
                    ></span>
                    <span class="text-right font-bold tabular-nums">
                      {group.summary.final}
                    </span>
                  </div>
                {/if}
                <ul>
                  {#each group.records as record (record.id)}
                    <li
                      class={selectable
                        ? "activity-grid activity-grid--selectable hover:bg-muted/45 items-start gap-4 px-5 py-3 transition-colors"
                        : "activity-grid activity-grid--read-only hover:bg-muted/45 items-start gap-4 px-5 py-3 transition-colors"}
                    >
                      {#if selectable}
                        <input
                          type="checkbox"
                          checked={selectedIdSet.has(record.id)}
                          aria-label={`Select ${record.description}`}
                          class="border-input accent-primary focus-visible:ring-ring mt-0.5 size-4 shrink-0 rounded focus-visible:ring-2 focus-visible:outline-none"
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
                          class="focus-visible:ring-ring min-w-0 text-left focus-visible:ring-2 focus-visible:outline-none"
                          onclick={() => onOpenRecord(record)}
                        >
                          {@render ActivityRecord(record, true)}
                        </button>
                      {:else}
                        <div class="min-w-0">
                          {@render ActivityRecord(record)}
                        </div>
                      {/if}
                      {#if record.postings?.length}
                        <div class="flex min-w-0 flex-col gap-1 text-right">
                          {#each record.postings as posting, index (`${record.id}-${posting.id ?? posting.account}-${index}`)}
                            <div
                              class="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-3"
                            >
                              {#if posting.href}
                                <a
                                  href={posting.href}
                                  class="text-primary focus-visible:ring-ring truncate text-left text-xs underline-offset-4 hover:underline focus-visible:ring-2 focus-visible:outline-none"
                                  >{posting.account}</a
                                >
                              {:else}
                                <span
                                  class="text-muted-foreground truncate text-left text-xs"
                                  title={posting.account}
                                  >{posting.account}</span
                                >
                              {/if}
                              <span
                                class="font-mono text-sm font-semibold tabular-nums"
                                >{posting.amount ?? "—"}</span
                              >
                            </div>
                          {/each}
                        </div>
                      {:else}
                        <div class="text-right font-mono text-sm tabular-nums">
                          {record.amount}
                        </div>
                      {/if}
                    </li>
                  {/each}
                </ul>
              </div>
            {/if}
          </section>
        {/each}
      </div>
    {:else}
      <div class="text-muted-foreground px-5 py-12 text-center text-sm">
        {emptyMessage}
      </div>
    {/if}
  </div>
</section>

{#snippet ActivityRecord(record: LedgerActivityRecord, interactive = false)}
  {@const avatar = avatarFor(record)}
  <span class="flex min-w-0 items-start gap-2">
    {#if avatar.imageUrl}
      <img
        src={avatar.imageUrl}
        alt={avatar.alt ?? ""}
        class="border-border/70 mt-0.5 size-10 shrink-0 rounded-full border object-contain"
      />
    {:else}
      <span
        class="border-border/70 bg-muted text-muted-foreground mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold"
        aria-hidden="true"
      >
        {#if avatar.fallback}
          {avatar.fallback.slice(0, 1).toUpperCase()}
        {:else}
          <FileText class="size-4" />
        {/if}
      </span>
    {/if}
    <span class="min-w-0">
      <span
        class={`block truncate text-sm font-medium ${interactive ? "hover:underline" : ""}`}
      >
        {record.description}
      </span>
      {#if record.account}
        <span
          class="text-muted-foreground mt-0.5 block truncate font-mono text-xs"
          >{record.account}</span
        >
      {/if}
      {#if record.detail}
        <span class="text-muted-foreground mt-1 block truncate text-xs">
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
</style>
