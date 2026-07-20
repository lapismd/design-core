<script module lang="ts">
  import { defineMeta } from "@storybook/addon-svelte-csf";
  import FormPlaceholder from "../form-placeholder/FormPlaceholder.svelte";
  import CollapsibleItemList from "./CollapsibleItemList.svelte";

  const { Story } = defineMeta({
    title: "UI Forms/Collapsible Item List",
    component: CollapsibleItemList,
    parameters: {
      docs: {
        description: {
          component: "Visual variations for Docs.",
        },
      },
    },
  });
</script>

<Story
  name="With items"
  exportName="WithItems"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Open list with two items." },
    },
  }}
>
  {#snippet template()}
    <CollapsibleItemList title="Items" count={2} addLabel="item" open={true}>
      <FormPlaceholder>
        <ul class="m-0 flex list-none flex-col gap-1 p-0 text-sm">
          <li>Alpha</li>
          <li>Beta</li>
        </ul>
      </FormPlaceholder>
    </CollapsibleItemList>
  {/snippet}
</Story>

<Story
  name="Empty open"
  exportName="EmptyOpen"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Open empty list — add affordance only, no filler copy." },
    },
  }}
>
  {#snippet template()}
    <CollapsibleItemList title="Items" count={0} addLabel="item" open={true} />
  {/snippet}
</Story>

<Story
  name="Collapsed"
  exportName="Collapsed"
  tags={["skip-visual"]}
  parameters={{
    docs: {
      description: { story: "Collapsed header with count." },
    },
  }}
>
  {#snippet template()}
    <CollapsibleItemList title="Items" count={3} addLabel="item" open={false} />
  {/snippet}
</Story>
