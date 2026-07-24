<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div
  class="bc-merchants-page-skeleton"
  data-merchants-page-skeleton
  aria-busy="true"
>
  <div class="bc-merchants-page-skeleton__panel">
    {#each Array.from({ length: 6 }, (_, index) => index) as row (row)}
      <div class="bc-merchants-page-skeleton__row">
        <Skeleton class="bc-merchants-page-skeleton__avatar" />
        <div class="bc-merchants-page-skeleton__copy">
          <Skeleton class="bc-merchants-page-skeleton__title" />
          <Skeleton class="bc-merchants-page-skeleton__subtitle" />
        </div>
        <Skeleton class="bc-merchants-page-skeleton__badge" />
        <Skeleton class="bc-merchants-page-skeleton__action" />
      </div>
    {/each}
  </div>
</div>

<style>
  .bc-merchants-page-skeleton {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-5);
  }

  .bc-merchants-page-skeleton__panel {
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-merchants-page-skeleton__row {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    border-block-end: 1px solid var(--ui-beancount-border);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
  }

  .bc-merchants-page-skeleton__row:last-child {
    border-block-end: 0;
  }

  :global(.bc-merchants-page-skeleton__avatar) {
    width: var(--ui-beancount-control-height);
    height: var(--ui-beancount-control-height);
    flex: 0 0 auto;
    border-radius: 999px;
  }

  .bc-merchants-page-skeleton__copy {
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
    flex-direction: column;
    gap: calc(var(--ui-beancount-space-1) + var(--ui-beancount-space-1) / 2);
  }

  :global(.bc-merchants-page-skeleton__title) {
    width: 11rem;
    height: var(--ui-beancount-space-4);
  }

  :global(.bc-merchants-page-skeleton__subtitle) {
    width: 7rem;
    height: var(--ui-beancount-space-3);
  }

  :global(.bc-merchants-page-skeleton__badge) {
    width: 4rem;
    height: var(--ui-beancount-space-5);
    border-radius: 999px;
  }

  :global(.bc-merchants-page-skeleton__action) {
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
    border-radius: var(--radius-md);
  }
</style>
