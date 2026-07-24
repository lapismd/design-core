<script lang="ts">
  import { Pagination as PaginationPrimitive } from "bits-ui";
  import ChevronLeftIcon from "@lucide/svelte/icons/chevron-left";

  let {
    ref = $bindable(null),
    class: className,
    ...restProps
  }: PaginationPrimitive.PrevButtonProps = $props();
</script>

<PaginationPrimitive.PrevButton
  bind:ref
  aria-label="Go to previous page"
  data-ui-component="pagination"
  data-ui-part="pagination-previous"
  data-slot="pagination-previous"
  class={className}
  {...restProps}
>
  <ChevronLeftIcon data-icon="inline-start" />
  <span class="cn-pagination-previous-text">Previous</span>
</PaginationPrimitive.PrevButton>
