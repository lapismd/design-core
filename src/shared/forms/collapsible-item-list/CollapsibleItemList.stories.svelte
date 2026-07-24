<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import { expect, userEvent } from "storybook/test";
  import FormPlaceholder from "../form-placeholder/FormPlaceholder.svelte";
  import CollapsibleItemList from "./CollapsibleItemList.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Layout/Collapsible Item List",
    component: CollapsibleItemList,
    parameters: {
      docs: {
        description: {
          component:
            "Expandable list of repeated form entries with an add action.",
        },
      },
    },
  });
</script>

<script lang="ts">
  let items = $state(["Alpha", "Beta"]);
</script>

<Story
  name="Adds an item"
  play={async ({ canvas }) => {
    await userEvent.click(canvas.getByRole("button", { name: "Add item" }));
    await expect(canvas.getByText("Gamma")).toBeVisible();
  }}

  tags={["visual-ready"]}
>
  {#snippet template()}
    <CollapsibleItemList
      title="Items"
      count={items.length}
      addLabel="item"
      onAdd={() => {
        items = [...items, "Gamma"];
      }}
    >
      {#snippet children()}
        <FormPlaceholder>
          <ul class="flex flex-col gap-1 text-sm">
            {#each items as item (item)}
              <li>{item}</li>
            {/each}
          </ul>
        </FormPlaceholder>
      {/snippet}
    </CollapsibleItemList>
  {/snippet}
</Story>
