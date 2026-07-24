<script lang="ts">
  import ArrowLeft from "@lucide/svelte/icons/arrow-left";
  import BookUser from "@lucide/svelte/icons/book-user";
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import HistoryIcon from "@lucide/svelte/icons/history";
  import Landmark from "@lucide/svelte/icons/landmark";
  import Palette from "@lucide/svelte/icons/palette";
  import RefreshCw from "@lucide/svelte/icons/refresh-cw";
  import Wand2 from "@lucide/svelte/icons/wand-2";
  import { Button } from "@stevejuma/ui/shadcn/button";

  export type LedgerSettingsDestination =
    | "accounts"
    | "bank-sync"
    | "history"
    | "merchants"
    | "brand-match"
    | "rules";

  /**
   * Controlled Fava-style ledger settings navigation. The host owns routing
   * and remembers the Bank Sync disclosure state when that is useful.
   */
  let {
    activeId,
    bankSyncExpanded = true,
    ariaLabel = "Ledger settings navigation",
    onBack = () => {},
    onNavigate = () => {},
    onBankSyncExpandedChange = () => {},
  }: {
    /** The route currently highlighted by the host adapter. */
    activeId?: LedgerSettingsDestination;
    /** Controlled Bank Sync subtree disclosure state. */
    bankSyncExpanded?: boolean;
    ariaLabel?: string;
    /** Requests a return to the primary ledger navigation. */
    onBack?: () => void;
    /** Requests a host-owned settings route change. */
    onNavigate?: (destination: LedgerSettingsDestination) => void;
    /** Requests a host-owned Bank Sync disclosure update. */
    onBankSyncExpandedChange?: (expanded: boolean) => void;
  } = $props();

  const destinations = [
    { id: "accounts", label: "Accounts", icon: Landmark },
    { id: "merchants", label: "Merchants", icon: BookUser },
    { id: "brand-match", label: "Brand match", icon: Palette },
    { id: "rules", label: "Rules", icon: Wand2 },
  ] as const satisfies readonly {
    id: Exclude<LedgerSettingsDestination, "bank-sync" | "history">;
    label: string;
    icon: typeof Landmark;
  }[];

  function isActive(destination: LedgerSettingsDestination) {
    return activeId === destination;
  }
</script>

