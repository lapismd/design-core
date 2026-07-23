<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div
  class="flex min-w-0 flex-col gap-5"
  data-reconciliation-review-skeleton
  role="status"
  aria-busy="true"
  aria-label="Loading reconciliation matches"
>
  <Skeleton class="h-10 w-full rounded-lg" />
  <div
    class="bg-muted grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-2xl px-4 py-3 sm:px-5 sm:py-4"
  >
    <Skeleton class="h-3 w-16" />
    <Skeleton class="h-3 w-14" />
  </div>
  {#each Array.from({ length: 3 }, (_, index) => index) as item (item)}
    <section class="bg-muted/80 overflow-hidden rounded-2xl">
      <div
        class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-3 px-4 py-4 sm:px-5"
      >
        <div class="flex min-w-0 items-center gap-2">
          <Skeleton class="h-4 w-36" />
          <Skeleton class="h-5 w-14 rounded-full" />
        </div>
        <div class="flex gap-2">
          <Skeleton class="size-9 rounded-md" />
          <Skeleton class="size-9 rounded-md" />
        </div>
        <Skeleton class="col-span-full h-3 w-4/5" />
      </div>
      <div class="bg-card mx-1 mb-1 overflow-hidden rounded-xl border">
        {#each Array.from({ length: 2 }, (_, index) => index) as row (row)}
          <div
            class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-b px-[15px] py-4 last:border-b-0 sm:grid-cols-[auto_minmax(0,1fr)_auto]"
          >
            <Skeleton class="size-10 rounded-full" />
            <div class="flex min-w-0 flex-col gap-2">
              <Skeleton class="h-3.5 w-40 max-w-full" />
              <Skeleton class="h-3 w-52 max-w-full" />
            </div>
            <Skeleton
              class="col-start-2 h-3.5 w-24 sm:col-start-auto sm:row-start-1"
            />
          </div>
        {/each}
      </div>
    </section>
  {/each}
</div>
