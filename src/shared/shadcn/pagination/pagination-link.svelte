<script lang="ts">
  import { Pagination as PaginationPrimitive } from "bits-ui";
  import { type ButtonSize } from "../button/index.js";
  let {
    ref = $bindable(null),
    class: className,
    size = "icon",
    isActive,
    page,
    children,
    ...restProps
  }: PaginationPrimitive.PageProps & {
    size?: ButtonSize;
    isActive: boolean;
  } = $props();
</script>

{#snippet Fallback()}
  {page.value}
{/snippet}

<PaginationPrimitive.Page
  bind:ref
  {page}
  aria-current={isActive ? "page" : undefined}
  data-ui-component="pagination"
  data-ui-part="pagination-link"
  data-slot="pagination-link"
  data-active={isActive}
  data-size={size}
  class={className}
  {...restProps}
>
  {#if children}
    {@render children?.()}
  {:else}
    {@render Fallback()}
  {/if}
</PaginationPrimitive.Page>
