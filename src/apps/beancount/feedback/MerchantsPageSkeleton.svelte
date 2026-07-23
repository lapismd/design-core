<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div class="flex flex-col gap-5" data-merchants-page-skeleton aria-busy="true">
  <div class="bg-card overflow-hidden rounded-xl border shadow-sm">
    {#each Array.from({ length: 6 }, (_, index) => index) as row (row)}
      <div class="flex items-center gap-3 border-b px-4 py-3 last:border-b-0">
        <Skeleton class="size-9 shrink-0 rounded-full" />
        <div class="flex min-w-0 flex-1 flex-col gap-1.5">
          <Skeleton class="h-4 w-44" />
          <Skeleton class="h-3 w-28" />
        </div>
        <Skeleton class="h-5 w-16 rounded-full" />
        <Skeleton class="size-8 rounded-md" />
      </div>
    {/each}
  </div>
</div>
