<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div
  class="flex h-full min-w-0 flex-col p-4"
  data-route-loading-skeleton
  data-query-page-skeleton
  role="status"
  aria-busy="true"
  aria-label="Loading query page"
>
  <div
    class="bg-muted/35 flex h-10 w-full items-center rounded-md border shadow-sm"
  >
    <Skeleton class="ml-3 size-4 shrink-0 rounded-full" />
    <Skeleton class="mx-3 h-3.5 min-w-0 flex-1" />
    <Skeleton class="mr-1 h-7 w-20 shrink-0 rounded-sm" />
  </div>

  <div class="flex flex-col gap-3 pt-3">
    {#each Array.from({ length: 2 }, (_, index) => index) as query (query)}
      <article
        class="bg-card text-card-foreground overflow-hidden rounded-xl border shadow-sm"
      >
        <div class="flex min-h-14 items-stretch gap-3">
          <div class="flex min-w-0 flex-1">
            <div class="flex h-full w-full items-center gap-3 pl-4">
              <Skeleton class="size-3 shrink-0 rounded-sm" />
              <Skeleton class="h-3.5 w-80 max-w-[55%]" />
            </div>
          </div>
          <div class="flex shrink-0 items-center gap-1 pr-4">
            <Skeleton class="size-8 rounded-md" />
            <Skeleton class="size-8 rounded-md" />
          </div>
        </div>

        {#if query === 0}
          <div class="bg-muted/20 border-t p-4" data-query-skeleton-result>
            <div class="bg-card overflow-hidden rounded-xl border shadow-sm">
              <div
                class="bg-muted grid grid-cols-[minmax(0,1fr)_5rem_4rem] gap-3 border-b px-4 py-3"
              >
                <Skeleton class="h-3 w-24" />
                <Skeleton class="h-3 w-full" />
                <Skeleton class="h-3 w-full" />
              </div>
              {#each Array.from({ length: 3 }, (_, index) => index) as row (row)}
                <div
                  class="grid grid-cols-[minmax(0,1fr)_5rem_4rem] gap-3 border-b px-4 py-3 last:border-b-0"
                  data-query-skeleton-row
                >
                  <Skeleton class="h-3.5 w-3/4" />
                  <Skeleton class="h-3.5 w-full" />
                  <Skeleton class="h-3.5 w-full" />
                </div>
              {/each}
            </div>
          </div>
        {/if}
      </article>
    {/each}
  </div>
</div>
