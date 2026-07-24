<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import * as Pagination from "./index.js";

  const { Story } = defineMeta({
    title: "Shadcn/Navigation/Pagination",
    component: Pagination.Root,
    parameters: {
      docs: {
        description: {
          component: "Page navigation with previous, next, and page links.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let page = $state(2);
</script>

<Story
  name="Navigates pages"
  play={async ({ canvas }) => {
    await expect(canvas.getByLabelText("pagination")).toBeVisible();
    await userEvent.click(
      canvas.getByRole("button", { name: "Go to next page" }),
    );
    await expect(canvas.getByText("Page 3 of 10")).toBeVisible();
  }}
  tags={["visual-pending"]}

  parameters={{
    visualDelta: {"images":["/visual-baselines/shadcn/pagination/navigates-pages-chromium-darwin.png"],"opacity":0.5,"colorInversion":false,"align":"canvas","placement":"right","passThresholdPercent":0.1},
  }}
>
  {#snippet template()}
    <div class="flex flex-col items-center gap-3">
      <Pagination.Root
        count={10}
        perPage={1}
        {page}
        onPageChange={(next) => (page = next)}
      >
        {#snippet children({ pages, currentPage })}
          <Pagination.Content>
            <Pagination.Item>
              <Pagination.Previous />
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
                    isActive={currentPage === pageItem.value}
                  >
                    {pageItem.value}
                  </Pagination.Link>
                </Pagination.Item>
              {/if}
            {/each}
            <Pagination.Item>
              <Pagination.Next />
            </Pagination.Item>
          </Pagination.Content>
        {/snippet}
      </Pagination.Root>
      <output class="text-muted-foreground text-sm">Page {page} of 10</output>
    </div>
  {/snippet}
</Story>
