<script lang="ts">
  import { ScrollArea } from "@lapismd/design-core/shadcn/scroll-area";

  const rows = Array.from({ length: 40 }, (_, index) => `Row ${index + 1}`);
</script>

<div class="imperative-scroll-fixture" data-testid="imperative-scroll-fixture">
  <ScrollArea class="imperative-scroll-fixture__scroll">
    <ol class="imperative-scroll-fixture__list">
      {#each rows as row (row)}
        <li>{row}</li>
      {/each}
    </ol>
  </ScrollArea>
</div>

<style>
  .imperative-scroll-fixture {
    display: flex;
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    flex-direction: column;
    overflow: hidden;
  }

  .imperative-scroll-fixture :global(.imperative-scroll-fixture__scroll) {
    width: 100%;
    height: 100%;
    min-width: 0;
    min-height: 0;
    flex: 1 1 auto;
  }

  .imperative-scroll-fixture__list {
    display: flex;
    margin: 0;
    padding: 0.75rem 1rem;
    flex-direction: column;
    gap: 0.5rem;
  }
</style>
