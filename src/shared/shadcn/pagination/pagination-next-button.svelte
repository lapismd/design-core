<script lang="ts">
  import { Pagination as PaginationPrimitive } from "bits-ui";
  import ChevronRightIcon from "@lucide/svelte/icons/chevron-right";

  let {
    ref = $bindable(null),
    class: className,
    children,
    ...restProps
  }: PaginationPrimitive.NextButtonProps = $props();
</script>

{#snippet Fallback()}
  <span>Next</span>
  <ChevronRightIcon
    data-ui-component="pagination"
    data-ui-part="pagination-next-button"
    data-slot="pagination-next-button"
    class={className}
  />
{/snippet}

<PaginationPrimitive.NextButton
  bind:ref
  aria-label="Go to next page"
  data-ui-component="pagination"
  data-ui-part="pagination-next-button-anon-0"
  data-slot="pagination-next-button-anon-0"
  class={className}
  {...restProps}
>
  {#if children}
    {@render children?.()}
  {:else}
    {@render Fallback()}
  {/if}
</PaginationPrimitive.NextButton>
