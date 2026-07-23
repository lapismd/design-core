<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div class="flex flex-col gap-6" data-brand-settings-skeleton aria-busy="true">
  <div class="flex flex-col gap-2">
    <Skeleton class="h-5 w-32" />
    <Skeleton class="h-3.5 w-full max-w-xl" />
    <Skeleton class="h-3.5 w-full max-w-lg" />
  </div>
  <article
    class="border-border bg-card overflow-hidden rounded-xl border p-4 shadow-sm sm:p-6"
  >
    <div class="flex flex-col gap-4">
      {#each Array.from({ length: 5 }, (_, index) => index) as row (row)}
        <div class="grid grid-cols-[8rem_minmax(0,1fr)] items-center gap-3">
          <Skeleton class="h-3.5 w-full" />
          <Skeleton class="h-9 w-full" />
        </div>
      {/each}
    </div>
  </article>
</div>
