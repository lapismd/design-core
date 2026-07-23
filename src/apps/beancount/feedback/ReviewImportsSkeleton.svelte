<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div class="flex flex-col gap-5" data-review-imports-skeleton aria-busy="true">
  <div
    class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex flex-col gap-2">
      <Skeleton class="h-5 w-24" />
      <Skeleton class="h-3.5 w-48" />
    </div>
    <Skeleton class="h-9 w-full rounded-lg sm:w-56" />
  </div>
  <div class="bg-card overflow-hidden rounded-xl border shadow-sm">
    {#each Array.from({ length: 3 }, (_, index) => index) as group (group)}
      <div class="border-b last:border-b-0">
        <div class="bg-muted/30 flex items-center gap-3 px-4 py-2.5">
          <Skeleton class="size-4 rounded-sm" />
          <Skeleton class="h-3.5 w-36" />
          <Skeleton class="ml-auto h-5 w-10 rounded-full" />
        </div>
        {#each Array.from({ length: 3 }, (_, index) => index) as row (row)}
          <div
            class="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-3 border-t px-4 py-2.5 sm:grid-cols-[auto_minmax(0,1fr)_auto_auto]"
          >
            <Skeleton class="size-4 rounded-sm" />
            <div class="flex min-w-0 flex-col gap-1.5">
              <Skeleton class="h-3.5 w-52" />
              <Skeleton class="h-3 w-28" />
            </div>
            <Skeleton class="col-start-2 h-3.5 w-20 sm:col-start-auto" />
            <Skeleton class="hidden h-3.5 w-16 sm:block" />
          </div>
        {/each}
      </div>
    {/each}
  </div>
</div>
