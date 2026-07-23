<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div
  class="bc-sources-page-skeleton"
  data-sources-page-skeleton
  aria-busy="true"
>
  {#each Array.from({ length: 3 }, (_, index) => index) as card (card)}
    <article class="bc-sources-page-skeleton__card">
      <div class="bc-sources-page-skeleton__header">
        <Skeleton class="bc-sources-page-skeleton__icon" />
        <div class="bc-sources-page-skeleton__copy">
          <Skeleton class="bc-sources-page-skeleton__title" />
          <Skeleton class="bc-sources-page-skeleton__subtitle" />
        </div>
        <Skeleton class="bc-sources-page-skeleton__badge" />
      </div>
      <div class="bc-sources-page-skeleton__fields">
        {#each Array.from({ length: 4 }, (_, index) => index) as row (row)}
          <div class="bc-sources-page-skeleton__field">
            <Skeleton class="bc-sources-page-skeleton__field-label" />
            <Skeleton class="bc-sources-page-skeleton__field-control" />
          </div>
        {/each}
      </div>
    </article>
  {/each}
</div>

<style>
  .bc-sources-page-skeleton {
    display: flex;
    flex-direction: column;
    gap: calc(var(--ui-beancount-space-3) * 2);
  }

  .bc-sources-page-skeleton__card {
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--card);
    padding: var(--ui-beancount-space-4);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-sources-page-skeleton__header {
    display: flex;
    align-items: center;
    gap: var(--ui-beancount-space-3);
  }

  :global(.bc-sources-page-skeleton__icon) {
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
    border-radius: var(--radius-md);
  }

  .bc-sources-page-skeleton__copy {
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-sources-page-skeleton__title) {
    width: 11rem;
    height: var(--ui-beancount-space-4);
  }

  :global(.bc-sources-page-skeleton__subtitle) {
    width: 16rem;
    height: var(--ui-beancount-space-3);
  }

  :global(.bc-sources-page-skeleton__badge) {
    width: 4rem;
    height: var(--ui-beancount-space-5);
    border-radius: 999px;
  }

  .bc-sources-page-skeleton__fields {
    display: flex;
    margin-block-start: var(--ui-beancount-space-5);
    padding-inline-start: var(--ui-beancount-space-2);
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  .bc-sources-page-skeleton__field {
    display: grid;
    grid-template-columns: 7rem minmax(0, 1fr);
    align-items: center;
    gap: var(--ui-beancount-space-3);
  }

  :global(.bc-sources-page-skeleton__field-label) {
    width: 100%;
    height: calc(var(--spacing) * 3.5);
  }

  :global(.bc-sources-page-skeleton__field-control) {
    width: 100%;
    height: var(--ui-beancount-control-height);
  }

  @media (min-width: 640px) {
    .bc-sources-page-skeleton__card {
      padding: calc(var(--ui-beancount-space-3) * 2);
    }
  }
</style>
