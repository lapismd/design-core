<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
  import QueryPageSkeleton from "./QueryPageSkeleton.svelte";

  let { routePath = "" }: { routePath?: string } = $props();

  const isQueryRoute = $derived(routePath.split("?")[0] === "/query");
</script>

{#if isQueryRoute}
  <QueryPageSkeleton />
{:else}
  <div
    class="bc-route-loading-skeleton"
    data-route-loading-skeleton
    role="status"
    aria-busy="true"
    aria-label="Loading ledger page"
  >
    <div class="bc-route-loading-skeleton__header">
      <Skeleton class="bc-route-loading-skeleton__title" />
      <div class="bc-route-loading-skeleton__actions">
        <Skeleton class="bc-route-loading-skeleton__action" />
        <Skeleton class="bc-route-loading-skeleton__action" />
      </div>
    </div>
    <div class="bc-route-loading-skeleton__panel">
      {#each Array.from({ length: 8 }, (_, index) => index) as row (row)}
        <div class="bc-route-loading-skeleton__row">
          <Skeleton
            class="bc-route-loading-skeleton__cell bc-route-loading-skeleton__cell--date"
          />
          <Skeleton
            class="bc-route-loading-skeleton__cell bc-route-loading-skeleton__cell--main"
          />
          <Skeleton
            class="bc-route-loading-skeleton__cell bc-route-loading-skeleton__cell--amount"
          />
          <Skeleton
            class="bc-route-loading-skeleton__cell bc-route-loading-skeleton__cell--status"
          />
        </div>
      {/each}
    </div>
  </div>
{/if}

<style>
  .bc-route-loading-skeleton {
    display: flex;
    height: 100%;
    flex-direction: column;
    gap: var(--ui-beancount-space-4);
    padding: var(--ui-beancount-space-4);
  }

  .bc-route-loading-skeleton__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--ui-beancount-space-3);
  }

  :global(.bc-route-loading-skeleton__title) {
    width: 9rem;
    height: var(--ui-beancount-space-5);
  }

  .bc-route-loading-skeleton__actions {
    display: flex;
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-route-loading-skeleton__action) {
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
    border-radius: var(--radius-md);
  }

  .bc-route-loading-skeleton__panel {
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--card);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-route-loading-skeleton__row {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    border-block-end: 1px solid var(--ui-beancount-border);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
  }

  .bc-route-loading-skeleton__row:last-child {
    border-block-end: 0;
  }

  :global(.bc-route-loading-skeleton__cell) {
    height: calc(var(--spacing) * 3.5);
  }

  :global(.bc-route-loading-skeleton__cell--date) {
    width: 5rem;
  }

  :global(.bc-route-loading-skeleton__cell--main) {
    min-width: 0;
    flex: 1 1 auto;
  }

  :global(.bc-route-loading-skeleton__cell--amount) {
    width: 6rem;
  }

  :global(.bc-route-loading-skeleton__cell--status) {
    width: 4rem;
  }

  @media (min-width: 640px) {
    .bc-route-loading-skeleton {
      padding: calc(var(--ui-beancount-space-3) * 2);
    }
  }
</style>
