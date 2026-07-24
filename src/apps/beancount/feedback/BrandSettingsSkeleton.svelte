<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div
  class="bc-brand-settings-skeleton"
  data-brand-settings-skeleton
  aria-busy="true"
>
  <div class="bc-brand-settings-skeleton__heading">
    <Skeleton class="bc-brand-settings-skeleton__title" />
    <Skeleton
      class="bc-brand-settings-skeleton__description bc-brand-settings-skeleton__description--wide"
    />
    <Skeleton
      class="bc-brand-settings-skeleton__description bc-brand-settings-skeleton__description--medium"
    />
  </div>
  <article class="bc-brand-settings-skeleton__panel">
    <div class="bc-brand-settings-skeleton__fields">
      {#each Array.from({ length: 5 }, (_, index) => index) as row (row)}
        <div class="bc-brand-settings-skeleton__field">
          <Skeleton class="bc-brand-settings-skeleton__field-label" />
          <Skeleton class="bc-brand-settings-skeleton__field-control" />
        </div>
      {/each}
    </div>
  </article>
</div>

<style>
  .bc-brand-settings-skeleton {
    display: flex;
    flex-direction: column;
    gap: calc(var(--ui-beancount-space-3) * 2);
  }

  .bc-brand-settings-skeleton__heading,
  .bc-brand-settings-skeleton__fields {
    display: flex;
    flex-direction: column;
  }

  .bc-brand-settings-skeleton__heading {
    gap: var(--ui-beancount-space-2);
  }

  :global(.bc-brand-settings-skeleton__title) {
    width: 8rem;
    height: var(--ui-beancount-space-5);
  }

  :global(.bc-brand-settings-skeleton__description) {
    width: 100%;
    height: var(--ui-beancount-space-3-5);
  }

  :global(.bc-brand-settings-skeleton__description--wide) {
    max-width: 36rem;
  }

  :global(.bc-brand-settings-skeleton__description--medium) {
    max-width: 32rem;
  }

  .bc-brand-settings-skeleton__panel {
    overflow: hidden;
    border: 1px solid var(--ui-beancount-border);
    border-radius: var(--ui-beancount-radius-panel);
    background: var(--ui-beancount-surface-raised);
    padding: var(--ui-beancount-space-4);
    box-shadow: var(--ui-beancount-shadow-panel);
  }

  .bc-brand-settings-skeleton__fields {
    gap: var(--ui-beancount-space-4);
  }

  .bc-brand-settings-skeleton__field {
    display: grid;
    grid-template-columns: 8rem minmax(0, 1fr);
    align-items: center;
    gap: var(--ui-beancount-space-3);
  }

  :global(.bc-brand-settings-skeleton__field-label) {
    width: 100%;
    height: var(--ui-beancount-space-3-5);
  }

  :global(.bc-brand-settings-skeleton__field-control) {
    width: 100%;
    height: var(--ui-beancount-control-height);
  }

  @media (min-width: 640px) {
    .bc-brand-settings-skeleton__panel {
      padding: calc(var(--ui-beancount-space-3) * 2);
    }
  }
</style>
