<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div
  class="bc-resource-viewer-skeleton"
  data-resource-viewer-skeleton
  aria-busy="true"
>
  <Skeleton class="bc-resource-viewer-skeleton__surface" />
</div>

<style>
  .bc-resource-viewer-skeleton {
    display: flex;
    min-height: 0;
    flex: 1 1 auto;
    flex-direction: column;
    gap: var(--ui-beancount-space-3);
  }

  :global(.bc-resource-viewer-skeleton__surface) {
    width: 100%;
    min-height: var(--ui-beancount-space-48);
    flex: 1 1 auto;
    border-radius: var(--radius-md);
  }
</style>
