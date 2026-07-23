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
  class="mx-0 w-full justify-center sm:w-auto"
  data-page-pagination
>
  {#snippet children({ pages, currentPage })}
    <Pagination.Content class="gap-0.5">
      <Pagination.Item>
        <Pagination.Previous {disabled} class="size-8 px-0" />
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
        <Pagination.Next {disabled} class="size-8 px-0" />
      </Pagination.Item>
    </Pagination.Content>
  {/snippet}
</Pagination.Root>
