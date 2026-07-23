<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div class="bc-ai-dock-skeleton" data-ai-dock-skeleton aria-busy="true">
  {#each Array.from({ length: 4 }, (_, index) => index) as row (row)}
    <div
      class="bc-ai-dock-skeleton__row"
      class:bc-ai-dock-skeleton__row--end={row % 2 === 1}
    >
      <Skeleton
        class={row % 2 === 0
          ? "bc-ai-dock-skeleton__bubble"
          : "bc-ai-dock-skeleton__bubble bc-ai-dock-skeleton__bubble--wide"}
      />
    </div>
  {/each}
</div>

<style>
  .bc-ai-dock-skeleton {
    display: flex;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--ui-beancount-space-4);
    padding: var(--ui-beancount-space-1);
  }

  .bc-ai-dock-skeleton__row {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--ui-beancount-space-2);
  }

  .bc-ai-dock-skeleton__row--end {
    align-items: flex-end;
  }

  :global(.bc-ai-dock-skeleton__bubble) {
    width: 12rem;
    max-width: 85%;
    height: 4rem;
    border-radius: var(--radius-2xl);
  }

  :global(.bc-ai-dock-skeleton__bubble--wide) {
    width: 14rem;
  }
</style>
