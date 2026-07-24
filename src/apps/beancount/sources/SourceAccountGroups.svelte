<script lang="ts">
  import ChevronDown from "@lucide/svelte/icons/chevron-down";
  import Landmark from "@lucide/svelte/icons/landmark";
  import MoreVertical from "@lucide/svelte/icons/more-vertical";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import * as Card from "@stevejuma/ui/shadcn/card";
  import * as DropdownMenu from "@stevejuma/ui/shadcn/dropdown-menu";
  import AccountAvatar from "../pickers/AccountAvatar.svelte";
  import type { SourceBrandTone } from "./SourceConnectionCatalog.svelte";

  export type SourceAccountSource = {
    id: string;
    name: string;
    initials: string;
    credentialLabel: string;
    syncLabel: string;
    tone?: SourceBrandTone;
    details?: SourceAccountDetails;
  };

  /** A host-owned action for one linked source account. */
  export type SourceLinkedAccountAction = {
    id: string;
    label: string;
    destructive?: boolean;
    disabled?: boolean;
  };

  /** A display-ready ledger account in an expanded source connection. */
  export type SourceLinkedAccount = {
    id: string;
    name: string;
    account: string;
    accountTypeLabel: string;
    institutionLabel?: string;
    balanceLabel?: string;
    currencyLabel?: string;
    color?: string;
    icon?: string;
    merchantLogoUrl?: string;
    actions?: readonly SourceLinkedAccountAction[];
  };

  /** A display-ready account group in an expanded source connection. */
  export type SourceLinkedAccountGroup = {
    id: string;
    label: string;
    totalLabel?: string;
    accounts: readonly SourceLinkedAccount[];
  };

  /**
   * Display-only account detail for the expanded Fava import-accounts card.
   * Discovery, linking, balance calculation, and account persistence stay in
   * the application adapter.
   */
  export type SourceAccountDetails = {
    groups?: readonly SourceLinkedAccountGroup[];
    emptyLabel?: string;
  };

  export type UnassignedAccountGroup = {
    id: string;
    label: string;
    description: string;
    count: number;
  };

  /** A host-owned action for the source connection row. */
  export type SourceAccountAction = {
    id: string;
    label: string;
    destructive?: boolean;
    disabled?: boolean;
  };

  let {
    source,
    otherAccounts,
    sourceActions = [],
    expandedSourceId,
    ariaLabel = "Import accounts",
    onOpenSource = () => {},
    onExpandedSourceChange,
    onOpenLinkedAccount = () => {},
    onLinkedAccountAction = () => {},
    onOpenOtherAccounts = () => {},
    onSourceAction = () => {},
  }: {
    source: SourceAccountSource;
    otherAccounts: UnassignedAccountGroup;
    /** Available source-connection actions supplied by the host. */
    sourceActions?: readonly SourceAccountAction[];
    /** The source ID whose display-ready linked-account details are visible. */
    expandedSourceId?: string;
    ariaLabel?: string;
    /** Requests that the host open source-account setup. */
    onOpenSource?: (source: SourceAccountSource) => void;
    /** Requests the next controlled expanded source, or closes the current one. */
    onExpandedSourceChange?: (source: SourceAccountSource | undefined) => void;
    /** Requests that the host open one linked ledger account. */
    onOpenLinkedAccount?: (
      source: SourceAccountSource,
      account: SourceLinkedAccount,
    ) => void;
    /** Requests a host-owned action for one linked ledger account. */
    onLinkedAccountAction?: (
      source: SourceAccountSource,
      account: SourceLinkedAccount,
      action: SourceLinkedAccountAction,
    ) => void;
    /** Requests that the host open ledger accounts without a sync source. */
    onOpenOtherAccounts?: (group: UnassignedAccountGroup) => void;
    /** Requests a host-owned source-connection action. */
    onSourceAction?: (
      source: SourceAccountSource,
      action: SourceAccountAction,
    ) => void;
  } = $props();

  function detailsId(item: SourceAccountSource) {
    return `source-account-details-${item.id}`;
  }

  function isExpanded(item: SourceAccountSource) {
    return Boolean(item.details && item.id === expandedSourceId);
  }

  function toggleDetails(item: SourceAccountSource) {
    onOpenSource(item);
    onExpandedSourceChange?.(isExpanded(item) ? undefined : item);
  }
