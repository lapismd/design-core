<script lang="ts">
  import { Badge } from "@stevejuma/ui/shadcn/badge";
  import { Button } from "@stevejuma/ui/shadcn/button";
  import AppShell from "./AppShell.svelte";

  const navigationItems = ["Overview", "Transactions", "Accounts", "Reports"];

  let activeView = $state("Transactions");
  let syncInProgress = $state(false);

  const selectView = (view: string) => {
    activeView = view;
  };
</script>

<div class="bc-app-shell-demo">
  <AppShell pageTitle={activeView} height="container" hasSidebar>
    <svelte:fragment slot="sidebar">
      <aside aria-label="Ledger navigation" class="bc-app-shell-demo__sidebar">
        <div class="bc-app-shell-demo__sidebar-heading">
          <p class="bc-app-shell-demo__sidebar-title">Northstar Ledger</p>
          <p class="bc-app-shell-demo__sidebar-detail">
            personal-2026.beancount
          </p>
        </div>
        <nav class="bc-app-shell-demo__navigation" aria-label="Workspace">
          {#each navigationItems as item}
            <Button
              type="button"
              variant={activeView === item ? "secondary" : "ghost"}
              size="sm"
              class="bc-app-shell-demo__navigation-item"
              aria-current={activeView === item ? "page" : undefined}
              onclick={() => selectView(item)}
            >
              {item}
            </Button>
          {/each}
        </nav>
        <div class="bc-app-shell-demo__sidebar-footer">
          <p class="bc-app-shell-demo__sidebar-status">Last synced just now</p>
        </div>
      </aside>
    </svelte:fragment>

    <svelte:fragment slot="title-trailing">
      {#if activeView === "Transactions"}
        <Badge variant="secondary" class="bc-app-shell-demo__count">3</Badge>
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="header-actions">
      <Button
        type="button"
        variant="ghost"
        size="xs"
        onclick={() => (syncInProgress = !syncInProgress)}
      >
        {syncInProgress ? "Pause sync" : "Sync ledger"}
      </Button>
      <Button
        type="button"
        size="xs"
        onclick={() => selectView("Transactions")}
      >
        New transaction
      </Button>
    </svelte:fragment>

    <svelte:fragment slot="status">
      {#if syncInProgress}
        <div class="bc-app-shell-demo__sync-status" role="status">
          <span class="bc-app-shell-demo__sync-indicator"></span>
          Syncing Barclays checking account…
        </div>
      {/if}
    </svelte:fragment>

    <section
      class="bc-app-shell-demo__content"
      aria-label={`${activeView} content`}
    >
      <p class="bc-app-shell-demo__eyebrow">Viewing</p>
      <h1 class="bc-app-shell-demo__title">{activeView}</h1>
      <div class="bc-app-shell-demo__table">
        <div class="bc-app-shell-demo__table-heading">
          <span>Date</span>
          <span>Description</span>
          <span class="bc-app-shell-demo__numeric">Amount</span>
        </div>
        <div class="bc-app-shell-demo__table-row">
          <span>18 Jul 2026</span>
          <span>Groceries</span>
          <span class="bc-app-shell-demo__numeric">£42.17</span>
        </div>
      </div>
    </section>
  </AppShell>
</div>

<style>
  .bc-app-shell-demo {
    height: 42rem;
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--radius-lg);
  }

  .bc-app-shell-demo__sidebar {
    display: flex;
    width: 16rem;
    height: 100%;
    flex: none;
    flex-direction: column;
    border-inline-end: 1px solid var(--ui-beancount-border);
    background: var(--ui-beancount-sidebar);
    color: var(--ui-beancount-sidebar-foreground);
    padding: var(--ui-beancount-space-3);
  }

  .bc-app-shell-demo__sidebar-heading {
    border-bottom: 1px solid var(--ui-beancount-border);
    padding-block-end: var(--ui-beancount-space-3);
  }

  .bc-app-shell-demo__sidebar-title,
  .bc-app-shell-demo__sidebar-detail,
  .bc-app-shell-demo__eyebrow,
  .bc-app-shell-demo__title,
  .bc-app-shell-demo__sidebar-status {
    margin: 0;
  }

  .bc-app-shell-demo__sidebar-title {
    font-size: var(--text-sm);
    font-weight: var(--font-weight-semibold);
  }

  .bc-app-shell-demo__sidebar-detail {
    margin-block-start: var(--ui-beancount-space-1);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
  }

  .bc-app-shell-demo__navigation {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-1);
    margin-block-start: var(--ui-beancount-space-4);
  }

  :global(.bc-app-shell-demo__navigation-item) {
    justify-content: flex-start;
  }

  .bc-app-shell-demo__sidebar-footer {
    margin-block-start: auto;
    border-top: 1px solid var(--ui-beancount-border);
    padding-block-start: var(--ui-beancount-space-3);
  }

  .bc-app-shell-demo__sidebar-status {
    padding-inline: var(--ui-beancount-space-2);
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-xs);
  }

  :global(.bc-app-shell-demo__count) {
    min-width: var(--ui-beancount-space-5);
    margin-inline-start: calc(var(--ui-beancount-space-2) * 0.75);
    font-variant-numeric: tabular-nums;
  }

  .bc-app-shell-demo__sync-status {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-2);
    border-bottom: 1px solid var(--ui-beancount-border);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 40%,
      transparent
    );
    color: var(--ui-beancount-muted-foreground);
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-3);
    font-size: var(--text-xs);
  }

  .bc-app-shell-demo__sync-indicator {
    width: var(--ui-beancount-space-2);
    height: var(--ui-beancount-space-2);
    border-radius: 999px;
    background: var(--ui-beancount-accent);
    animation: bc-app-shell-demo-pulse 1s ease-in-out infinite alternate;
  }

  .bc-app-shell-demo__content {
    height: 100%;
    overflow: auto;
    padding: var(--ui-beancount-space-5);
  }

  .bc-app-shell-demo__eyebrow {
    color: var(--ui-beancount-muted-foreground);
    font-size: var(--text-sm);
  }

  .bc-app-shell-demo__title {
    margin-block-start: var(--ui-beancount-space-1);
    font-size: var(--text-xl);
    font-weight: var(--font-weight-semibold);
  }

  .bc-app-shell-demo__table {
    margin-block-start: var(--ui-beancount-space-5);
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--radius-lg);
  }

  .bc-app-shell-demo__table-heading,
  .bc-app-shell-demo__table-row {
    display: grid;
    grid-template-columns: 8rem minmax(0, 1fr) 7rem;
  }

  .bc-app-shell-demo__table-heading {
    border-bottom: 1px solid var(--ui-beancount-border);
    background: var(--ui-beancount-surface-muted);
    color: var(--ui-beancount-muted-foreground);
    padding: var(--ui-beancount-space-2) var(--ui-beancount-space-3);
    font-size: var(--text-xs);
    font-weight: var(--font-weight-medium);
  }

  .bc-app-shell-demo__table-row {
    padding: var(--ui-beancount-space-3);
    font-size: var(--text-sm);
  }

  .bc-app-shell-demo__numeric {
    text-align: end;
    font-variant-numeric: tabular-nums;
  }

  @keyframes bc-app-shell-demo-pulse {
    to {
      opacity: 0.4;
    }
  }
</style>
