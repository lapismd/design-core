<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div
  class="bc-review-imports-skeleton"
  data-review-imports-skeleton
  aria-busy="true"
>
  <div class="bc-review-imports-skeleton__header">
    <div class="bc-review-imports-skeleton__heading">
      <Skeleton class="bc-review-imports-skeleton__title" />
      <Skeleton class="bc-review-imports-skeleton__subtitle" />
    </div>
    <Skeleton class="bc-review-imports-skeleton__filter" />
  </div>
  <div class="bc-review-imports-skeleton__panel">
    {#each Array.from({ length: 3 }, (_, index) => index) as group (group)}
      <div class="bc-review-imports-skeleton__group">
        <div class="bc-review-imports-skeleton__group-header">
          <Skeleton class="bc-review-imports-skeleton__check" />
          <Skeleton class="bc-review-imports-skeleton__group-title" />
          <Skeleton class="bc-review-imports-skeleton__count" />
        </div>
        {#each Array.from({ length: 3 }, (_, index) => index) as row (row)}
          <div class="bc-review-imports-skeleton__row">
            <Skeleton class="bc-review-imports-skeleton__check" />
            <div class="bc-review-imports-skeleton__row-copy">
              <Skeleton class="bc-review-imports-skeleton__row-title" />
              <Skeleton class="bc-review-imports-skeleton__row-subtitle" />
            </div>
            <Skeleton class="bc-review-imports-skeleton__row-amount" />
            <Skeleton class="bc-review-imports-skeleton__row-status" />
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>

<style>
  .bc-review-imports-skeleton {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-5);
  }

  .bc-review-imports-skeleton__header {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-4);
  }

  .bc-review-imports-skeleton__heading,
  .bc-review-imports-skeleton__row-copy {
    display: flex;
    flex-direction: column;
  }

  .bc-review-imports-skeleton__heading {
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-review-imports-skeleton__title) {
    width: 6rem;
    height: var(--ui-beancount-space-5);
  }

  :global(.bc-review-imports-skeleton__subtitle) {
    width: 12rem;
    height: var(--ui-beancount-space-3-5);
  }

  :global(.bc-review-imports-skeleton__filter) {
    width: 100%;
    height: var(--ui-beancount-control-height);
    border-radius: var(--radius-lg);
  }

  .bc-review-imports-skeleton__panel {
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-review-imports-skeleton__group {
    border-block-end: 1px solid var(--ui-beancount-border);
  }

  .bc-review-imports-skeleton__group:last-child {
    border-block-end: 0;
  }

  .bc-review-imports-skeleton__group-header {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 30%,
      transparent
    );
    padding: calc(var(--ui-beancount-space-2) + var(--ui-beancount-space-1) / 2)
      var(--ui-beancount-space-4);
  }

  :global(.bc-review-imports-skeleton__check) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    border-radius: var(--radius-sm);
  }

  :global(.bc-review-imports-skeleton__group-title) {
    width: 9rem;
    height: var(--ui-beancount-space-3-5);
  }

  :global(.bc-review-imports-skeleton__count) {
    width: calc(var(--ui-beancount-space-5) * 2);
    height: var(--ui-beancount-space-5);
    margin-inline-start: auto;
    border-radius: 999px;
  }

  .bc-review-imports-skeleton__row {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: var(--ui-beancount-space-3);
    border-block-start: 1px solid var(--ui-beancount-border);
    padding: calc(var(--ui-beancount-space-2) + var(--ui-beancount-space-1) / 2)
      var(--ui-beancount-space-4);
  }

  .bc-review-imports-skeleton__row-copy {
    min-width: 0;
    gap: calc(var(--ui-beancount-space-1) + var(--ui-beancount-space-1) / 2);
  }

  :global(.bc-review-imports-skeleton__row-title) {
    width: 13rem;
    height: var(--ui-beancount-space-3-5);
  }

  :global(.bc-review-imports-skeleton__row-subtitle) {
    width: 7rem;
    height: var(--ui-beancount-space-3);
  }

  :global(.bc-review-imports-skeleton__row-amount) {
    grid-column: 2;
    width: 5rem;
    height: var(--ui-beancount-space-3-5);
  }

  :global(.bc-review-imports-skeleton__row-status) {
    display: none;
    width: 4rem;
    height: var(--ui-beancount-space-3-5);
  }

  @media (min-width: 640px) {
    .bc-review-imports-skeleton__header {
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
    }

    :global(.bc-review-imports-skeleton__filter) {
      width: 14rem;
    }

    .bc-review-imports-skeleton__row {
      grid-template-columns: auto minmax(0, 1fr) auto auto;
    }

    :global(.bc-review-imports-skeleton__row-amount) {
      grid-column: auto;
    }

    :global(.bc-review-imports-skeleton__row-status) {
      display: block;
    }
  }
</style>
