<script lang="ts">
  import AppShell from "./AppShell.svelte";

  const navigationItems = ["Overview", "Transactions", "Accounts", "Reports"];

  let activeView = $state("Transactions");
  let syncInProgress = $state(false);

  const selectView = (view: string) => {
    activeView = view;
  };
</script>

<div class="border-border h-[42rem] overflow-hidden rounded-lg border">
  <AppShell pageTitle={activeView} height="container" hasSidebar>
    <svelte:fragment slot="sidebar">
      <aside
        aria-label="Ledger navigation"
        class="border-sidebar-border bg-sidebar text-sidebar-foreground flex h-full w-64 shrink-0 flex-col border-r p-3"
      >
        <div class="border-sidebar-border border-b pb-3">
          <p class="text-sm font-semibold">Northstar Ledger</p>
          <p class="text-muted-foreground mt-1 text-xs">
            personal-2026.beancount
          </p>
        </div>
        <nav class="mt-4 flex flex-col gap-1" aria-label="Workspace">
          {#each navigationItems as item}
            <button
              type="button"
              class={activeView === item
                ? "border-sidebar-border bg-background rounded-md border px-2 py-2 text-left text-sm font-medium shadow-sm"
                : "text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-md px-2 py-2 text-left text-sm"}
              aria-current={activeView === item ? "page" : undefined}
              onclick={() => selectView(item)}
            >
              {item}
            </button>
          {/each}
        </nav>
        <div class="border-sidebar-border mt-auto border-t pt-3">
          <p class="text-muted-foreground px-2 text-xs">Last synced just now</p>
        </div>
      </aside>
    </svelte:fragment>

    <svelte:fragment slot="title-trailing">
      {#if activeView === "Transactions"}
        <span
          class="bg-muted text-muted-foreground ml-1.5 inline-flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full px-1.5 text-[11px] font-medium tabular-nums"
          >3</span
        >
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="header-actions">
      <button
        type="button"
        class="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded-md px-2 py-1 text-xs font-medium"
        onclick={() => (syncInProgress = !syncInProgress)}
      >
        {syncInProgress ? "Pause sync" : "Sync ledger"}
      </button>
      <button
        type="button"
        class="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-2.5 py-1 text-xs font-medium"
        onclick={() => selectView("Transactions")}
      >
        New transaction
      </button>
    </svelte:fragment>

    <svelte:fragment slot="status">
      {#if syncInProgress}
        <div
          class="border-border bg-muted/40 text-muted-foreground flex items-center gap-2 border-b px-3 py-2 text-xs"
          role="status"
        >
          <span class="bg-primary size-2 animate-pulse rounded-full"></span>
          Syncing Barclays checking account…
        </div>
      {/if}
    </svelte:fragment>

    <section
      class="h-full overflow-auto p-5"
      aria-label={`${activeView} content`}
    >
      <p class="text-muted-foreground text-sm">Viewing</p>
      <h1 class="mt-1 text-xl font-semibold">{activeView}</h1>
      <div class="border-border mt-5 overflow-hidden rounded-lg border">
        <div
          class="border-border bg-muted text-muted-foreground grid grid-cols-[8rem_minmax(0,1fr)_7rem] border-b px-3 py-2 text-xs font-medium"
        >
          <span>Date</span>
          <span>Description</span>
          <span class="text-right">Amount</span>
        </div>
        <div class="grid grid-cols-[8rem_minmax(0,1fr)_7rem] px-3 py-3 text-sm">
          <span>18 Jul 2026</span>
          <span>Groceries</span>
          <span class="text-right tabular-nums">£42.17</span>
        </div>
      </div>
    </section>
  </AppShell>
</div>
