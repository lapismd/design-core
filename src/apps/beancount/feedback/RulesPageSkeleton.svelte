<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div class="bc-rules-page-skeleton" data-rules-page-skeleton aria-busy="true">
  <div class="bc-rules-page-skeleton__panel">
    {#each Array.from({ length: 4 }, (_, index) => index) as row (row)}
      <div class="bc-rules-page-skeleton__rule">
        <div class="bc-rules-page-skeleton__rule-copy">
          <Skeleton class="bc-rules-page-skeleton__rule-title" />
          <div class="bc-rules-page-skeleton__rule-badges">
            <Skeleton
              class="bc-rules-page-skeleton__rule-badge bc-rules-page-skeleton__rule-badge--one"
            />
            <Skeleton
              class="bc-rules-page-skeleton__rule-badge bc-rules-page-skeleton__rule-badge--two"
            />
            <Skeleton
              class="bc-rules-page-skeleton__rule-badge bc-rules-page-skeleton__rule-badge--three"
            />
          </div>
        </div>
        <Skeleton class="bc-rules-page-skeleton__rule-count" />
        <Skeleton class="bc-rules-page-skeleton__rule-action" />
      </div>
    {/each}
  </div>

  <div class="bc-rules-page-skeleton__history">
    <div class="bc-rules-page-skeleton__history-heading">
      <Skeleton class="bc-rules-page-skeleton__history-title" />
      <Skeleton class="bc-rules-page-skeleton__history-subtitle" />
    </div>
    <div class="bc-rules-page-skeleton__panel">
      <div class="bc-rules-page-skeleton__history-header">
        <div class="bc-rules-page-skeleton__history-grid">
          {#each Array.from({ length: 8 }, (_, index) => index) as col (col)}
            <Skeleton class="bc-rules-page-skeleton__history-head-cell" />
          {/each}
        </div>
      </div>
      {#each Array.from({ length: 5 }, (_, index) => index) as row (row)}
        <div class="bc-rules-page-skeleton__history-row">
          {#each Array.from({ length: 8 }, (_, index) => index) as col (col)}
            <Skeleton class="bc-rules-page-skeleton__history-cell" />
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>

<style>
  .bc-rules-page-skeleton {
    display: flex;
    flex-direction: column;
    gap: calc(var(--ui-beancount-space-3) * 2);
  }

  .bc-rules-page-skeleton__panel {
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--card);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-rules-page-skeleton__rule {
    display: grid;
    min-width: 0;
    grid-template-columns: minmax(0, 1fr) auto auto;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    border-block-end: 1px solid var(--ui-beancount-border);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
  }

  .bc-rules-page-skeleton__rule:last-child {
    border-block-end: 0;
  }

  .bc-rules-page-skeleton__rule-copy,
  .bc-rules-page-skeleton__history,
  .bc-rules-page-skeleton__history-heading {
    display: flex;
    min-width: 0;
    flex-direction: column;
  }

  .bc-rules-page-skeleton__rule-copy {
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-rules-page-skeleton__rule-title) {
    width: 9rem;
    height: var(--ui-beancount-space-4);
  }

  .bc-rules-page-skeleton__rule-badges {
    display: flex;
    flex-wrap: wrap;
    gap: calc(var(--ui-beancount-space-1) + var(--ui-beancount-space-1) / 2);
  }

  :global(.bc-rules-page-skeleton__rule-badge) {
    height: var(--ui-beancount-space-5);
    border-radius: 999px;
  }

  :global(.bc-rules-page-skeleton__rule-badge--one) {
    width: 10rem;
  }

  :global(.bc-rules-page-skeleton__rule-badge--two) {
    width: 12rem;
  }

  :global(.bc-rules-page-skeleton__rule-badge--three) {
    width: 11rem;
  }

  :global(.bc-rules-page-skeleton__rule-count) {
    width: calc(var(--ui-beancount-space-4) * 2 + var(--ui-beancount-space-1));
    height: var(--ui-beancount-space-5);
    border-radius: 999px;
  }

  :global(.bc-rules-page-skeleton__rule-action) {
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
    border-radius: var(--radius-md);
  }

  .bc-rules-page-skeleton__history {
    gap: var(--ui-beancount-space-3);
  }

  .bc-rules-page-skeleton__history-heading {
    gap: var(--ui-beancount-space-1);
  }

  :global(.bc-rules-page-skeleton__history-title) {
    width: 7rem;
    height: var(--ui-beancount-space-4);
  }

  :global(.bc-rules-page-skeleton__history-subtitle) {
    width: 16rem;
    height: var(--ui-beancount-space-3);
  }

  .bc-rules-page-skeleton__history-header,
  .bc-rules-page-skeleton__history-row {
    border-block-end: 1px solid var(--ui-beancount-border);
    padding: calc(var(--ui-beancount-space-2) + var(--ui-beancount-space-1) / 2)
      var(--ui-beancount-space-4);
  }

  .bc-rules-page-skeleton__history-header {
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 40%,
      transparent
    );
  }

  .bc-rules-page-skeleton__history-row:last-child {
    border-block-end: 0;
  }

  .bc-rules-page-skeleton__history-grid,
  .bc-rules-page-skeleton__history-row {
    display: grid;
    grid-template-columns: repeat(8, minmax(0, 1fr));
    gap: var(--ui-beancount-space-3);
  }

  :global(.bc-rules-page-skeleton__history-head-cell) {
    width: 100%;
    height: var(--ui-beancount-space-3);
  }

  :global(.bc-rules-page-skeleton__history-cell) {
    width: 100%;
    height: calc(var(--spacing) * 3.5);
  }
</style>
