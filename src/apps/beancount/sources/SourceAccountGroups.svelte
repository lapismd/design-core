<script lang="ts">
  import ChevronRight from "@lucide/svelte/icons/chevron-right";
  import Landmark from "@lucide/svelte/icons/landmark";
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import * as Card from "@stevejuma/ui/shadcn/card";
  import type { SourceBrandTone } from "./SourceConnectionCatalog.svelte";

  export type SourceAccountSource = {
    id: string;
    name: string;
    initials: string;
    credentialLabel: string;
    syncLabel: string;
    tone?: SourceBrandTone;
  };

  export type UnassignedAccountGroup = {
    id: string;
    label: string;
    description: string;
    count: number;
  };

  let {
    source,
    otherAccounts,
    ariaLabel = "Import accounts",
    onOpenSource = () => {},
    onOpenOtherAccounts = () => {},
  }: {
    source: SourceAccountSource;
    otherAccounts: UnassignedAccountGroup;
    ariaLabel?: string;
    /** Requests that the host open source-account setup. */
    onOpenSource?: (source: SourceAccountSource) => void;
    /** Requests that the host open ledger accounts without a sync source. */
    onOpenOtherAccounts?: (group: UnassignedAccountGroup) => void;
  } = $props();
</script>

<section class="bc-source-account-groups" aria-label={ariaLabel}>
  <Card.Root class="bc-source-account-groups__card">
    <button
      type="button"
      class="bc-source-account-groups__source-action"
      aria-label={`Open ${source.name} accounts`}
      onclick={() => onOpenSource(source)}
    >
      <ChevronRight
        class="bc-source-account-groups__chevron"
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
  </Card.Root>

  <Card.Root class="bc-source-account-groups__card">
    <button
      type="button"
      class="bc-source-account-groups__other-action"
      aria-label={`Open ${otherAccounts.label}`}
      onclick={() => onOpenOtherAccounts(otherAccounts)}
    >
      <ChevronRight
        class="bc-source-account-groups__chevron"
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
</style>
