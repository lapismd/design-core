<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
  import QueryPageSkeleton from "./QueryPageSkeleton.svelte";

  let { routePath = "" }: { routePath?: string } = $props();

  const isQueryRoute = $derived(routePath.split("?")[0] === "/query");
</script>

{#if isQueryRoute}
  <QueryPageSkeleton />
{:else}
  <div
    class="flex h-full flex-col gap-4 p-4 sm:p-6"
    data-route-loading-skeleton
    role="status"
    aria-busy="true"
    aria-label="Loading ledger page"
  >
    <div class="flex items-center justify-between gap-3">
      <Skeleton class="h-5 w-36" />
      <div class="flex gap-2">
        <Skeleton class="size-8 rounded-md" />
        <Skeleton class="size-8 rounded-md" />
      </div>
    </div>
    <div class="bg-card overflow-hidden rounded-xl border shadow-sm">
      {#each Array.from({ length: 8 }, (_, index) => index) as row (row)}
        <div class="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
          <Skeleton class="h-3.5 w-20" />
          <Skeleton class="h-3.5 min-w-0 flex-1" />
          <Skeleton class="h-3.5 w-24" />
          <Skeleton class="h-3.5 w-16" />
        </div>
      {/each}
    </div>
  </div>
{/if}
