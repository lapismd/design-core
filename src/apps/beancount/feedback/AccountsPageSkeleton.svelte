<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div
  class="bc-accounts-page-skeleton"
  data-accounts-page-skeleton
  aria-busy="true"
>
  <div class="bc-accounts-page-skeleton__tabs">
    <Skeleton
      class="bc-accounts-page-skeleton__tab bc-accounts-page-skeleton__tab--short"
    />
    <Skeleton
      class="bc-accounts-page-skeleton__tab bc-accounts-page-skeleton__tab--long"
    />
  </div>
  <article class="bc-accounts-page-skeleton__panel">
    <div class="bc-accounts-page-skeleton__panel-header">
      <Skeleton class="bc-accounts-page-skeleton__icon" />
      <div class="bc-accounts-page-skeleton__header-copy">
        <Skeleton class="bc-accounts-page-skeleton__title" />
        <Skeleton class="bc-accounts-page-skeleton__subtitle" />
      </div>
    </div>
    <div class="bc-accounts-page-skeleton__rows">
      {#each Array.from({ length: 5 }, (_, index) => index) as row (row)}
        <div class="bc-accounts-page-skeleton__row">
          <Skeleton class="bc-accounts-page-skeleton__check" />
          <div class="bc-accounts-page-skeleton__row-copy">
            <Skeleton class="bc-accounts-page-skeleton__row-title" />
            <Skeleton class="bc-accounts-page-skeleton__row-subtitle" />
          </div>
          <Skeleton class="bc-accounts-page-skeleton__row-action" />
        </div>
      {/each}
    </div>
  </article>
</div>

<style>
  .bc-accounts-page-skeleton {
    display: flex;
    flex-direction: column;
    gap: calc(var(--ui-beancount-space-3) * 2);
  }

  .bc-accounts-page-skeleton__tabs {
    display: flex;
    flex-wrap: wrap;
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-accounts-page-skeleton__tab) {
    height: var(--ui-beancount-compact-control-height);
    border-radius: var(--radius-md);
  }

  :global(.bc-accounts-page-skeleton__tab--short) {
    width: 7rem;
  }

  :global(.bc-accounts-page-skeleton__tab--long) {
    width: 8rem;
  }

  .bc-accounts-page-skeleton__panel {
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-accounts-page-skeleton__panel-header {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    border-block-end: 1px solid var(--ui-beancount-border);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
  }

  :global(.bc-accounts-page-skeleton__icon) {
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
    border-radius: var(--radius-md);
  }

  .bc-accounts-page-skeleton__header-copy,
  .bc-accounts-page-skeleton__row-copy {
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
    flex-direction: column;
  }

  .bc-accounts-page-skeleton__header-copy {
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-accounts-page-skeleton__title) {
    width: 10rem;
    height: var(--ui-beancount-space-4);
  }

  :global(.bc-accounts-page-skeleton__subtitle) {
    width: 14rem;
    height: var(--ui-beancount-space-3);
  }

  .bc-accounts-page-skeleton__rows {
    display: flex;
    flex-direction: column;
    padding: var(--ui-beancount-space-2);
  }

  .bc-accounts-page-skeleton__row {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    border-radius: var(--radius-lg);
    padding: calc(var(--ui-beancount-space-2) + var(--ui-beancount-space-1) / 2)
      var(--ui-beancount-space-3);
  }

  :global(.bc-accounts-page-skeleton__check) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    border-radius: var(--radius-sm);
  }

  .bc-accounts-page-skeleton__row-copy {
    gap: calc(var(--ui-beancount-space-1) + var(--ui-beancount-space-1) / 2);
  }

  :global(.bc-accounts-page-skeleton__row-title) {
    width: 12rem;
    height: var(--ui-beancount-space-3-5);
  }

  :global(.bc-accounts-page-skeleton__row-subtitle) {
    width: 8rem;
    height: var(--ui-beancount-space-3);
  }

  :global(.bc-accounts-page-skeleton__row-action) {
    width: 10rem;
    height: var(--ui-beancount-compact-control-height);
  }
</style>
