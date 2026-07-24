<script lang="ts">
  import BookOpen from "@lucide/svelte/icons/book-open";
  import ChevronsDownUp from "@lucide/svelte/icons/chevrons-down-up";
  import ChevronsUpDown from "@lucide/svelte/icons/chevrons-up-down";
  import Landmark from "@lucide/svelte/icons/landmark";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import Settings2 from "@lucide/svelte/icons/settings-2";
  import Sparkles from "@lucide/svelte/icons/sparkles";
  import Store from "@lucide/svelte/icons/store";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import CycleSelect, {
    type CycleSelectOption,
  } from "../navigation/CycleSelect.svelte";

  let {
    acceptCount = 0,
    acceptBusy = false,
    canAccept = false,
    canOpenLedger = false,
    sourceId = "",
    sourceOptions = [],
    sourceDisabled = false,
    groupsCollapsedAll = false,
    canForceRefetch = false,
    canRerunAi = false,
    aiRerunBusy = false,
    onAccept = () => {},
    onOpenLedger = () => {},
    onSourceChange = () => {},
    onToggleCollapseGroups = () => {},
    onOpenMerchants = () => {},
    onOpenAccounts = () => {},
    onForceRefetch = () => {},
    onRerunAi = () => {},
    onEditSources = () => {},
  }: {
    /** Number of display-ready proposals the host can accept into the ledger. */
    acceptCount?: number;
    /** Controlled busy state for a host-owned acceptance request. */
    acceptBusy?: boolean;
    /** Whether the host has made the current ready proposals acceptable. */
    canAccept?: boolean;
    /** Whether an active, host-owned review ledger can be opened. */
    canOpenLedger?: boolean;
    /** Host-owned selected source or connection id. */
    sourceId?: string;
    /** Display-ready source choices for the shared cycle selector. */
    sourceOptions?: readonly CycleSelectOption[];
    sourceDisabled?: boolean;
    /** Determines whether the group action expands or collapses all groups. */
    groupsCollapsedAll?: boolean;
    canForceRefetch?: boolean;
    canRerunAi?: boolean;
    aiRerunBusy?: boolean;
    onAccept?: () => void;
    onOpenLedger?: () => void;
    onSourceChange?: (sourceId: string) => void;
    onToggleCollapseGroups?: () => void;
    onOpenMerchants?: () => void;
    onOpenAccounts?: () => void;
    onForceRefetch?: () => void;
    onRerunAi?: () => void;
    onEditSources?: () => void;
  } = $props();

  const acceptAriaLabel = $derived(
    acceptBusy
      ? "Accepting ready transactions"
      : acceptCount
        ? `Accept ${acceptCount} ready transaction${acceptCount === 1 ? "" : "s"}`
        : "Accept ready transactions",
  );
</script>

<div class="bc-ingestion-review-toolbar" aria-label="Record review actions">
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    class="bc-ingestion-review-toolbar__icon-button"
    aria-label="Open active review ledger"
    disabled={!canOpenLedger}
    onclick={onOpenLedger}
  >
    <BookOpen aria-hidden="true" />
  </Button>
  <Button
    type="button"
    size="sm"
    class="bc-ingestion-review-toolbar__accept"
    aria-label={acceptAriaLabel}
    disabled={!canAccept || acceptBusy}
    onclick={onAccept}
  >
    {acceptBusy
      ? "Accepting…"
      : `Accept${acceptCount ? ` ${acceptCount}` : ""}`}
  </Button>
  <CycleSelect
    value={sourceId}
    options={sourceOptions}
    label="Connection"
    ariaLabel="Select connection"
    disabled={sourceDisabled}
    onChange={onSourceChange}
  />
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    class="bc-ingestion-review-toolbar__icon-button"
    aria-label={groupsCollapsedAll
      ? "Expand all date groups"
      : "Collapse all date groups"}
    onclick={onToggleCollapseGroups}
  >
    {#if groupsCollapsedAll}
      <ChevronsUpDown aria-hidden="true" />
    {:else}
      <ChevronsDownUp aria-hidden="true" />
    {/if}
  </Button>
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    class="bc-ingestion-review-toolbar__icon-button"
    aria-label="Review merchants"
    onclick={onOpenMerchants}
  >
    <Store aria-hidden="true" />
  </Button>
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    class="bc-ingestion-review-toolbar__icon-button"
    aria-label="Open Accounts"
    onclick={onOpenAccounts}
  >
    <Landmark aria-hidden="true" />
  </Button>
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    class="bc-ingestion-review-toolbar__icon-button"
    aria-label="Force re-fetch"
    disabled={!canForceRefetch}
    onclick={onForceRefetch}
  >
    <RefreshCw aria-hidden="true" />
  </Button>
  {#if canRerunAi || aiRerunBusy}
    <Button
      type="button"
      variant="ghost"
      size="icon-sm"
      class="bc-ingestion-review-toolbar__icon-button"
      aria-label={aiRerunBusy
        ? "Re-running AI enrichment"
        : "Re-run AI enrichment"}
      disabled={!canRerunAi || aiRerunBusy}
      onclick={onRerunAi}
    >
      <Sparkles
        class="bc-ingestion-review-toolbar__ai-icon"
        data-busy={aiRerunBusy}
        aria-hidden="true"
      />
    </Button>
  {/if}
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    class="bc-ingestion-review-toolbar__icon-button"
    aria-label="Edit sources"
    onclick={onEditSources}
  >
    <Settings2 aria-hidden="true" />
  </Button>
</div>

<style>
  .bc-ingestion-review-toolbar {
    display: flex;
    min-width: 0;
    align-items: center;
    justify-content: flex-end;
    gap: var(--ui-beancount-space-1);
  }

  :global(.bc-ingestion-review-toolbar__icon-button) {
    flex: none;
  }

  :global(.bc-ingestion-review-toolbar__accept) {
    min-width: max-content;
  }

  :global(.bc-ingestion-review-toolbar__ai-icon[data-busy="true"]) {
    animation: bc-ingestion-review-toolbar-pulse 900ms ease-in-out infinite;
  }

  @keyframes bc-ingestion-review-toolbar-pulse {
    50% {
      opacity: 0.4;
      transform: scale(0.9);
    }
  }

  @media (max-width: 720px) {
    .bc-ingestion-review-toolbar {
      flex-wrap: wrap;
    }
  }
</style>
