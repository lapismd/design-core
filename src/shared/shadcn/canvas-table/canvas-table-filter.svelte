<script lang="ts">
  import ListFilter from "@lucide/svelte/icons/list-filter";
  import * as Popover from "../popover/index.js";
  import { Button } from "../button/index.js";
  import {
    FilterBuilder,
    filterConditionCount,
  } from "../filter-builder/index.js";
  import type { CanvasTableResolvedField } from "./canvas-table-filter-match.js";
  import type { CanvasTableFiltering } from "./canvas-table-filter-types.js";
  let {
    config,
    fields,
    beforeOpen,
  }: {
    config: CanvasTableFiltering;
    fields: readonly CanvasTableResolvedField[];
    beforeOpen: () => void;
  } = $props();
  let open = $state(false);
  const count = $derived(filterConditionCount(config.value));
</script>

<Popover.Root
  bind:open
  onOpenChange={(value) => {
    if (value) beforeOpen();
  }}
>
  <Popover.Trigger>
    {#snippet child({ props })}
      <Button
        {...props}
        variant="ghost"
        size="sm"
        aria-label="Filter rows"
        data-filter-active={count > 0}
      >
        <ListFilter data-icon="inline-start" />
        {#if count}<span class="canvas-table__filter-count">{count}</span>{/if}
      </Button>
    {/snippet}
  </Popover.Trigger>
  <Popover.Content
    class="canvas-table__filter-popover"
    align="start"
    role="dialog"
    aria-label="Filter table rows"
  >
    {#if open}<FilterBuilder
        {fields}
        value={config.value}
        onValueChange={config.onValueChange}
      />{/if}
  </Popover.Content>
</Popover.Root>
