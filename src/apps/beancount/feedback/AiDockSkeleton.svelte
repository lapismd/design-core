<script lang="ts">
  import { Skeleton } from "@stevejuma/ui/shadcn/skeleton";
</script>

<div
  class="flex flex-1 flex-col gap-4 p-1"
  data-ai-dock-skeleton
  aria-busy="true"
>
  {#each Array.from({ length: 4 }, (_, index) => index) as row (row)}
    <div
      class="flex flex-col gap-2"
      class:items-end={row % 2 === 1}
      class:items-start={row % 2 === 0}
    >
      <Skeleton
        class={row % 2 === 0
          ? "h-16 w-48 max-w-[85%] rounded-2xl"
          : "h-16 w-56 max-w-[85%] rounded-2xl"}
      />
    </div>
  {/each}
</div>
