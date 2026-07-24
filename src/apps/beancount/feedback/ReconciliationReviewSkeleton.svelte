<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div
  class="bc-reconciliation-review-skeleton"
  data-reconciliation-review-skeleton
  role="status"
  aria-busy="true"
  aria-label="Loading reconciliation matches"
>
  <Skeleton class="bc-reconciliation-review-skeleton__toolbar" />
  <div class="bc-reconciliation-review-skeleton__summary">
    <Skeleton class="bc-reconciliation-review-skeleton__summary-label" />
    <Skeleton class="bc-reconciliation-review-skeleton__summary-value" />
  </div>
  {#each Array.from({ length: 3 }, (_, index) => index) as item (item)}
    <section class="bc-reconciliation-review-skeleton__match">
      <div class="bc-reconciliation-review-skeleton__match-header">
        <div class="bc-reconciliation-review-skeleton__match-title">
          <Skeleton class="bc-reconciliation-review-skeleton__match-label" />
          <Skeleton class="bc-reconciliation-review-skeleton__match-badge" />
        </div>
        <div class="bc-reconciliation-review-skeleton__match-actions">
          <Skeleton class="bc-reconciliation-review-skeleton__match-action" />
          <Skeleton class="bc-reconciliation-review-skeleton__match-action" />
        </div>
        <Skeleton
          class="bc-reconciliation-review-skeleton__match-description"
        />
      </div>
      <div class="bc-reconciliation-review-skeleton__candidates">
        {#each Array.from({ length: 2 }, (_, index) => index) as row (row)}
          <div class="bc-reconciliation-review-skeleton__candidate">
            <Skeleton class="bc-reconciliation-review-skeleton__avatar" />
            <div class="bc-reconciliation-review-skeleton__candidate-copy">
              <Skeleton
                class="bc-reconciliation-review-skeleton__candidate-title"
              />
              <Skeleton
                class="bc-reconciliation-review-skeleton__candidate-subtitle"
              />
            </div>
            <Skeleton
              class="bc-reconciliation-review-skeleton__candidate-value"
            />
          </div>
        {/each}
      </div>
    </section>
  {/each}
</div>

<style>
  .bc-reconciliation-review-skeleton {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--ui-beancount-space-5);
  }

  :global(.bc-reconciliation-review-skeleton__toolbar) {
    width: 100%;
    height: var(--ui-beancount-space-10);
    border-radius: var(--radius-lg);
  }

  .bc-reconciliation-review-skeleton__summary {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: center;
    gap: var(--ui-beancount-space-4);
    border-radius: var(--radius-2xl);
    background: var(--ui-beancount-surface-muted);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
  }

  :global(.bc-reconciliation-review-skeleton__summary-label) {
    width: 4rem;
    height: var(--ui-beancount-space-3);
  }

  :global(.bc-reconciliation-review-skeleton__summary-value) {
    width: calc(var(--ui-beancount-space-4) * 3 + var(--ui-beancount-space-2));
    height: var(--ui-beancount-space-3);
  }

  .bc-reconciliation-review-skeleton__match {
    overflow: hidden;
    border-radius: var(--radius-2xl);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 80%,
      transparent
    );
  }

  .bc-reconciliation-review-skeleton__match-header {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    align-items: start;
    column-gap: var(--ui-beancount-space-3);
    row-gap: var(--ui-beancount-space-3);
    padding: var(--ui-beancount-space-4);
  }

  .bc-reconciliation-review-skeleton__match-title {
    display: flex;
    min-width: 0;
    align-items: center;
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-reconciliation-review-skeleton__match-label) {
    width: 9rem;
    height: var(--ui-beancount-space-4);
  }

  :global(.bc-reconciliation-review-skeleton__match-badge) {
    width: calc(var(--ui-beancount-space-5) * 2 + var(--ui-beancount-space-1));
    height: var(--ui-beancount-space-5);
    border-radius: 999px;
  }

  .bc-reconciliation-review-skeleton__match-actions {
    display: flex;
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-reconciliation-review-skeleton__match-action) {
    width: var(--ui-beancount-control-height);
    height: var(--ui-beancount-control-height);
    border-radius: var(--radius-md);
  }

  :global(.bc-reconciliation-review-skeleton__match-description) {
    grid-column: 1 / -1;
    width: 80%;
    height: var(--ui-beancount-space-3);
  }

  .bc-reconciliation-review-skeleton__candidates {
    overflow: hidden;
    margin-inline: var(--ui-beancount-space-1);
    margin-block-end: var(--ui-beancount-space-1);
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
  }

  .bc-reconciliation-review-skeleton__candidate {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: var(--ui-beancount-space-3);
    border-block-end: 1px solid var(--ui-beancount-border);
    padding: var(--ui-beancount-space-4) 15px;
  }

  .bc-reconciliation-review-skeleton__candidate:last-child {
    border-block-end: 0;
  }

  :global(.bc-reconciliation-review-skeleton__avatar) {
    width: var(--ui-beancount-space-10);
    height: var(--ui-beancount-space-10);
    border-radius: 999px;
  }

  .bc-reconciliation-review-skeleton__candidate-copy {
    display: flex;
    min-width: 0;
    flex-direction: column;
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-reconciliation-review-skeleton__candidate-title) {
    width: 10rem;
    max-width: 100%;
    height: var(--ui-beancount-space-3-5);
  }

  :global(.bc-reconciliation-review-skeleton__candidate-subtitle) {
    width: 13rem;
    max-width: 100%;
    height: var(--ui-beancount-space-3);
  }

  :global(.bc-reconciliation-review-skeleton__candidate-value) {
    grid-column: 2;
    width: 6rem;
    height: var(--ui-beancount-space-3-5);
  }

  @media (min-width: 640px) {
    .bc-reconciliation-review-skeleton__summary {
      padding: var(--ui-beancount-space-4) var(--ui-beancount-space-5);
    }

    .bc-reconciliation-review-skeleton__match-header {
      padding-inline: var(--ui-beancount-space-5);
    }

    .bc-reconciliation-review-skeleton__candidate {
      grid-template-columns: auto minmax(0, 1fr) auto;
    }

    :global(.bc-reconciliation-review-skeleton__candidate-value) {
      grid-column: auto;
      grid-row: 1;
    }
  }
</style>
