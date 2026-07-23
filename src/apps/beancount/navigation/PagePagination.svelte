<script lang="ts">
  import { MediaQuery } from "svelte/reactivity";
  import * as Pagination from "@stevejuma/ui/shadcn/pagination";

  let {
    page,
    pageCount,
    ariaLabel = "Pages",
    disabled = false,
    onPageChange,
  }: {
    page: number;
    pageCount: number;
    ariaLabel?: string;
    disabled?: boolean;
    onPageChange: (page: number) => void;
  } = $props();

  const desktop = new MediaQuery("(min-width: 640px)");
</script>

<Pagination.Root
  count={Math.max(1, pageCount)}
  perPage={1}
  {page}
  siblingCount={desktop.current ? 1 : 0}
  onPageChange={(nextPage) => {
    if (!disabled && nextPage !== page) onPageChange(nextPage);
  }}
  aria-label={ariaLabel}
  class="bc-page-pagination"
  data-page-pagination
>
  {#snippet children({ pages, currentPage })}
    <Pagination.Content class="bc-page-pagination__content">
      <Pagination.Item>
        <Pagination.Previous {disabled} class="bc-page-pagination__edge" />
      </Pagination.Item>
      {#each pages as pageItem (pageItem.key)}
        {#if pageItem.type === "ellipsis"}
          <Pagination.Item>
            <Pagination.Ellipsis />
          </Pagination.Item>
        {:else}
          <Pagination.Item>
            <Pagination.Link
              page={pageItem}
              size="icon-sm"
              isActive={currentPage === pageItem.value}
              {disabled}
            >
              {pageItem.value}
            </Pagination.Link>
          </Pagination.Item>
        {/if}
      {/each}
      <Pagination.Item>
        <Pagination.Next {disabled} class="bc-page-pagination__edge" />
      </Pagination.Item>
    </Pagination.Content>
  {/snippet}
</Pagination.Root>

<style>
  :global(.bc-page-pagination) {
    width: 100%;
    margin-inline: 0;
    justify-content: center;
  }

  :global(.bc-page-pagination__content) {
    gap: calc(var(--ui-beancount-space-1) / 2);
  }

  :global(.bc-page-pagination__edge) {
    width: var(--ui-beancount-compact-control-height);
    height: var(--ui-beancount-compact-control-height);
    padding-inline: 0;
  }

  @media (min-width: 640px) {
    :global(.bc-page-pagination) {
      width: auto;
    }
  }
</style>
