<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import SearchFilterBar from "./SearchFilterBar.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Search Filter Bar",
    component: SearchFilterBar,
    parameters: {
      docs: {
        description: {
          component:
            "Search chrome with optional filter slot. Domain query syntax belongs in the app.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let value = $state("");
</script>

<Story
  name="Updates the query"
  play={async ({ canvas }) => {
    const input = canvas.getByRole("searchbox", { name: "Search documents" });
    await userEvent.type(input, "design");
    await expect(canvas.getByRole("status")).toHaveTextContent("design");
  }}
>
  {#snippet template()}
    <div class="max-w-xl">
      <SearchFilterBar
        {value}
        ariaLabel="Search documents"
        onValueChange={(next) => {
          value = next;
        }}
      />
      <output class="text-muted-foreground mt-2 block text-sm">
        {value || "empty"}
      </output>
    </div>
  {/snippet}
</Story>
