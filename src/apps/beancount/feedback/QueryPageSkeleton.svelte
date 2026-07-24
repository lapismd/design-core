<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div
  class="bc-query-page-skeleton"
  data-route-loading-skeleton
  data-query-page-skeleton
  role="status"
  aria-busy="true"
  aria-label="Loading query page"
>
  <div class="bc-query-page-skeleton__search">
    <Skeleton class="bc-query-page-skeleton__search-icon" />
    <Skeleton class="bc-query-page-skeleton__search-text" />
    <Skeleton class="bc-query-page-skeleton__search-action" />
  </div>

  <div class="bc-query-page-skeleton__queries">
    {#each Array.from({ length: 2 }, (_, index) => index) as query (query)}
      <article class="bc-query-page-skeleton__query">
        <div class="bc-query-page-skeleton__query-header">
          <div class="bc-query-page-skeleton__query-summary">
            <div class="bc-query-page-skeleton__query-copy">
              <Skeleton class="bc-query-page-skeleton__query-marker" />
              <Skeleton class="bc-query-page-skeleton__query-title" />
            </div>
          </div>
          <div class="bc-query-page-skeleton__query-actions">
            <Skeleton class="bc-query-page-skeleton__query-action" />
            <Skeleton class="bc-query-page-skeleton__query-action" />
          </div>
        </div>

        {#if query === 0}
          <div
            class="bc-query-page-skeleton__result"
            data-query-skeleton-result
          >
            <div class="bc-query-page-skeleton__result-table">
              <div class="bc-query-page-skeleton__result-header">
                <Skeleton class="bc-query-page-skeleton__result-label" />
                <Skeleton class="bc-query-page-skeleton__result-cell" />
                <Skeleton class="bc-query-page-skeleton__result-cell" />
              </div>
              {#each Array.from({ length: 3 }, (_, index) => index) as row (row)}
                <div
                  class="bc-query-page-skeleton__result-row"
                  data-query-skeleton-row
                >
                  <Skeleton class="bc-query-page-skeleton__result-primary" />
                  <Skeleton class="bc-query-page-skeleton__result-cell" />
                  <Skeleton class="bc-query-page-skeleton__result-cell" />
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </article>
    {/each}
  </div>
</div>

<style>
  .bc-query-page-skeleton {
    display: flex;
    height: 100%;
    min-width: 0;
    flex-direction: column;
    padding: var(--ui-beancount-space-4);
  }

  .bc-query-page-skeleton__search {
    display: flex;
    width: 100%;
    height: var(--ui-beancount-space-10);
    align-items: center;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--radius-md);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 35%,
      transparent
    );
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  :global(.bc-query-page-skeleton__search-icon) {
    width: var(--ui-beancount-space-4);
    height: var(--ui-beancount-space-4);
    flex: 0 0 auto;
    margin-inline-start: var(--ui-beancount-space-3);
    border-radius: 999px;
  }

  :global(.bc-query-page-skeleton__search-text) {
    min-width: 0;
    height: var(--ui-beancount-space-3-5);
    flex: 1 1 auto;
    margin-inline: var(--ui-beancount-space-3);
  }

  :global(.bc-query-page-skeleton__search-action) {
    width: 5rem;
    height: var(--ui-beancount-space-7);
    flex: 0 0 auto;
    margin-inline-end: var(--ui-beancount-space-1);
    border-radius: var(--radius-sm);
  }

  .bc-query-page-skeleton__queries {
    display: flex;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
    padding-block-start: var(--ui-beancount-space-3);
  }

  .bc-query-page-skeleton__query {
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
    color: var(--ui-beancount-surface-raised-foreground);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-query-page-skeleton__query-header {
    display: flex;
    min-height: var(--ui-beancount-space-14);
    align-items: stretch;
    gap: var(--ui-beancount-space-3);
  }

  .bc-query-page-skeleton__query-summary {
    display: flex;
    min-width: 0;
    flex: 1 1 auto;
  }

  .bc-query-page-skeleton__query-copy {
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    gap: var(--ui-beancount-space-3);
    padding-inline-start: var(--ui-beancount-space-4);
  }

  :global(.bc-query-page-skeleton__query-marker) {
    width: var(--ui-beancount-space-3);
    height: var(--ui-beancount-space-3);
    flex: 0 0 auto;
    border-radius: var(--radius-sm);
  }

  :global(.bc-query-page-skeleton__query-title) {
    width: 20rem;
    max-width: 55%;
    height: var(--ui-beancount-space-3-5);
  }

  .bc-query-page-skeleton__query-actions {
    display: flex;
    flex: 0 0 auto;
    align-items: center;
    gap: var(--ui-beancount-space-1);
    padding-inline-end: var(--ui-beancount-space-4);
  }

  :global(.bc-query-page-skeleton__query-action) {
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
    border-radius: var(--radius-md);
  }

  .bc-query-page-skeleton__result {
    border-block-start: 1px solid var(--ui-beancount-border);
    background: color-mix(
      in srgb,
      var(--ui-beancount-surface-muted) 20%,
      transparent
    );
    padding: var(--ui-beancount-space-4);
  }

  .bc-query-page-skeleton__result-table {
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-query-page-skeleton__result-header,
  .bc-query-page-skeleton__result-row {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 5rem 4rem;
    gap: var(--ui-beancount-space-3);
    border-block-end: 1px solid var(--ui-beancount-border);
    padding: var(--ui-beancount-space-3) var(--ui-beancount-space-4);
  }

  .bc-query-page-skeleton__result-header {
    background: var(--ui-beancount-surface-muted);
  }

  .bc-query-page-skeleton__result-row:last-child {
    border-block-end: 0;
  }

  :global(.bc-query-page-skeleton__result-label),
  :global(.bc-query-page-skeleton__result-cell) {
    width: 100%;
    height: var(--ui-beancount-space-3);
  }

  :global(.bc-query-page-skeleton__result-label) {
    width: 6rem;
  }

  :global(.bc-query-page-skeleton__result-primary) {
    width: 75%;
    height: var(--ui-beancount-space-3-5);
  }

  :global(
      .bc-query-page-skeleton__result-row .bc-query-page-skeleton__result-cell
    ) {
    height: var(--ui-beancount-space-3-5);
  }
</style>