</script>

<section class="bc-source-account-groups" aria-label={ariaLabel}>
  <Card.Root class="bc-source-account-groups__card">
    <div class="bc-source-account-groups__source-row">
      <button
        type="button"
        class="bc-source-account-groups__source-action"
        aria-label={`Open ${source.name} accounts`}
        aria-controls={source.details ? detailsId(source) : undefined}
        aria-expanded={source.details ? isExpanded(source) : undefined}
        onclick={() => toggleDetails(source)}
      >
        <ChevronDown
          class="bc-source-account-groups__chevron"
          data-expanded={isExpanded(source)}
          aria-hidden="true"
        />
        <span
          class="bc-source-account-groups__brand"
          data-tone={source.tone ?? "primary"}
          aria-hidden="true"
        >
          {source.initials}
        </span>
        <span class="bc-source-account-groups__source-copy">
          <span class="bc-source-account-groups__name">{source.name}</span>
          <span>{source.credentialLabel}</span>
          <span>{source.syncLabel}</span>
        </span>
      </button>
      {#if sourceActions.length}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            {#snippet child({ props })}
              <button
                {...props}
                type="button"
                class="bc-source-account-groups__source-menu-trigger"
                aria-label={`${source.name} actions`}
              >
                <MoreVertical aria-hidden="true" />
              </button>
            {/snippet}
          </DropdownMenu.Trigger>
          <DropdownMenu.Content align="end">
            <DropdownMenu.Group>
              {#each sourceActions as action (action.id)}
                <DropdownMenu.Item
                  disabled={action.disabled}
                  variant={action.destructive ? "destructive" : "default"}
                  onSelect={() => onSourceAction(source, action)}
                >
                  {action.label}
                </DropdownMenu.Item>
              {/each}
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      {/if}
    </div>
    {#if isExpanded(source) && source.details}
      <section
        class="bc-source-account-groups__details"
        id={detailsId(source)}
        aria-label={`${source.name} account details`}
      >
        {#if source.details.groups?.length}
          {#each source.details.groups as group (group.id)}
            <section class="bc-source-account-groups__account-group">
              <header>
                <h3>
                  {group.label}
                  <span>· {group.accounts.length}</span>
                </h3>
                {#if group.totalLabel}
                  <strong>{group.totalLabel}</strong>
                {/if}
              </header>
              <ul>
                {#each group.accounts as account (account.id)}
                  <li class="bc-source-account-groups__account-row">
                    <button
                      type="button"
                      aria-label={`Open ${account.account}`}
                      onclick={() => onOpenLinkedAccount(source, account)}
                    >
                      <AccountAvatar
                        account={account.account}
                        color={account.color}
                        icon={account.icon}
                        merchantLogoUrl={account.merchantLogoUrl}
                        size="sm"
                      />
                      <span class="bc-source-account-groups__account-copy">
                        <span>
                          <strong>{account.name}</strong>
                          {#if account.institutionLabel}
                            <span>• {account.institutionLabel}</span>
                          {/if}
                        </span>
                        <span>{account.accountTypeLabel}</span>
                      </span>
                      {#if account.balanceLabel}
                        <strong>{account.balanceLabel}</strong>
                      {:else if account.currencyLabel}
                        <span class="bc-source-account-groups__account-currency"
                          >{account.currencyLabel}</span
                        >
                      {/if}
                    </button>
                    {#if account.actions?.length}
                      <DropdownMenu.Root>
                        <DropdownMenu.Trigger>
                          {#snippet child({ props })}
                            <button
                              {...props}
                              type="button"
                              class="bc-source-account-groups__account-menu-trigger"
                              aria-label={`${account.name} actions`}
                            >
                              <MoreVertical aria-hidden="true" />
                            </button>
                          {/snippet}
                        </DropdownMenu.Trigger>
                        <DropdownMenu.Content align="end">
                          <DropdownMenu.Group>
                            {#each account.actions as action (action.id)}
                              <DropdownMenu.Item
                                disabled={action.disabled}
                                variant={action.destructive
                                  ? "destructive"
                                  : "default"}
                                onSelect={() =>
                                  onLinkedAccountAction(
                                    source,
                                    account,
                                    action,
                                  )}
                              >
                                {action.label}
                              </DropdownMenu.Item>
                            {/each}
                          </DropdownMenu.Group>
                        </DropdownMenu.Content>
                      </DropdownMenu.Root>
                    {/if}
                  </li>
                {/each}
              </ul>
            </section>
          {/each}
        {:else}
          <p class="bc-source-account-groups__details-empty">
            {source.details.emptyLabel ?? "No linked accounts yet."}
          </p>
        {/if}
      </section>
    {/if}
  </Card.Root>

  <Card.Root class="bc-source-account-groups__card">
    <button
      type="button"
      class="bc-source-account-groups__other-action"
      aria-label={`Open ${otherAccounts.label}`}
      onclick={() => onOpenOtherAccounts(otherAccounts)}
    >
      <ChevronDown
        class="bc-source-account-groups__chevron"
        data-expanded="false"
        aria-hidden="true"
      />
      <span class="bc-source-account-groups__other-icon" aria-hidden="true">
        <Landmark class="bc-source-account-groups__other-icon-glyph" />
      </span>
      <span class="bc-source-account-groups__other-copy">
        <span class="bc-source-account-groups__name">{otherAccounts.label}</span
        >
        <span>{otherAccounts.description}</span>
      </span>
      <Badge variant="secondary">{otherAccounts.count}</Badge>
    </button>
  </Card.Root>
</section>

<style>
  .bc-source-account-groups {
    display: grid;
    gap: var(--ui-beancount-space-4);
  }

  :global(.bc-source-account-groups__card) {
    border: 1px solid var(--ui-beancount-border);
    box-shadow: var(--ui-beancount-shadow-panel);
    padding: 0;
  }

  .bc-source-account-groups__source-action,
  .bc-source-account-groups__other-action {
    display: grid;
    width: 100%;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    padding: calc(var(--ui-beancount-space-4) * 1.25);
    color: var(--ui-beancount-foreground);
    text-align: left;
  }

  .bc-source-account-groups__source-action {
    grid-template-columns: auto auto minmax(0, 1fr);
  }

  .bc-source-account-groups__source-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
  }

  .bc-source-account-groups__source-row
    .bc-source-account-groups__source-action {
    width: 100%;
  }

  .bc-source-account-groups__source-menu-trigger {
    display: inline-flex;
    width: calc(var(--ui-beancount-space-5) * 2);
    height: calc(var(--ui-beancount-space-5) * 2);
    align-items: center;
    justify-content: center;
    margin-inline-end: var(--ui-beancount-space-3);
    border-radius: var(--ui-beancount-radius-sm);
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-source-account-groups__source-menu-trigger:hover {
    background: var(--ui-beancount-surface-muted);
    color: var(--ui-beancount-foreground);
  }

  .bc-source-account-groups__source-menu-trigger:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: 2px;
  }

  :global(.bc-source-account-groups__source-menu-trigger svg) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
  }

  .bc-source-account-groups__other-action {
    grid-template-columns: auto auto minmax(0, 1fr) auto;
  }

  .bc-source-account-groups__source-action:focus-visible,
  .bc-source-account-groups__other-action:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: 2px;
  }

  :global(.bc-source-account-groups__chevron) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
    color: var(--ui-beancount-muted-foreground);
    transition: transform 150ms ease;
    transform: rotate(-90deg);
  }

  :global(.bc-source-account-groups__chevron[data-expanded="true"]) {
    transform: rotate(0deg);
  }

  .bc-source-account-groups__brand,
  .bc-source-account-groups__other-icon {
    display: inline-flex;
    width: calc(var(--ui-beancount-space-5) * 2.75);
    height: calc(var(--ui-beancount-space-5) * 2.75);
    flex: none;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
  }

  .bc-source-account-groups__brand {
    background: color-mix(in srgb, var(--primary) 85%, var(--background));
    color: var(--primary-foreground);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
  }

  .bc-source-account-groups__brand[data-tone="positive"] {
    background: color-mix(
      in srgb,
      var(--ui-beancount-positive) 85%,
      var(--background)
    );
    color: var(--ui-beancount-surface);
  }

  .bc-source-account-groups__brand[data-tone="negative"] {
    background: color-mix(
      in srgb,
      var(--ui-beancount-negative) 78%,
      var(--background)
    );
    color: var(--destructive-foreground);
  }

  .bc-source-account-groups__other-icon {
    background: color-mix(in srgb, var(--ui-beancount-review) 10%, transparent);
    color: var(--ui-beancount-muted-foreground);
  }

  :global(.bc-source-account-groups__other-icon-glyph) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
  }

  .bc-source-account-groups__source-copy,
  .bc-source-account-groups__other-copy {
    display: grid;
    min-width: 0;
    gap: calc(var(--ui-beancount-space-1) / 2);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }

  .bc-source-account-groups__name {
    color: var(--ui-beancount-foreground);
    font-size: var(--text-lg);
    font-weight: var(--font-weight-semibold);
  }

  .bc-source-account-groups__details {
    display: grid;
    gap: var(--ui-beancount-space-4);
    border-top: 1px solid var(--ui-beancount-border);
    padding: var(--ui-beancount-space-4);
  }

  .bc-source-account-groups__account-group {
    overflow: hidden;
    border-radius: calc(var(--ui-beancount-radius-panel) * 1.5);
    background: color-mix(
      in srgb,
      var(--ui-beancount-muted) 80%,
      var(--ui-beancount-surface)
    );
  }

  .bc-source-account-groups__account-group header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-beancount-space-3);
    padding: var(--ui-beancount-space-4) calc(var(--ui-beancount-space-5));
  }

  .bc-source-account-groups__account-group h3,
  .bc-source-account-groups__account-group strong {
    margin: 0;
    color: var(--ui-beancount-foreground);
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
  }

  .bc-source-account-groups__account-group h3 span,
  .bc-source-account-groups__account-copy > span:last-child,
  .bc-source-account-groups__account-copy strong + span,
  .bc-source-account-groups__account-currency,
  .bc-source-account-groups__details-empty {
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-source-account-groups__account-group ul {
    display: grid;
    gap: 1px;
    margin: 0 var(--ui-beancount-space-1) var(--ui-beancount-space-1);
    padding: 0;
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface);
    list-style: none;
  }

  .bc-source-account-groups__account-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    background: var(--ui-beancount-surface);
  }

  .bc-source-account-groups__account-row > button {
    display: grid;
    min-width: 0;
    grid-template-columns: auto minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    padding: var(--ui-beancount-space-3);
    color: var(--ui-beancount-foreground);
    text-align: left;
  }

  .bc-source-account-groups__account-row > button:hover {
    background: var(--ui-beancount-muted);
  }

  .bc-source-account-groups__account-row > button:focus-visible,
  .bc-source-account-groups__account-menu-trigger:focus-visible {
    outline: 2px solid var(--ui-beancount-focus-ring);
    outline-offset: -2px;
  }

  .bc-source-account-groups__account-copy,
  .bc-source-account-groups__account-copy > span:first-child {
    display: grid;
    min-width: 0;
    gap: var(--ui-beancount-space-1);
  }

  .bc-source-account-groups__account-copy > span:first-child {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: var(--text-sm);
  }

  .bc-source-account-groups__account-copy > span:last-child,
  .bc-source-account-groups__account-copy strong + span,
  .bc-source-account-groups__account-currency {
    font-size: var(--text-xs);
  }

  .bc-source-account-groups__account-row > button > strong {
    white-space: nowrap;
  }

  .bc-source-account-groups__account-menu-trigger {
    display: inline-flex;
    width: calc(var(--ui-beancount-space-5) * 2);
    height: calc(var(--ui-beancount-space-5) * 2);
    align-items: center;
    justify-content: center;
    margin-inline-end: var(--ui-beancount-space-2);
    border-radius: var(--ui-beancount-radius-sm);
    color: var(--ui-beancount-muted-foreground);
  }

  .bc-source-account-groups__account-menu-trigger:hover {
    background: var(--ui-beancount-muted);
    color: var(--ui-beancount-foreground);
  }

  :global(.bc-source-account-groups__account-menu-trigger svg) {
    width: var(--ui-beancount-space-5);
    height: var(--ui-beancount-space-5);
  }

  .bc-source-account-groups__details-empty {
    margin: 0;
    padding-block: var(--ui-beancount-space-2);
    font-size: var(--text-sm);
  }
</style>