<nav class="bc-ledger-settings-navigation" aria-label={ariaLabel}>
  <Button
    type="button"
    variant="ghost"
    size="sm"
    class="bc-ledger-settings-navigation__back"
    aria-label="Back to ledger navigation"
    onclick={onBack}
  >
    <ArrowLeft aria-hidden="true" />
    <span>Back</span>
  </Button>

  <div class="bc-ledger-settings-navigation__items">
    <Button
      type="button"
      variant="ghost"
      size="sm"
      class={isActive("accounts")
        ? "bc-ledger-settings-navigation__item bc-ledger-settings-navigation__item--active"
        : "bc-ledger-settings-navigation__item"}
      aria-current={isActive("accounts") ? "page" : undefined}
      onclick={() => onNavigate("accounts")}
    >
      <Landmark aria-hidden="true" />
      <span>Accounts</span>
    </Button>

    <div class="bc-ledger-settings-navigation__bank-sync">
      <div
        class={isActive("bank-sync")
          ? "bc-ledger-settings-navigation__bank-sync-trigger bc-ledger-settings-navigation__bank-sync-trigger--active"
          : "bc-ledger-settings-navigation__bank-sync-trigger"}
      >
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          class="bc-ledger-settings-navigation__disclosure"
          aria-label={bankSyncExpanded
            ? "Collapse Bank Sync navigation"
            : "Expand Bank Sync navigation"}
          aria-expanded={bankSyncExpanded}
          onclick={() => onBankSyncExpandedChange(!bankSyncExpanded)}
        >
          <ChevronDown
            class={bankSyncExpanded
              ? "bc-ledger-settings-navigation__disclosure-icon"
              : "bc-ledger-settings-navigation__disclosure-icon bc-ledger-settings-navigation__disclosure-icon--closed"}
            aria-hidden="true"
          />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          class="bc-ledger-settings-navigation__bank-sync-button"
          aria-current={isActive("bank-sync") ? "page" : undefined}
          onclick={() => onNavigate("bank-sync")}
        >
          <RefreshCw aria-hidden="true" />
          <span>Bank Sync</span>
        </Button>
      </div>

      {#if bankSyncExpanded}
        <div class="bc-ledger-settings-navigation__history">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            class={isActive("history")
              ? "bc-ledger-settings-navigation__item bc-ledger-settings-navigation__item--active"
              : "bc-ledger-settings-navigation__item"}
            aria-current={isActive("history") ? "page" : undefined}
            onclick={() => onNavigate("history")}
          >
            <HistoryIcon aria-hidden="true" />
            <span>History</span>
          </Button>
        </div>
      {/if}
    </div>

    {#each destinations.slice(1) as destination (destination.id)}
      {@const Icon = destination.icon}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        class={isActive(destination.id)
          ? "bc-ledger-settings-navigation__item bc-ledger-settings-navigation__item--active"
          : "bc-ledger-settings-navigation__item"}
        aria-current={isActive(destination.id) ? "page" : undefined}
        onclick={() => onNavigate(destination.id)}
      >
        <Icon aria-hidden="true" />
        <span>{destination.label}</span>
      </Button>
    {/each}
  </div>
</nav>

<style>
  .bc-ledger-settings-navigation {
    display: flex;
    min-height: 0;
    flex: 1;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-ledger-settings-navigation__items,
  .bc-ledger-settings-navigation__bank-sync {
    display: grid;
    gap: var(--ui-beancount-space-1);
  }

  :global(.bc-ledger-settings-navigation__back),
  :global(.bc-ledger-settings-navigation__item),
  :global(.bc-ledger-settings-navigation__bank-sync-button) {
    width: 100%;
    min-height: var(--ui-beancount-compact-control-height);
    justify-content: flex-start;
    gap: var(--ui-beancount-space-2);
    padding-inline: var(--ui-beancount-space-2);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
  }

  :global(.bc-ledger-settings-navigation__back:hover),
  :global(.bc-ledger-settings-navigation__item:hover),
  :global(.bc-ledger-settings-navigation__bank-sync-button:hover) {
    background: var(--ui-beancount-surface);
    color: var(--ui-beancount-sidebar-foreground);
  }

  :global(.bc-ledger-settings-navigation__item--active),
  :global(.bc-ledger-settings-navigation__item--active:hover) {
    border-color: var(--ui-beancount-border);
    background: var(--ui-beancount-surface);
    color: var(--ui-beancount-sidebar-accent-foreground);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-ledger-settings-navigation__bank-sync-trigger {
    display: flex;
    min-width: 0;
    align-items: center;
    border: 1px solid transparent;
    border-radius: var(--ui-beancount-radius-panel);
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-ledger-settings-navigation__bank-sync-trigger--active {
    border-color: var(--ui-beancount-border);
    background: var(--ui-beancount-surface);
    color: var(--ui-beancount-sidebar-accent-foreground);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-ledger-settings-navigation__disclosure) {
    margin-inline-start: var(--ui-beancount-space-1);
    color: inherit;
  }

  :global(.bc-ledger-settings-navigation__bank-sync-button) {
    min-width: 0;
    flex: 1;
    color: inherit;
  }

  :global(.bc-ledger-settings-navigation__bank-sync-button:hover) {
    background: transparent;
    color: inherit;
  }

  :global(.bc-ledger-settings-navigation__back svg),
  :global(.bc-ledger-settings-navigation__item svg),
  :global(.bc-ledger-settings-navigation__bank-sync-button svg) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
    flex: none;
  }

  :global(.bc-ledger-settings-navigation__disclosure-icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    transition: transform 150ms ease;
  }

  :global(.bc-ledger-settings-navigation__disclosure-icon--closed) {
    transform: rotate(-90deg);
  }

  .bc-ledger-settings-navigation__history {
    display: grid;
    gap: var(--ui-beancount-space-1);
    margin-inline-start: var(--ui-beancount-space-4);
    border-inline-start: 1px solid var(--ui-beancount-border);
    padding-inline-start: var(--ui-beancount-space-2);
  }
</style>
