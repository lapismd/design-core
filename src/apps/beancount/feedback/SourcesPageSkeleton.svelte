<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div class="flex flex-col gap-6" data-sources-page-skeleton aria-busy="true">
  {#each Array.from({ length: 3 }, (_, index) => index) as card (card)}
    <article
      class="border-border bg-card overflow-hidden rounded-xl border p-4 shadow-sm sm:p-6"
    >
      <div class="flex items-center gap-3">
        <Skeleton class="size-8 rounded-md" />
        <div class="flex min-w-0 flex-1 flex-col gap-2">
          <Skeleton class="h-4 w-44" />
          <Skeleton class="h-3 w-64" />
        </div>
        <Skeleton class="h-5 w-16 rounded-full" />
      </div>
      <div class="mt-5 flex flex-col gap-3 pl-2">
        {#each Array.from({ length: 4 }, (_, index) => index) as row (row)}
          <div class="grid grid-cols-[7rem_minmax(0,1fr)] items-center gap-3">
            <Skeleton class="h-3.5 w-full" />
            <Skeleton class="h-9 w-full" />
          </div>
        {/each}
      </div>
    </article>
  {/each}
</div>
