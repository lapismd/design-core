<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div class="flex flex-col gap-6" data-rules-page-skeleton aria-busy="true">
  <div class="bg-card overflow-hidden rounded-xl border shadow-sm">
    {#each Array.from({ length: 4 }, (_, index) => index) as row (row)}
      <div
        class="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3 border-b px-4 py-3 last:border-b-0"
      >
        <div class="flex min-w-0 flex-col gap-2">
          <Skeleton class="h-4 w-36" />
          <div class="flex flex-wrap gap-1.5">
            <Skeleton class="h-5 w-40 rounded-full" />
            <Skeleton class="h-5 w-48 rounded-full" />
            <Skeleton class="h-5 w-44 rounded-full" />
          </div>
        </div>
        <Skeleton class="h-5 w-9 rounded-full" />
        <Skeleton class="size-8 rounded-md" />
      </div>
    {/each}
  </div>

  <div class="flex flex-col gap-3">
    <div class="flex flex-col gap-1">
      <Skeleton class="h-4 w-28" />
      <Skeleton class="h-3 w-64" />
    </div>
    <div class="bg-card overflow-hidden rounded-xl border shadow-sm">
      <div class="bg-muted/40 border-b px-4 py-2.5">
        <div class="grid grid-cols-8 gap-3">
          {#each Array.from({ length: 8 }, (_, index) => index) as col (col)}
            <Skeleton class="h-3 w-full" />
          {/each}
        </div>
      </div>
      {#each Array.from({ length: 5 }, (_, index) => index) as row (row)}
        <div
          class="grid grid-cols-8 gap-3 border-b px-4 py-2.5 last:border-b-0"
        >
          {#each Array.from({ length: 8 }, (_, index) => index) as col (col)}
            <Skeleton class="h-3.5 w-full" />
          {/each}
        </div>
      {/each}
    </div>
  </div>
</div>
