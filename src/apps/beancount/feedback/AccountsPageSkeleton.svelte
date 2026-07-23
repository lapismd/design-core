<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div class="flex flex-col gap-6" data-accounts-page-skeleton aria-busy="true">
  <div class="flex flex-wrap gap-2">
    <Skeleton class="h-8 w-28 rounded-md" />
    <Skeleton class="h-8 w-32 rounded-md" />
  </div>
  <article
    class="border-border bg-card overflow-hidden rounded-xl border shadow-sm"
  >
    <div class="flex items-center gap-3 border-b px-4 py-3">
      <Skeleton class="size-8 rounded-md" />
      <div class="flex min-w-0 flex-1 flex-col gap-2">
        <Skeleton class="h-4 w-40" />
        <Skeleton class="h-3 w-56" />
      </div>
    </div>
    <div class="flex flex-col gap-0 p-2">
      {#each Array.from({ length: 5 }, (_, index) => index) as row (row)}
        <div class="flex items-center gap-3 rounded-lg px-3 py-2.5">
          <Skeleton class="size-4 rounded-sm" />
          <div class="flex min-w-0 flex-1 flex-col gap-1.5">
            <Skeleton class="h-3.5 w-48" />
            <Skeleton class="h-3 w-32" />
          </div>
          <Skeleton class="h-8 w-40" />
        </div>
      {/each}
    </div>
  </article>
</div>
