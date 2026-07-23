<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import PagePagination from "./PagePagination.svelte";

  const { Story } = defineMeta({
    title: "Apps/Beancount/Navigation/Page Pagination",
    component: PagePagination,
    parameters: {
      docs: {
        description: {
          component:
            "Responsive pagination for result tables and other paged collections. Keep page state in the parent and render the current result page beside the control so filtering and pagination remain observable.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let page = $state(1);
</script>

<Story
  name="Changes the result page"
  play={async ({ canvas }) => {
    await userEvent.click(
      canvas.getByRole("button", { name: "Go to next page" }),
    );
    await expect(canvas.getByRole("status")).toHaveTextContent("Page 2");
  }}
>
  {#snippet template()}
    <div class="flex flex-col items-start gap-3">
      <PagePagination
        {page}
        pageCount={5}
        ariaLabel="Transaction pages"
        onPageChange={(value) => {
          page = value;
        }}
      />
      <output class="text-muted-foreground text-sm" aria-live="polite">
        Page {page}
      </output>
    </div>
  {/snippet}
</Story>

<Story name="Prevents navigation while disabled">
  {#snippet template()}
    <PagePagination
      page={2}
      pageCount={5}
      ariaLabel="Disabled transaction pages"
      disabled
      onPageChange={() => {}}
    />
  {/snippet}
</Story>
